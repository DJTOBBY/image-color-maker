#!/usr/bin/env python3
"""外から来た色辞書を、入れる前に点検する。

良さそうに見えても入れると質が下がることがある。
これまで3つのファイルを手で測ってきた判断を、そのまま道具にした。

  python3 tools/audit-incoming.py ~/Downloads/xxx.json

見るのは5つ:
  1. 色の使い回し  — 1項目あたり何色がその項目だけの色か
  2. 項目どうしの近さ — 無関係な言葉が同じ配色になっていないか
  3. 色名の質      — 「孔雀・主調」のような役割名になっていないか
  4. 説明文の質    — 全件同じ定型文になっていないか
  5. 新規性       — すでにこちらが持っている語ではないか

分野ごとに採否を出す。色名が役割名だと画面に出したとき台無しになるので、
色が良くても「色だけ採用」に落とす。
"""
import collections
import itertools
import json
import math
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 「孔雀・主調」「輪島塗・副調」のような、中身を語らない色名
ROLE_NAME = re.compile(r"[・:：](主調|副調|アクセント|陰影|光|ベース|差し色)$")
# 知覚的に同じとみなす差(CIE Lab)。3を下回ると並べても区別がつかない
SAME_COLOR = 3.0
# 判定の線引き。これまで測った4つのデータの実績から置いている
#   無彩色(白黒灰)を除いた、1項目あたりの「その項目だけの色」の数。
#   自前の辞書と過去の納品を同じ数え方で測って置いている。
MIN_UNIQUE = 1.0


# これ未満の彩度は無彩色として扱い、専用色の数えから外す
NEUTRAL_S = 18


def saturation(hexstr):
    import colorsys
    r, g, b = (int(hexstr[i:i + 2], 16) / 255 for i in (1, 3, 5))
    return colorsys.rgb_to_hls(r, g, b)[2] * 100


def lab(hexstr):
    r, g, b = (int(hexstr[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = f(r), f(g), f(b)
    x = (r * .4124 + g * .3576 + b * .1805) / .95047
    y = r * .2126 + g * .7152 + b * .0722
    z = (r * .0193 + g * .1192 + b * .9505) / 1.08883
    q = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    x, y, z = q(x), q(y), q(z)
    return (116 * y - 16, 500 * (x - y), 200 * (y - z))


# 色名がその色を言い当てているか。名前は「〜の◯◯」の形が多いので、
# 最後の「の」より後ろだけを見る(「茶葉の緑」の茶に反応しないように)。
COLOR_RULES = [
    ("黒|漆黒",            lambda h, s, l: l < 30,                        "暗くない"),
    ("白(?!緑)|胡粉",       lambda h, s, l: l > 68,                        "明るくない"),
    ("金(?!属)|黄金|琥珀",   lambda h, s, l: s < 12 or 15 <= h <= 62,       "黄〜橙の範囲外"),
    ("(?<!黄)(?<!青)緑",    lambda h, s, l: s < 12 or 70 <= h <= 185,      "緑の範囲外"),
    ("藍|紺|瑠璃|群青",      lambda h, s, l: s < 12 or 195 <= h <= 265,     "青の範囲外"),
    ("朱|緋|紅|赤(?!茶|褐)", lambda h, s, l: s < 12 or h >= 330 or h <= 25, "赤の範囲外"),
    ("紫(?!蘇)",           lambda h, s, l: s < 12 or 240 <= h <= 335,      "紫の範囲外"),
]


def name_mismatch(entries):
    """色名と実際の色が食い違っているものを返す"""
    import colorsys
    out = []
    for e in entries:
        for hx, nm in zip(e["hexes"], e["names"]):
            tail = nm.rsplit("の", 1)[-1] or nm
            r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5))
            hh, ll, ss = colorsys.rgb_to_hls(r, g, b)
            h, sv, lv = round(hh * 360), round(ss * 100), round(ll * 100)
            for pat, ok, why in COLOR_RULES:
                if re.search(pat, tail) and not ok(h, sv, lv):
                    out.append((e["term"], nm, hx, f"H{h} S{sv} L{lv}", why))
                    break
    return out


def existing_words():
    words = set()
    for name in ("js/dictionary.js", "js/entries-imported.js"):
        path = os.path.join(ROOT, name)
        if not os.path.exists(path):
            continue
        src = open(path, encoding="utf-8").read()
        for m in re.finditer(r"match: \[([^\]]*)\]", src):
            words.update(re.findall(r'"([^"]+)"', m.group(1)))
    return words


def load_csv(path):
    """こちらの納品形式(data/entries-template.csv)で来た場合"""
    import csv
    out = []
    for r in csv.DictReader(open(path, encoding="utf-8-sig")):
        if not (r.get("表示名") or "").strip():
            continue
        pal = [(r.get(f"色{i}", "").strip().upper(), r.get(f"色{i}の名前", "").strip())
               for i in range(1, 5)]
        pal = [(h, n) for h, n in pal if h]
        hexes = [h for h, _ in pal if re.fullmatch(r"#[0-9A-Fa-f]{6}", h)]
        out.append({
            "term": r["表示名"].strip(),
            "cat": (r.get("※分野") or "(分野なし)").strip() or "(分野なし)",
            "words": [w.strip() for w in (r.get("反応することば") or "").split("|") if w.strip()],
            "hexes": hexes,
            "names": [n for _, n in pal],
            "desc": (r.get("ひとこと") or "").strip(),
            "broken": len(hexes) != len(pal),
        })
    return out, []


def load(path):
    if path.lower().endswith(".csv"):
        return load_csv(path)
    data = json.load(open(path, encoding="utf-8"))
    entries = data["entries"] if isinstance(data, dict) else data
    out = []
    for e in entries:
        pal = e.get("palette") or []
        hexes = [c["hex"].upper() for c in pal if re.fullmatch(r"#[0-9A-Fa-f]{6}", c.get("hex", ""))]
        out.append({
            "term": e.get("term_ja") or e.get("term_en") or e.get("id", "?"),
            "cat": e.get("category", "(分野なし)"),
            "words": [w for w in [e.get("term_ja"), e.get("term_en"), *(e.get("aliases") or [])] if w],
            "hexes": hexes,
            "names": [c.get("name_ja", "") for c in pal],
            "desc": (e.get("description_ja") or "").strip(),
            "broken": len(hexes) != len(pal),
        })
    return out, data.get("modifiers", []) if isinstance(data, dict) else []


def group_colors(all_hex):
    """知覚的に同じ色をひとまとめにして、群の番号を返す"""
    uniq = sorted(set(all_hex))
    labs = {h: lab(h) for h in uniq}
    gid, groups = {}, 0
    for h in uniq:
        if h in gid:
            continue
        gid[h] = groups
        for o in uniq:
            if o not in gid and math.dist(labs[h], labs[o]) < SAME_COLOR:
                gid[o] = groups
        groups += 1
    return gid, groups


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    E, mods = load(sys.argv[1])
    if not E:
        print("項目がありません", file=sys.stderr)
        return 1
    have = existing_words()
    all_hex = [h for e in E for h in e["hexes"]]
    gid, ngroups = group_colors(all_hex)
    # 白・黒・灰は重なって当然(「枝雪の白」も「冠羽の白」も白)。
    # 専用色を数えるときは無彩色を外さないと、正直に白を白と置いた
    # データほど低く出てしまう。
    chroma = [h for h in all_hex if saturation(h) >= NEUTRAL_S]
    count = collections.Counter(gid[h] for h in chroma)

    print(f"項目 {len(E)} / のべ色 {len(all_hex)}")
    print(f"  完全に一致しない色: {len(set(all_hex))}")
    print(f"  知覚的に別の色    : {ngroups}   (差がΔE{SAME_COLOR}未満のものをまとめた)")
    # 一番大きな群を見る。同じ色を少しずつずらして「全部ちがう色」に
    # 見せかけていると、ここに大きな塊が出る。
    clusters = collections.Counter(gid[h] for h in set(all_hex))
    biggest = clusters.most_common(1)[0][1]
    big_hex = [h for h in set(all_hex) if gid[h] == clusters.most_common(1)[0][0]]
    if biggest >= 8 and saturation(big_hex[0]) >= NEUTRAL_S:
        sample = sorted(big_hex)
        print(f"  ※ 見分けのつかない色が最大 {biggest} 色ぶん重なっている: "
              + " ".join(sample[:5]) + " …")
    broken = [e["term"] for e in E if e["broken"]]
    if broken:
        print(f"  ! hexが壊れている項目: {' '.join(broken[:8])}")

    # 分野ごとの採否
    print("\n分野ごとの見立て")
    by = collections.defaultdict(list)
    for e in E:
        by[e["cat"]].append(e)
    verdicts = {}
    for cat, es in sorted(by.items(), key=lambda x: -len(x[1])):
        uq = [sum(1 for h in e["hexes"]
                  if saturation(h) >= NEUTRAL_S and count[gid[h]] == 1) for e in es]
        avg = sum(uq) / len(es)
        role = sum(1 for e in es
                   if sum(1 for n in e["names"] if ROLE_NAME.search(n)) >= 3) / len(es)
        new = [e for e in es if not any(w in have for w in e["words"])]
        if avg < MIN_UNIQUE:
            v = "見送り(色が使い回されている)"
        elif role >= 0.5:
            v = "語彙だけ採用(色名が役割名で、画面に出せない)"
        elif not new:
            v = "見送り(すべて既にある)"
        else:
            v = "採用できる"
        verdicts[cat] = v
        print(f"  {cat:24} {len(es):3}件  専用色 {avg:.2f}  役割名 {round(role*100):3}%  "
              f"新規 {len(new):3}  → {v}")

    # 無関係な項目どうしが似すぎていないか
    sets = {e["term"]: {gid[h] for h in e["hexes"]} for e in E if e["hexes"]}
    close = [(len(sets[a] & sets[b]), a, b)
             for a, b in itertools.combinations(sets, 2) if len(sets[a] & sets[b]) >= 3]
    print(f"\n5色中3色以上が同じ組: {len(close)}組")
    for n, a, b in sorted(close, reverse=True)[:6]:
        print(f"  {n}色共通: {a} / {b}")

    mism = name_mismatch(E)
    print(f"\n色名と実際の色が食い違うもの: {len(mism)}色 / {len(all_hex)}")
    for t, nm, hx, v, why in mism[:10]:
        print(f"  {t}: 「{nm}」 {hx} ({v}) ← {why}")
    if len(mism) > 10:
        print(f"  ほか {len(mism) - 10}色")

    descs = [e["desc"] for e in E if e["desc"]]
    if descs:
        print(f"\n説明文: {len(set(descs))}種 / {len(descs)}件")
        # 穴埋め文は「…は、A、B、Cを核に…編集パレット。」のように
        # 決まった言い回しを共有する。末尾の一致で見分ける。
        tails = collections.Counter(d[-6:] for d in descs if len(d) >= 6)
        tail, n = tails.most_common(1)[0] if tails else ("", 0)
        if n / len(descs) > 0.3:
            print(f"  ※ {round(n/len(descs)*100)}% が「{tail}」で終わる。"
                  f"穴埋めなので、ひとことは書き直しが要る")

    if mods:
        def sig(m):
            t = m.get("transform", {})
            return (round(t.get("saturation_mult", 1), 1), round(t.get("lightness_delta", 0), 2),
                    round(t.get("hue_shift", 0)), round(t.get("contrast_mult", 1), 1))
        sigs = collections.Counter(sig(m) for m in mods)
        idle = sigs.get((1, 0, 0, 1.0), 0)
        print(f"\n修飾語 {len(mods)}語 → こちらで効く変換は {len(sigs)}通り")
        if idle:
            print(f"  うち {idle}語は何も起きない(未実装の軸を使っている)")

    ok = [c for c, v in verdicts.items() if v == "採用できる"]
    print("\nまとめ")
    print(f"  そのまま採用できる分野: {' '.join(ok) if ok else 'なし'}")
    print("  採用する分野は tools/json-to-csv-draft.py で下書きにし、")
    print("  ひとことを書き直してから tools/import-entries.py で入れる。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
