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
SHAPE_PRIORITY = [
    "丸小ビーズ", "特小ビーズ", "丸大ビーズ", "丸中ビーズ",
    "ベストビーズ", "Aiko(ベストビーズ、TB)", "トレジャービーズ",
]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "image-color-maker-build"})
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def shape_rank(shape):
    try:
        return SHAPE_PRIORITY.index(shape)
    except ValueError:
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
        out.append(entry)

    OUT.write_text(json.dumps({"beads": out}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(out)} 品番 → {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
