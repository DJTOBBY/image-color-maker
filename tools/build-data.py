#!/usr/bin/env python3
"""Finder API と catalog.json を統合して、マッチング用の beads.json を生成する。

使い方:
    python3 tools/build-data.py

- Finder: https://toho-beads-finder.tohobeads.chatgpt.site/api/beads?catalog=round-links-v2
- カタログ: https://raw.githubusercontent.com/DJTOBBY/toho-beads-catalog/main/data/catalog.json

品番(code)単位に集約し、実物写真の計測色(photoSearch)・購入リンク・
対応シェイプ一覧・カタログの色分類(family)をまとめる。
"""
import json
import urllib.request
from collections import defaultdict
from pathlib import Path

FINDER_URL = "https://toho-beads-finder.tohobeads.chatgpt.site/api/beads?catalog=round-links-v2"
CATALOG_URL = "https://raw.githubusercontent.com/DJTOBBY/toho-beads-catalog/main/data/catalog.json"
FINDER_ORIGIN = "https://toho-beads-finder.tohobeads.chatgpt.site"
OUT = Path(__file__).resolve().parent.parent / "data" / "beads.json"

# 代表シェイプの優先順(パレット資料に載せる1点を選ぶ)
# 前方一致で判定する(「特大ビーズ(4mm)」のような括弧付きバリエーションを吸収)
SHAPE_PRIORITY = [
    "丸小ビーズ", "特小ビーズ", "丸大ビーズ", "丸中ビーズ", "特大ビーズ",
    "ベストビーズ", "Aiko", "トレジャービーズ",
]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "image-color-maker-build"})
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def shape_rank(shape):
    for i, prefix in enumerate(SHAPE_PRIORITY):
        if shape.startswith(prefix):
            return i
    return len(SHAPE_PRIORITY)


def main():
    finder = fetch(FINDER_URL)["beads"]
    catalog = {c["key"]: c for c in fetch(CATALOG_URL)["colors"]}

    by_code = defaultdict(list)
    for b in finder:
        if b.get("photoSearch", {}).get("m"):
            by_code[b["code"]].append(b)

    out = []
    for code, items in by_code.items():
        items.sort(key=lambda b: shape_rank(b["shapeJa"]))
        rep = items[0]
        ps = rep["photoSearch"]
        cat = catalog.get(code) or catalog.get(code.rstrip("F"))
        entry = {
            "code": code,
            "name": rep["name"],
            "shape": rep["shapeJa"],
            "size": rep["size"],
            "finish": rep["finish"],
            "hex": ps["m"],
            # 実物写真の色構成(上位4色と面積比)。JPEG書き出しのビーズ描画に使う
            "p": [[c, w] for c, w in (ps.get("p") or [])[:4]],
            "h": ps.get("h"), "s": ps.get("s"), "l": ps.get("l"),
            "colorJa": rep["colorJa"],
            "shapes": sorted({b["shapeJa"] for b in items}, key=shape_rank),
            "img": FINDER_ORIGIN + rep["imageUrl"],
        }
        buy = rep.get("beadsMarketUrl") or next(
            (b["beadsMarketUrl"] for b in items if b.get("beadsMarketUrl")), None)
        if buy:
            entry["buy"] = buy
        if cat:
            entry["family"] = cat["color"]["family"]
            entry["catalogHex"] = cat["color"]["hex"]
        # CORS開放されているカタログ(GitHub Pages)の実物写真。Canvas描画=JPEG出力に使える
        cat_exact = catalog.get(code)
        if cat_exact and cat_exact.get("swatch"):
            entry["photo"] = ("https://djtobby.github.io/toho-beads-catalog/official/"
                              + cat_exact["swatch"])
        out.append(entry)

    OUT.write_text(json.dumps({"beads": out}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(out)} 品番 → {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
