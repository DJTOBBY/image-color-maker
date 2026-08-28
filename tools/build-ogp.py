#!/usr/bin/env python3
"""SNSに貼ったときに出るカード画像(1200×630)を作る。

アプリの見た目に合わせる: 生成りの地、明朝の見出し、実際のパレット帯。
帯の色は辞書から取らず、代表的なテーマの色をここに書いておく
(生成の仕組みを通さずに済み、毎回同じ絵になる)。

  python3 tools/build-ogp.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "icons/ogp.png")
W, H = 1200, 630
BG = "#F7F4EC"
INK = "#2B2926"
SOFT = "#8C8378"

SERIF = "/System/Library/Fonts/Supplemental/Times New Roman.ttf"
MINCHO = "/System/Library/Fonts/ヒラギノ明朝 ProN.ttc"
GOTHIC = "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc"

# TOKYO NIGHT / KYOTO AUTUMN / SETOUCHI SEA から拾った実際の出力色
BANDS = [
    ["#E8607F", "#2A6E7A", "#1B2A4A", "#D9C9A8", "#7A3B52"],
    ["#C89D45", "#BA5320", "#5A903F", "#9B2A3D", "#643A7A"],
    ["#4ABFDC", "#E6DABE", "#2A8439", "#1B457C", "#5683DD"],
]


def font(path, size, index=0):
    return ImageFont.truetype(path, size, index=index)


def center(draw, y, text, f, fill):
    w = draw.textbbox((0, 0), text, font=f)[2]
    draw.text(((W - w) / 2, y), text, font=f, fill=fill)


def main():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # 上下に細い罫。紙の資料らしさを出す
    d.rectangle([0, 0, W, 6], fill=INK)
    d.rectangle([0, H - 6, W, H], fill=INK)

    center(d, 92, "C O L O R   S T O R Y   P A L E T T E", font(GOTHIC, 26), SOFT)
    center(d, 148, "ことばを、ビーズの色に。", font(MINCHO, 68), INK)
    center(d, 246, "場所・記憶・物語を 2〜8色とトーホービーズの実品番に翻訳する",
           font(GOTHIC, 27), INK)

    # パレット帯を3本。実際の出力色をそのまま並べる
    top, bh, gap = 320, 62, 18
    for row, colors in enumerate(BANDS):
        y = top + row * (bh + gap)
        cw = (W - 200) / len(colors)
        for i, c in enumerate(colors):
            x = 100 + i * cw
            d.rectangle([x, y, x + cw, y + bh], fill=c)

    center(d, 548, "palette.tohobeads.jp", font(SERIF, 30), SOFT)
    center(d, 588, "TOHO BEADS", font(GOTHIC, 22, index=0), INK)

    img.save(OUT, "PNG", optimize=True)
    print(f"{os.path.relpath(OUT, ROOT)}  {W}×{H}  {os.path.getsize(OUT)//1024} KB")


if __name__ == "__main__":
    main()
