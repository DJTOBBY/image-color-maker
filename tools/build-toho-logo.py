#!/usr/bin/env python3
"""TOHO BEADSの公式ロゴを、アプリで使える形に整える。

配布されたSVGは白一色(濃い背景用)なので、そのままだと紙色の地では見えない。
色をCSSから変えられるよう currentColor 版を作り、
念のため紺色の固定版も用意する。

使い方:
    python3 tools/build-toho-logo.py [元のSVG]
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets"
OUT.mkdir(exist_ok=True)

# 公式ロゴの紺(配布JPEGから採取)
TOHO_NAVY = "#0d3c66"


def main():
    src = Path(sys.argv[1] if len(sys.argv) > 1
               else Path.home() / "Downloads" / "site-logo.svg")
    svg = src.read_text(encoding="utf-8")

    # 1) 色をCSSに委ねる版。置く場所の文字色をそのまま継ぐ
    current = svg.replace('fill="#fff"', 'fill="currentColor"')
    (OUT / "toho-logo.svg").write_text(current, encoding="utf-8")

    # 2) 公式の紺で固定した版(色を変えずに使いたい場面用)
    navy = svg.replace('fill="#fff"', f'fill="{TOHO_NAVY}"')
    (OUT / "toho-logo-navy.svg").write_text(navy, encoding="utf-8")

    # 3) 白のまま(濃い背景に置く場面用)
    (OUT / "toho-logo-white.svg").write_text(svg, encoding="utf-8")

    m = re.search(r'viewBox="([\d.\s]+)"', svg)
    print(f"元: {src.name}  viewBox: {m.group(1) if m else '不明'}")
    for name in ("toho-logo.svg", "toho-logo-navy.svg", "toho-logo-white.svg"):
        print(f"  assets/{name} ({(OUT / name).stat().st_size // 1024} KB)")
    print("\ncurrentColor版はCSSのcolorで色が変わります。"
          "紙色の地には navy、濃い地には white を使ってください。")


if __name__ == "__main__":
    main()
