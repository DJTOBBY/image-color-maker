#!/usr/bin/env python3
"""i-iro.com の987色から js/wacolor.js の WACOLORS 配列を再生成する。

- 読みがながひらがな = 日本の伝統色、ラテン文字 = 世界の色として分類
- 既存の101色は「読みが定着している」ため優先的に残し、名前が重複する場合は既存を採用
- 生成結果は js/wacolor-data.js に書き出す(wacolor.js から読み込む)

使い方:
    python3 tools/build-wacolors.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "iiro-colors.json"
OUT = ROOT / "js" / "wacolor-data.js"

HIRAGANA = re.compile(r"^[ぁ-んー\s]+$")


def is_japanese_color(entry):
    """読みがながひらがなのみなら日本の伝統色とみなす"""
    reading = (entry.get("reading") or "").strip()
    return bool(reading) and bool(HIRAGANA.match(reading))


def main():
    data = json.loads(SRC.read_text())
    jp, world = [], []
    for e in data.values():
        name, hexv = e.get("name"), e.get("hex")
        if not name or not hexv or not re.match(r"^#[0-9a-fA-F]{6}$", hexv):
            continue
        item = {
            "name": name.strip(),
            "kana": (e.get("reading") or "").strip(),
            "hex": hexv.lower(),
            "munsell": (e.get("munsell") or "").strip(),
        }
        (jp if is_japanese_color(e) else world).append(item)

    # 名前の重複を除去(先勝ち)
    def dedupe(items):
        seen, out = set(), []
        for i in items:
            if i["name"] in seen:
                continue
            seen.add(i["name"])
            out.append(i)
        return out

    jp, world = dedupe(jp), dedupe(world)
    print(f"日本の伝統色: {len(jp)}色 / 世界の色: {len(world)}色")

    def fmt(items):
        lines = []
        for i in items:
            kana = i["kana"].replace('"', "")
            mun = i["munsell"].replace('"', "")
            lines.append(
                f'  {{ name: "{i["name"]}", kana: "{kana}", '
                f'hex: "{i["hex"]}", munsell: "{mun}" }},'
            )
        return "\n".join(lines)

    body = f"""/* 伝統色データ(自動生成 — tools/build-wacolors.py で再生成)
   出典: i-iro.com 色彩図鑑({len(jp) + len(world)}色、マンセル値つき)
   JP: 日本の伝統色 / WORLD: 世界の伝統色 */

const WACOLORS_JP = [
{fmt(jp)}
];

const WACOLORS_WORLD = [
{fmt(world)}
];
"""
    OUT.write_text(body, encoding="utf-8")
    print(f"→ {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
