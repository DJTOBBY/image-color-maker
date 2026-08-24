#!/usr/bin/env python3
"""PWA用のアプリアイコンを生成する。

資料のデザイン(紙色の地・墨色・パレット帯)をそのままアイコンにする。
maskable版はAndroidの丸/角丸マスクで切れないよう、余白を大きく取る。

使い方:
    python3 tools/build-icons.py
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "icons"
OUT.mkdir(exist_ok=True)

PAPER = "#faf8f4"
INK = "#2b2926"
# 資料のパレット帯から、秋の6色(KYOTO AUTUMN)を象徴として使う
BANDS = ["#c89d45", "#ba5320", "#5a903f", "#9b2a3d", "#915d28", "#643a7a"]


def draw_icon(size, maskable=False):
    img = Image.new("RGB", (size, size), PAPER)
    d = ImageDraw.Draw(img)

    # maskableは安全領域(中央80%)に収める
    inset = size * 0.19 if maskable else size * 0.11
    w = size - inset * 2

    # パレット帯: 6色を縦に積む
    band_h = w / len(BANDS)
    for i, hexv in enumerate(BANDS):
        y0 = inset + i * band_h
        d.rectangle([inset, y0, inset + w, y0 + band_h], fill=hexv)

    # 帯を囲む細い墨の枠(資料の罫線の質感)
    line = max(1, round(size * 0.006))
    d.rectangle([inset, inset, inset + w, inset + w], outline=INK, width=line)

    return img


for size in (192, 512):
    draw_icon(size).save(OUT / f"icon-{size}.png")
    print(f"icons/icon-{size}.png")

draw_icon(512, maskable=True).save(OUT / "icon-maskable-512.png")
print("icons/icon-maskable-512.png")

# Apple用(iOSはmanifestのiconsを使わずapple-touch-iconを見る)
draw_icon(180).save(OUT / "apple-touch-icon.png")
print("icons/apple-touch-icon.png")
