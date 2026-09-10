"""Build atlas surfaces from pinned source images; numpy/scipy only.

Input: ../brain-assets (downloaded original files). Output: anatomy/data.
NIfTI sform affine is applied once, preserving source MNI millimetres.
Label surfaces use exposed voxel faces and 4 Taubin smoothing pairs;
these are display meshes, not new anatomical segmentations.
"""
from pathlib import Path
import json,gzip,struct,hashlib,re,base64
import numpy as np
from scipy import sparse

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT.parent/'brain-assets'
OUT=ROOT/'anatomy/data'
OUT.mkdir(parents=True,exist_ok=True)

def nifti(path):
 b=gzip.decompress(path.read_bytes()); assert struct.unpack_from('<i',b)[0]==348
 shape=struct.unpack_from('<8h',b,40)[1:4]; typ=struct.unpack_from('<h',b,70)[0]
 offset=int(struct.unpack_from('<f',b,108)[0]);aff=np.eye(4)
 assert struct.unpack_from('<h',b,254)[0]>0
 aff[:3]=np.array(struct.unpack_from('<12f',b,280)).reshape(3,4)
 if typ==2: a=np.frombuffer(b,np.uint8,count=np.prod(shape),offset=offset).reshape(shape,order='F')
 elif typ==2304:a=np.frombuffer(b,np.uint8,count=np.prod(shape)*4,offset=offset).reshape((*shape,4),order='F')
 else:raise ValueError(typ)
 return a,aff

def mz3(path):
 b=path.read_bytes();b=gzip.decompress(b) if b[:2]==b'\x1f\x8b' else b
 magic,attr,nf,nv,skip=struct.unpack_from('<HHIII',b);assert magic==23117
 meta=json.loads(b[16:16+skip]) if skip and attr&64 else None
 off=16+skip;f=np.frombuffer(b,'<u4',nf*3,off).reshape(-1,3).copy();off+=nf*12
 v=np.frombuffer(b,'<f4',nv*3,off).reshape(-1,3).copy();off+=nv*12
 if attr&4:off+=nv*4
 s=np.frombuffer(b,'<f4',nv,off).copy() if attr&8 else None
 return v,f,s,meta

def surface(mask,aff):
 locations=np.argwhere(mask)
 lo=np.maximum(locations.min(0)-1,0);hi=np.minimum(locations.max(0)+2,mask.shape)
 a=mask[tuple(slice(l,h) for l,h in zip(lo,hi))]
 verts=[];faces=[];nv=0
 for axis in range(3):
  other=[j for j in range(3) if j!=axis]
  for sign in [-1,1]:
   near=np.roll(a,-sign,axis=axis);edge=[slice(None)]*3;edge[axis]=-1 if sign==1 else 0;near[tuple(edge)]=False
   p=np.argwhere(a&~near)
   if not len(p):continue
   corners=np.zeros((4,3),int);corners[:,axis]=sign
   corners[:,other[0]]=[-1,1,1,-1];corners[:,other[1]]=[-1,-1,1,1]
   if np.cross(corners[1]-corners[0],corners[2]-corners[0])[axis]*sign<0:corners=corners[::-1]
   vs=(2*(p+lo)[:,None,:]+corners[None,:,:]).reshape(-1,3)
   inds=np.arange(nv,nv+len(vs)).reshape(-1,4)
   fs=np.concatenate((inds[:,[0,1,2]],inds[:,[0,2,3]]))
   verts.append(vs);faces.append(fs);nv+=len(vs)
 verts=np.concatenate(verts);faces=np.concatenate(faces)
 v,inv=np.unique(verts,axis=0,return_inverse=True);f=inv[faces];v=v.astype(float)/2
 # The isotropic source grid is 1 mm. Symmetric shrink/expand smoothing
 # reduces voxel stair steps without claiming extra acquisition resolution.
 edges=np.concatenate([f[:,[0,1]],f[:,[1,2]],f[:,[2,0]]]);edges=np.concatenate([edges,edges[:,::-1]])
 adjacency=sparse.coo_matrix((np.ones(len(edges)),(edges[:,0],edges[:,1])),shape=(len(v),len(v))).tocsr()
 adjacency.data[:]=1;degree=np.asarray(adjacency.sum(1)).ravel();degree[degree==0]=1
 for _ in range(4):
  for lam in [.5,-.53]:v+=lam*(adjacency@v/degree[:,None]-v)
 v=v@aff[:3,:3].T+aff[:3,3]
 if np.linalg.det(aff[:3,:3])<0:f=f[:,::-1]
 return v.astype('<f4'),f.astype('<u4')

def subset(v,f,keep):
 faces=f[keep];ids,inv=np.unique(faces,return_inverse=True)
 return v[ids],inv.reshape(-1,3).astype('<u4')

groups={};entries=[]
def add(id,name,hemi,atlas,category,v,f,label=None,color=None):
 assert np.isfinite(v).all() and f.max()<len(v) and len(v)>3
 centre=v.mean(0)
 entry=dict(id=id,name=name,hemisphere=hemi,atlas=atlas,category=category,label=label,
            center=np.round(centre,2).tolist(),bounds=[np.round(v.min(0),2).tolist(),np.round(v.max(0),2).tolist()],
            vertices=len(v),triangles=len(f),color=color)
 key='shell' if atlas=='surface' else atlas+'-'+hemi+'-'+category
 groups.setdefault(key,[]).append((entry,v,f));entries.append(entry)

labels=json.loads((SRC/'julich-labels.json').read_text())
def category(s):
 if 'Hippocamp' in s:return 'hippocampus'
 if 'Amygdala' in s:return 'amygdala'
 if any(x in s for x in ['Thalamus','Metathalamus']):return 'thalamus'
 if 'Cerebellum' in s:return 'cerebellum'
 if any(x in s for x in ['Midbrain','Subthalamus']):return 'midbrain'
 if any(x in s for x in ['Striatum','Forebrain','Pallidum']):return 'basal'
 return 'cortex'

for hemi in ['L','R']:
 a,aff=nifti(SRC/f'julich-{hemi.lower()}.nii.gz')
 ids=np.unique(a);done=0
 for i in ids:
  name=labels['labels'][int(i)]
  if i==0 or 'GapMap' in name:continue
  v,f=surface(a==i,aff)
  add(f'julich-{hemi}-{i}',name,hemi,'julich',category(name),v,f,int(i),[labels[c][i] for c in ['R','G','B']])
  done+=1
 print('Julich',hemi,done,flush=True)

v,f,s,meta=mz3(SRC/'cit168.mz3');cit=json.loads((SRC/'cit-labels.json').read_text())
for i in np.unique(s).astype(int):
 if i==0:continue
 vv,ff=subset(v,f,np.all(s[f]==i,axis=1));name=cit['labels'][i]
 cat='midbrain' if any(x in name for x in ['Nigra','Red Nucleus','Tegmental','Pigmented']) else 'basal'
 if any(x in name for x in ['Hypothalamus','Mammillary','Habenular']):cat='diencephalon'
 if 'Amygdala' in name:cat='amygdala'
 add(f'cit-{i}',name,name[0],'cit168',cat,vv,ff,int(i),[cit[c][i] for c in ['R','G','B']])
print('CIT',len(np.unique(s)),flush=True)

# Macroanatomical surface is independent of atlas region ownership.
v,f,_,_=mz3(SRC/'cortex2009.mz3')
for hemi,keep in [('L',v[f].mean(1)[:,0]<0),('R',v[f].mean(1)[:,0]>=0)]:
 vv,ff=subset(v,f,keep);add('shell-'+hemi,'ICBM152 2009 reference surface',hemi,'surface','shell',vv,ff)

# AAL cerebellar lobules complement the cytoarchitectonic deep cerebellar nuclei.
a,aff=nifti(SRC/'aal.nii.gz');lab=json.loads((SRC/'aal-labels.json').read_text())
for i,name in enumerate(lab['labels']):
 if not any(x in name for x in ['Cerebelum','Cerebellum','Vermis']):continue
 if i not in a:continue
 v,f=surface(a==i,aff);hemi='L' if name.endswith('_L') else 'R' if name.endswith('_R') else 'M'
 add(f'aal-{i}',name,hemi,'aal','cerebellum',v,f,i)
print('Total entries',len(entries),flush=True)

files=[]
for key,items in groups.items():
 # One independent package per anatomical group; large groups split at ~700 kB gzip.
 batches=[items] if len(items)<25 else [items[j:j+20] for j in range(0,len(items),20)]
 for part,batch in enumerate(batches):
  chunks=[];off=0;idx=[]
  for entry,v,f in batch:
   assert f.max()<65536
   pos=np.rint(v*20).astype('<i2').tobytes();tri=f.astype('<u2').tobytes()
   entry['positionScale']=.05;entry['positionType']='int16';entry['indexType']='uint16'
   entry['positionOffset']=off;off+=len(pos);entry['indexOffset']=off;off+=len(tri)
   chunks.extend([pos,tri]);idx.append(entry['id'])
  fname=f'{key}-{part}.bin.gz';data=gzip.compress(b''.join(chunks),compresslevel=9,mtime=0)
  (OUT/fname).write_bytes(data)
  for entry,_,_ in batch:entry['file']=fname
  files.append(dict(name=fname,bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),ids=idx))
manifest=dict(version='2026-09-10.2',coordinateSystem='MNI millimetres; source affines preserved',
             notes='Atlas versions retain their own reference-template limitations. Smoothed surfaces are derived visualizations, not single-neuron reconstructions.',
             entries=entries,files=files)
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')))
print('Files',len(files),'Compressed MB',sum(f['bytes'] for f in files)/1e6,'Triangles',sum(e['triangles'] for e in entries),flush=True)
