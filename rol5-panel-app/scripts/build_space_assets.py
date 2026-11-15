"""Genera los recursos de la entrada espacial (globo, estrellas). Se corre una vez; el resultado se versiona.

  python scripts/build_space_assets.py --texture earth-blue-marble.jpg --stars stars.6.json --lines constellations.lines.json --night earth-night.jpg

Entradas (todas de uso libre):
  * Blue Marble, NASA Earth Observatory (dominio público), 4096x2048 equirrectangular.
    Se obtuvo empaquetada en el paquete npm three-globe (example/img/earth-blue-marble.jpg).
  * Catálogo de estrellas hasta magnitud 6 y líneas de constelaciones, de d3-celestial (BSD-3-Clause),
    derivado de Hipparcos / Yale Bright Star. Coordenadas J2000 (ascensión recta y declinación).
Salidas:
  * public/earth/{z}/{x}/{y}.jpg: teselas Web Mercator 256 px, niveles 0 a 4 (4096 px de ancho = la resolución de la fuente).
  * public/earth-night/{z}/{x}/{y}.jpg: luces nocturnas (NASA Black Marble, dominio público), niveles 0 a 3; solo se usan con el globo lejos.
  * public/sky/stars.json: {"stars": [[ra_deg, dec_deg, mag, b-v]...], "lines": [[[ra, dec]...]...]}
No calcula nada científico: solo reproyecta una imagen y compacta un catálogo.
"""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates

ROOT = Path(__file__).resolve().parent.parent
MAX_Z = 4


def tiles(src: Path, out: Path, max_z: int = MAX_Z):
    img = np.asarray(Image.open(src).convert("RGB"), dtype=np.float32)
    h, w, _ = img.shape
    px = (np.arange(256) + 0.5) / 256
    n_files = 0
    for z in range(max_z + 1):
        n = 2 ** z
        for ty in range(n):
            lat = np.degrees(np.arctan(np.sinh(np.pi * (1 - 2 * (ty + px) / n))))
            v = (90 - lat) / 180 * h - 0.5
            for tx in range(n):
                lon = (tx + px) / n * 360 - 180
                u = (lon + 180) / 360 * w - 0.5
                vv, uu = np.meshgrid(v, u, indexing="ij")
                chans = [map_coordinates(img[:, :, c], [vv, uu], order=1, mode="grid-wrap") for c in range(3)]
                tile = np.clip(np.stack(chans, axis=-1), 0, 255).astype(np.uint8)
                d = out / str(z) / str(tx)
                d.mkdir(parents=True, exist_ok=True)
                Image.fromarray(tile).save(d / f"{ty}.jpg", quality=84, optimize=True, progressive=True)
                n_files += 1
    return n_files


def sky(stars: Path, lines: Path, out: Path):
    s = json.loads(stars.read_text(encoding="utf-8"))["features"]
    st = []
    for f in s:
        ra, dec = f["geometry"]["coordinates"]
        st.append([round(ra % 360, 3), round(dec, 3), round(float(f["properties"]["mag"]), 1), round(float(f["properties"].get("bv") or 0.6), 2)])
    st.sort(key=lambda r: r[2])
    ln = []
    for f in json.loads(lines.read_text(encoding="utf-8"))["features"]:
        for seg in f["geometry"]["coordinates"]:
            ln.append([[round(a % 360, 2), round(b, 2)] for a, b in seg])
    out.write_text(json.dumps({"stars": st, "lines": ln}, separators=(",", ":")), encoding="utf-8")
    return len(st), len(ln)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--texture", required=True)
    ap.add_argument("--stars", required=True)
    ap.add_argument("--lines", required=True)
    ap.add_argument("--night", help="luces nocturnas (Black Marble, NASA; three-globe example/img/earth-night.jpg): teselas 0 a 3 en public/earth-night")
    a = ap.parse_args()
    nt = tiles(Path(a.texture), ROOT / "public" / "earth")
    (ROOT / "public" / "sky").mkdir(parents=True, exist_ok=True)
    ns, nl = sky(Path(a.stars), Path(a.lines), ROOT / "public" / "sky" / "stars.json")
    if a.night:
        print("teselas nocturnas:", tiles(Path(a.night), ROOT / "public" / "earth-night", 3))
    print(f"teselas: {nt} · estrellas: {ns} · segmentos de constelación: {nl}")


if __name__ == "__main__":
    main()
