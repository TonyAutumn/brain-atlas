"""Build all 200 Schaefer cortical parcels and exact Yeo 7/17 memberships.

Requires numpy/scipy. Sources are pinned and checked before meshing. Existing
anatomical assets are never read or rewritten. Run from any working directory.
"""
from pathlib import Path
import gzip
from itertools import product
import hashlib
import json
import struct
import urllib.request
import numpy as np
from atlas_mesh import surface

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT.parent / 'schaefer-sources'
COMMIT = '1735ecc7c2e91ceac51f5e3da31d2ef59c8856ae'
BASE = 'https://raw.githubusercontent.com/ThomasYeoLab/CBIG/' + COMMIT + '/stable_projects/brain_parcellation/Schaefer2018_LocalGlobal/Parcellations/MNI/'
HASHES = {
    'Schaefer2018_200Parcels_7Networks_order_FSLMNI152_1mm.nii.gz': 'a47808f907f175f2e83f2c941bc68a766a8991b238e98457e9d27a8760ea21ec',
    'Schaefer2018_200Parcels_17Networks_order_FSLMNI152_1mm.nii.gz': '360d582d9cc12946a1f6eb7fc3a79789d04bbba43f14376920f02011611034f6',
    'freeview_lut/Schaefer2018_200Parcels_7Networks_order.txt': '42927810db2d272189c63c08927f8b2b4c9eac402f26e08e80d5ce70e7dd29f9',
    'freeview_lut/Schaefer2018_200Parcels_17Networks_order.txt': '8b6f9643d8ba87e12062b22e164e82835a18ee63055119f92ce2ca5c6688dc95',
}

def read_nifti(path):
    b = gzip.decompress(path.read_bytes())
    assert struct.unpack_from('<i', b, 0)[0] == 348
    assert struct.unpack_from('<h', b, 70)[0] == 16  # float32
    assert struct.unpack_from('<h', b, 254)[0] > 0
    assert (b[123] & 7) == 2  # millimetres
    assert struct.unpack_from('<f', b, 112)[0] in (0, 1)
    shape = struct.unpack_from('<8h', b, 40)[1:4]
    offset = int(struct.unpack_from('<f', b, 108)[0])
    data = np.frombuffer(b, dtype='<f4', offset=offset, count=np.prod(shape)).reshape(shape, order='F')
    assert np.array_equal(data, data.astype(np.uint16))
    aff = np.eye(4)
    aff[:3] = np.array(struct.unpack_from('<12f', b, 280)).reshape(3, 4)
    return data.astype(np.uint16), aff

def main():
    CACHE.mkdir(exist_ok=True)
    for source, expected in HASHES.items():
        path = CACHE / Path(source).name
        if not path.exists():
            path.write_bytes(urllib.request.urlopen(BASE + source, timeout=45).read())
        assert hashlib.sha256(path.read_bytes()).hexdigest() == expected, source
    images = [read_nifti(CACHE / f'Schaefer2018_200Parcels_{n}Networks_order_FSLMNI152_1mm.nii.gz') for n in (7, 17)]
    a, aff = images[0]
    b, aff17 = images[1]
    assert np.array_equal(aff, aff17) and a.shape == b.shape
    assert np.array_equal(a > 0, b > 0)
    luts = []
    for n in (7, 17):
        rows = [line.split() for line in (CACHE / f'Schaefer2018_200Parcels_{n}Networks_order.txt').read_text().splitlines()]
        luts.append({int(row[0]): row[1] for row in rows})
    entries, files, matched = [], [], set()
    for side, network in product(('L', 'R'), ('Vis', 'SomMot', 'DorsAttn', 'SalVentAttn', 'Limbic', 'Cont', 'Default')):
        packed = bytearray()
        filename = f'schaefer200-{side}-{network}.bin.gz'
        for label in range(1, 201):
            name = luts[0][label]
            if name.split('_')[1] != side + 'H' or name.split('_')[2] != network:
                continue
            mask = a == label
            counterpart = np.unique(b[mask])
            assert len(counterpart) == 1 and counterpart[0] > 0
            label17 = int(counterpart[0])
            assert np.array_equal(mask, b == label17), '7/17 masks must be identical, not approximate overlap'
            assert label17 not in matched
            matched.add(label17)
            name17 = luts[1][label17]
            assert name17.split('_')[1] == side + 'H'
            v, f = surface(mask, aff)
            assert len(v) < 65536
            assert (v[:, 0].mean() < 0) == (side == 'L')
            positions = np.rint(v / .05).astype('<i2').tobytes()
            indices = f.astype('<u2').tobytes()
            entry = dict(id=f'schaefer200-{side}-{label}', atlas='schaefer200', category='functional',
                name=name, label=label, hemisphere=side, network7=name.split('_')[2],
                name17=name17, label17=label17, network17=name17.split('_')[2],
                voxelCount=int(mask.sum()), voxelMaskSha256=hashlib.sha256(np.packbits(mask).tobytes()).hexdigest(),
                center=np.round(v.mean(0), 2).tolist(), bounds=[np.round(v.min(0), 2).tolist(), np.round(v.max(0), 2).tolist()],
                vertices=len(v), triangles=len(f), positionScale=.05, positionType='int16', indexType='uint16',
                positionOffset=len(packed), indexOffset=len(packed) + len(positions), file=filename)
            entries.append(entry)
            packed.extend(positions + indices)
        compressed = gzip.compress(bytes(packed), compresslevel=9, mtime=0)
        (ROOT / 'anatomy/data' / filename).write_bytes(compressed)
        files.append(dict(name=filename, bytes=len(compressed), sha256=hashlib.sha256(compressed).hexdigest(), ids=[e['id'] for e in entries if e['file'] == filename]))
        print(side, network, len(compressed), 'bytes', flush=True)
    assert matched == set(range(1, 201)) and len(entries) == 200
    manifest = dict(version='2026-09-30.2', atlas='Schaefer2018 200 parcels', entries=entries, files=files)
    (ROOT / 'anatomy/data/functional-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + '\n')
    provenance = dict(sourceCommit=COMMIT, coordinateSpace='FSL MNI152 1mm', sourceShape=list(a.shape), affine=aff.tolist(),
        affineField='sform', units='mm', sourceVoxelCount=int((a > 0).sum()), parcelCount=200,
        membership='Exact voxel-mask bijection between the official 7-network and 17-network orderings; every cortical source voxel and all 200 labels retained.',
        sources=[dict(url=BASE + p, sha256=h) for p, h in HASHES.items()],
        citations=['https://doi.org/10.1093/cercor/bhx179', 'https://doi.org/10.1152/jn.00338.2011'],
        method='Exposed voxel faces; four Taubin pairs (0.5, -0.53); source sform applied once; 0.05 mm vertex quantization. No invented nodes or parcel-to-anatomy overlap thresholds.',
        limitations='Cortical group reference only; no subcortex or cerebellum. Yeo 7 and 17 assignments are not a strict hierarchy. FSL MNI152 differs from other displayed atlas templates; overlays are spatial references, not subject-level registration or experimental activation.',
        license='MIT; see SCHAEFER-LICENSE.txt')
    (ROOT / 'anatomy/functional-provenance.json').write_text(json.dumps(provenance, indent=2) + '\n')
    print('Built all 200 parcels; exact 7/17 membership bijection verified.')

if __name__ == '__main__':
    main()
