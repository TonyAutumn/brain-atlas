"""Shared display meshing; retains source affines and adds no anatomical detail."""
import numpy as np
from scipy import sparse

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
 # Smoothing is performed in the source voxel grid. Symmetric shrink/expand smoothing
 # reduces voxel stair steps without claiming extra acquisition resolution.
 edges=np.concatenate([f[:,[0,1]],f[:,[1,2]],f[:,[2,0]]]);edges=np.concatenate([edges,edges[:,::-1]])
 adjacency=sparse.coo_matrix((np.ones(len(edges)),(edges[:,0],edges[:,1])),shape=(len(v),len(v))).tocsr()
 adjacency.data[:]=1;degree=np.asarray(adjacency.sum(1)).ravel();degree[degree==0]=1
 for _ in range(4):
  for lam in [.5,-.53]:v+=lam*(adjacency@v/degree[:,None]-v)
 v=v@aff[:3,:3].T+aff[:3,3]
 if np.linalg.det(aff[:3,:3])<0:f=f[:,::-1]
 return v.astype('<f4'),f.astype('<u4')
