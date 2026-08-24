#!/usr/bin/env python3
"""PWA用のアプリアイコンを assets/logo.png から生成する。

- 通常アイコン(any): ロゴをそのままリサイズ。角丸込みで完成したデザインなので尊重する
- maskable: Androidの円/角丸マスクで切れないよう、ロゴを安全領域(中央80%)に収めて余白を足す
- apple-touch-icon: iOS用(iOSはmanifestのiconsを見ずこれを使う)

使い方:
    python3 tools/build-icons.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "logo.png"
OUT = ROOT / "icons"
OUT.mkdir(exist_ok=True)

# ロゴの地色(余白を足すときに使う)
PAPER = (250, 248, 244)


def load_logo():
    img = Image.open(SRC).convert("RGB")
    # 正方形でなければ中央でトリミング
    if img.width != img.height:
        side = min(img.size)
        left = (img.width - side) // 2
        top = (img.height - side) // 2
        img = img.crop((left, top, left + side, top + side))
    return img


def plain(size):
    return load_logo().resize((size, size), Image.LANCZOS)


def symbol_bbox(img, step=4):
    """有彩色の範囲からロゴマーク(C+S)の位置を割り出す。文字は無彩色なので拾われない"""
    px = img.load()
    w, h = img.size
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(0, h, step):
        for x in range(0, w, step):
            r, g, b = px[x, y]
            if max(r, g, b) - min(r, g, b) > 60 and max(r, g, b) > 80:
                minx, maxx = min(minx, x), max(maxx, x)
                miny, maxy = min(miny, y), max(maxy, y)
    return minx, miny, maxx, maxy


def symbol_only(size, pad=0.10):
    """小さく表示する用: 文字を落としてロゴマークだけにする(32pxでは文字が潰れるため)"""
    img = load_logo()
    x0, y0, x1, y1 = symbol_bbox(img)
    side = round(max(x1 - x0, y1 - y0) * (1 + pad * 2))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    left, top = cx - side // 2, cy - side // 2

    # 元画像から切り出すのではなく地色のキャンバスに置く。
    # これで切り出し枠が文字にかかっても、文字が写り込まない
    canvas = Image.new("RGB", (side, side), PAPER)
    sym = img.crop((x0, y0, x1, y1))
    canvas.paste(sym, ((side - sym.width) // 2, (side - sym.height) // 2))
    return canvas.resize((size, size), Image.LANCZOS)


def maskable(size, safe=0.8):
    """マスクで切られても欠けないよう、中央80%にロゴを収める"""
    canvas = Image.new("RGB", (size, size), PAPER)
    inner = round(size * safe)
    logo = load_logo().resize((inner, inner), Image.LANCZOS)
    offset = (size - inner) // 2
    canvas.paste(logo, (offset, offset))
    return canvas


for size in (192, 512):
    plain(size).save(OUT / f"icon-{size}.png")
    print(f"icons/icon-{size}.png")

maskable(512).save(OUT / "icon-maskable-512.png")
print("icons/icon-maskable-512.png")

plain(180).save(OUT / "apple-touch-icon.png")
print("icons/apple-touch-icon.png")

# ブラウザタブ用のfavicon(小さいので文字は落とし、ロゴマークだけにする)
for size in (32, 180):
    symbol_only(size).save(OUT / f"favicon-{size}.png")
    print(f"icons/favicon-{size}.png")
