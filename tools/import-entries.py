#!/usr/bin/env python3
"""色の表(CSV)を辞書の項目に変換する。

TOHOの方が Excel / Numbers / スプレッドシートで書いた表を、
そのまま js/entries-imported.js に変換して取り込む。

  python3 tools/import-entries.py data/entries.csv          # 点検だけ
  python3 tools/import-entries.py data/entries.csv --write   # 書き出す

色の指定は「#RRGGBB」でも「TOHOの品番」でもよい。
品番で書くと data/beads.json から実際の色を引くので、
手元のビーズをそのまま並べれば表になる。

書き出す前に必ず点検する。おかしな行があれば止まって、
何行目の何が悪いかを日本語で言う。直してから書き出せばよい。
"""
import argparse
import colorsys
import csv
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "js/entries-imported.js")
HEX_RE = re.compile(r"^#?([0-9a-fA-F]{6})$")

# 表の見出し。この名前でなければ読まない(打ち間違いを黙って通さないため)
COLS_REQUIRED = ["表示名", "反応することば", "ひとこと"]
COLS_COLOR = [("色1", "色1の名前"), ("色2", "色2の名前"),
              ("色3", "色3の名前"), ("色4", "色4の名前")]
COLS_OPTIONAL = ["トーン", "質感", "配色技法"]

TONES = ["v", "b", "s", "dp", "lt", "sf", "d", "dk", "p", "ltg", "g", "dkg"]
TEXTURES = {"": (False, False), "ラメ": (True, False), "つや": (True, False),
            "ツヤケシ": (False, True), "マット": (False, True)}


def load_beads():
    path = os.path.join(ROOT, "data/beads.json")
    data = json.load(open(path, encoding="utf-8"))
    items = data if isinstance(data, list) else data.get("beads", [])
    return {str(b["code"]).strip().upper(): b for b in items if b.get("hex")}


def load_existing_words():
    """すでに辞書にあることばを集める(同じ語を二度定義しないため)"""
    src = open(os.path.join(ROOT, "js/dictionary.js"), encoding="utf-8").read()
    words = set()
    for m in re.finditer(r"match: \[([^\]]*)\]", src):
        words.update(re.findall(r'"([^"]+)"', m.group(1)))
    return words


def load_techniques():
    """配色技法の正式名を js/palette.js から読む(表記ゆれを弾くため)"""
    src = open(os.path.join(ROOT, "js/palette.js"), encoding="utf-8").read()
    block = re.search(r"const TECHNIQUES = \{(.*?)\n\};", src, re.S)
    return set(re.findall(r'"([^"]+)":', block.group(1))) if block else set()


def to_hsl(hex6):
    r, g, b = (int(hex6[i:i + 2], 16) / 255 for i in (0, 2, 4))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return round(h * 360), round(s * 100), round(l * 100)


def resolve_color(raw, beads):
    """「#3D659E」か「557」を (hex, どう解決したか) に変える"""
    v = (raw or "").strip()
    if not v:
        return None, None
    m = HEX_RE.match(v)
    if m:
        return "#" + m.group(1).upper(), "色指定"
    bead = beads.get(v.upper())
    if bead:
        return bead["hex"].upper(), f"品番{v}({bead.get('colorJa') or ''}{bead.get('finish') or ''})"
    return None, f"!!{v} は色でも品番でもない"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("csv")
    ap.add_argument("--write", action="store_true", help="点検を通ったら書き出す")
    args = ap.parse_args()

    beads = load_beads()
    techniques = load_techniques()
    existing = load_existing_words()
    with open(args.csv, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        print("行がありません", file=sys.stderr)
        return 1

    missing = [c for c in COLS_REQUIRED + [c for p in COLS_COLOR for c in p]
               if c not in rows[0]]
    if missing:
        print("見出しが足りません: " + " / ".join(missing), file=sys.stderr)
        print("data/entries-template.csv の見出しをそのまま使ってください", file=sys.stderr)
        return 1

    entries, problems = [], []
    seen_words = {}
    for i, row in enumerate(rows, start=2):  # 2行目からデータ
        if not (row.get("表示名") or "").strip():
            continue  # 空行は飛ばす
        def bad(msg):
            problems.append(f"{i}行目 「{row.get('表示名', '').strip()}」: {msg}")

        ja = row["表示名"].strip()
        words = [w.strip() for w in (row.get("反応することば") or "").split("|") if w.strip()]
        if not words:
            bad("反応することばが空です(「|」で区切って1つ以上)")
        for w in words:
            if w in seen_words:
                bad(f"「{w}」は{seen_words[w]}行目と重なっています")
            elif w in existing:
                bad(f"「{w}」はすでに辞書にあります(別のことばにするか、既存の項目を直す)")
            seen_words[w] = i

        anchors = []
        for col_hex, col_name in COLS_COLOR:
            hexv, how = resolve_color(row.get(col_hex), beads)
            name = (row.get(col_name) or "").strip()
            if hexv is None:
                if how:
                    bad(f"{col_hex}: {how.lstrip('!')}")
                continue
            if not name:
                bad(f"{col_name} が空です({col_hex} に色があるのに名前がない)")
                continue
            h, s, l = to_hsl(hexv[1:])
            anchors.append({"h": h, "s": s, "l": l, "name": name})
        if len(anchors) < 2:
            bad(f"色が{len(anchors)}個しかありません(2個以上)")

        tone = [t.strip() for t in (row.get("トーン") or "").split("|") if t.strip()]
        for t in tone:
            if t not in TONES:
                bad(f"トーン「{t}」は使えません({' '.join(TONES)} のどれか)")
        texture = (row.get("質感") or "").strip()
        if texture not in TEXTURES:
            bad(f"質感「{texture}」は使えません(空欄 / {' / '.join(k for k in TEXTURES if k)})")
        tech = (row.get("配色技法") or "").strip()
        if tech and tech not in techniques:
            bad(f"配色技法「{tech}」は正式名ではありません")

        sparkle, matte = TEXTURES.get(texture, (False, False))
        entries.append({"match": words, "ja": ja, "story": (row.get("ひとこと") or "").strip(),
                        "anchors": anchors, "toneBias": tone,
                        "sparkle": sparkle, "matte": matte, "technique": tech or None})

    print(f"読んだ行: {len(entries)}")
    if problems:
        print(f"\n直すところ ({len(problems)}件):")
        for p in problems:
            print("  " + p)
        if tech_hint := (techniques if any("配色技法" in p for p in problems) else None):
            print("\n  使える配色技法: " + " / ".join(sorted(tech_hint)))
        print("\n書き出していません。直してからもう一度実行してください。")
        return 1

    print("問題ありません。")
    if not args.write:
        print("書き出すには --write を付けてください。")
        return 0

    body = ["/* 表から取り込んだ辞書項目(自動生成 — tools/import-entries.py)",
            f"   元データ: {os.path.relpath(os.path.abspath(args.csv), ROOT)} */",
            "const IMPORTED_ENTRIES = ["]
    for e in entries:
        parts = [f'  {{ match: {json.dumps(e["match"], ensure_ascii=False)}, '
                 f'ja: {json.dumps(e["ja"], ensure_ascii=False)}, '
                 f'story: {json.dumps(e["story"], ensure_ascii=False)},',
                 "    anchors: ["]
        for a in e["anchors"]:
            parts.append(f'      {{ h: {a["h"]}, s: {a["s"]}, l: {a["l"]}, '
                         f'name: {json.dumps(a["name"], ensure_ascii=False)} }},')
        tail = f'    ], toneBias: {json.dumps(e["toneBias"], ensure_ascii=False)}'
        if e["sparkle"]:
            tail += ", sparkle: true"
        if e["matte"]:
            tail += ", matte: true"
        if e["technique"]:
            tail += f', technique: {json.dumps(e["technique"], ensure_ascii=False)}'
        parts.append(tail + " },")
        body.append("\n".join(parts))
    body.append("];\n")
    open(OUT, "w", encoding="utf-8").write("\n".join(body))
    print(f"書き出し: {os.path.relpath(OUT, ROOT)}  {len(entries)}件")
    return 0


if __name__ == "__main__":
    sys.exit(main())
