"""Add Allen's pineal body to the shipped atlas without rebuilding existing meshes.

Requires numpy, scipy, nibabel. The full, bilateral official annotation is used;
the accompanying ontology CSV describes the original annotation's voxel counts.
Run from any directory. Source downloads are pinned by SHA-256.
"""
from pathlib import Path
import csv
import gzip
import hashlib
import json
import urllib.request
import nibabel as nib
import numpy as np
from atlas_mesh import surface

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT.parent / 'brain-assets'
BASE = 'https://download.alleninstitute.org/informatics-archive/allen_human_reference_atlas_3d_2020/version_1/'
SOURCES = [
    ('allen-annotation-full.nii.gz', 'annotation_full.nii.gz', '2b05581e39c44f2623d9b0a69f64e3df0823c20d054abef92973812313335dc3'),
    ('allen-voxel-count.csv', 'examples/voxel_count/voxel_count.csv', '7348be087e6c2b6cb1fde1d604761cdd2d70e0e33ded6e1f322db334959d162f'),
]

def main():
    ASSETS.mkdir(exist_ok=True)
    provenance = []
    for name, source, expected in SOURCES:
        path = ASSETS / name
        if not path.exists():
            with urllib.request.urlopen(BASE + source, timeout=45) as response:
                path.write_bytes(response.read())
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != expected:
            raise ValueError(f'Unexpected source bytes: {name}')
        provenance.append({'url': BASE + source, 'sha256': digest})
    with (ASSETS / SOURCES[1][0]).open() as stream:
        ontology = {int(row['id']): row for row in csv.DictReader(stream)}
    assert ontology[10460]['name'] == 'pineal body'
    assert int(float(ontology[10460]['parent_structure_id'])) == 10451
    assert ontology[10451]['name'] == 'epithalamus'
    image = nib.load(ASSETS / SOURCES[0][0])
    assert nib.aff2axcodes(image.affine) == ('R', 'A', 'S')
    assert image.header.get_xyzt_units()[0] == 'mm'
    mask = np.asanyarray(image.dataobj) == 10460
    assert mask.sum() == 792, 'Full bilateral annotation label changed'
    vertices, faces = surface(mask, image.affine)
    assert len(vertices) < 65536
    positions = np.rint(vertices * 20).astype('<i2').tobytes()
    triangles = faces.astype('<u2').tobytes()
    packed = gzip.compress(positions + triangles, compresslevel=9, mtime=0)
    filename = 'allen2020-M-pineal-0.bin.gz'
    (ROOT / 'anatomy/data' / filename).write_bytes(packed)
    entry = dict(id='allen2020-M-10460', name='Pineal body', hemisphere='M',
                 atlas='allen2020', category='diencephalon', label=10460,
                 center=np.round(vertices.mean(0), 2).tolist(),
                 bounds=[np.round(vertices.min(0), 2).tolist(), np.round(vertices.max(0), 2).tolist()],
                 vertices=len(vertices), triangles=len(faces), color=[119, 54, 113],
                 positionScale=.05, positionType='int16', indexType='uint16',
                 positionOffset=0, indexOffset=len(positions), file=filename)
    manifest_path = ROOT / 'anatomy/data/manifest.json'
    manifest = json.loads(manifest_path.read_text())
    manifest['entries'] = [e for e in manifest['entries'] if e['id'] != entry['id']] + [entry]
    manifest['files'] = [f for f in manifest['files'] if f['name'] != filename] + [dict(
        name=filename, bytes=len(packed), sha256=hashlib.sha256(packed).hexdigest(), ids=[entry['id']])]
    manifest['version'] = '2026-09-25.1'
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')))
    provenance = dict(
        atlas='Allen Human Reference Atlas – 3D, 2020', version='1.0.0',
        rrid='SCR_017764', license='CC BY 4.0', copyright='© 2019 Allen Institute for Brain Science',
        citation='Ding SL, Royall JJ, Sunkin SM, Facer BAC, Lesnar P, Bernard A, Ng L, Lein ES (2020). Allen Human Reference Atlas – 3D, 2020.',
        sourcePage='https://community.brain-map.org/t/allen-human-reference-atlas-3d-2020-new/405',
        coordinateSpace='MNI ICBM152 2009b nonlinear symmetric', units='mm',
        affine=image.affine.tolist(), affineField='qform (sform_code=0)',
        voxelSizeMm=list(map(float, image.header.get_zooms()[:3])), sourceShape=list(image.shape),
        sourceLabel=10460, sourceName='pineal body', sourceVoxelCount=int(mask.sum()),
        sourceVolumeMm3=round(float(mask.sum() * abs(np.linalg.det(image.affine[:3, :3]))), 3),
        hemisphere='midline; not split or duplicated', sources=provenance,
        method='Exposed label voxel faces; four Taubin pairs (0.5, -0.53); source affine applied once; 0.05 mm vertex quantization.',
        limitations='A macroanatomical reference segmentation, not a probability map or subject-specific boundary. 2009b symmetric is not identical to the other displayed templates. Smoothing does not increase source resolution.',
        output=entry)
    (ROOT / 'anatomy/pineal-provenance.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + '\n')
    print(f"Added {entry['id']}: {len(vertices)} vertices / {len(faces)} triangles; {len(packed)} bytes; original atlas entries preserved.")

if __name__ == '__main__':
    main()
