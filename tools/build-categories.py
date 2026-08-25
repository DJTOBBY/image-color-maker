#!/usr/bin/env python3
"""言葉の「分類」を解決して js/category-data.js を作る。

辞書に無い言葉でも、その分類の色を継げるようにするための下ごしらえ。
分類の当て方は2通りある:
  1. 語尾  — 日本の地名は地形が名前に出る(宮古島・中禅寺湖・華厳の滝)。
             ネットも要らず、実行時にその場で判定できるので表には入れない。
  2. 説明文 — 語尾に出ない言葉(バリ・トスカーナ・ソウル)は、
             Wikipediaの一行説明から分類を読み取り、ここで表にして焼き込む。

実行時にWikipediaへ問い合わせない理由:
  利用者が入力した言葉を外部に送らないため。ついでに圏外でも動く。

  python3 tools/build-categories.py           # 語尾のみ(通信なし)
  python3 tools/build-categories.py --fetch   # 説明文もひいて表を作る
"""
import json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATS = json.load(open(os.path.join(ROOT, "data/categories.json"), encoding="utf-8"))["categories"]
WORDS = os.path.join(ROOT, "data/category-words.txt")
OUT = os.path.join(ROOT, "js/category-data.js")
UA = {"User-Agent": "ColorStoryPalette/1.0 (https://palette.tohobeads.jp; tohohy@gmail.com)"}
API = "https://ja.wikipedia.org/w/api.php"
# 曖昧さ回避ページに落ちたときに補う語(函館→函館市、知床→知床半島)
# 曖昧さ回避ページに落ちたときに補う語。先にあるものから試す。
# まぎれの少ない語を前に、1文字の「山」「島」「湖」を最後に置く。
# (「乳頭」は乳頭山ではなく乳頭温泉、「織部」は織部山ではなく織部焼)
SUFFIXES = ["温泉", "焼", "諸島", "半島", "山脈", "国立公園", "渓谷", "高原",
            "湿原", "砂漠", "平原", "市", "町", "県", "地方", "州", "城",
            "島", "湖", "山"]
# 分類として使ってはいけない説明(一覧記事・曖昧さ回避)
JUNK = re.compile(r"曖昧さ回避|一覧記事|ウィキメディアの")


def _query(titles, extracts):
    """まとめて引く。extracts=True なら本文の冒頭も一緒に引く(1回20件まで)"""
    params = {"action": "query", "format": "json", "formatversion": "2",
              "titles": "|".join(titles),
              # 転送を追わないと「八重山諸島」「乳頭温泉」のような転送名で
              # 中身が空のまま返り、地形を取り違える
              "redirects": "1",
              "prop": "description|extracts" if extracts else "description"}
    if extracts:
        # exlimit を付けないと本文は先頭1件しか返ってこない
        params.update({"exintro": "1", "explaintext": "1",
                       "exsentences": "2", "exlimit": "20"})
    q = urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(urllib.request.Request(API + "?" + q, headers=UA), timeout=30) as r:
            data = json.load(r).get("query", {})
        redirects = {x["from"]: x["to"] for x in data.get("redirects", [])}
        return data.get("pages", []), redirects
    except Exception as e:
        print(f"\n  ! 取得に失敗 ({e}) — この塊は飛ばします", file=sys.stderr)
        return [], {}


def descriptions(titles):
    """分類の手がかりになる文を集める。

    Wikidataの一行説明を第一とし、それが無い語(アルプス・青磁など)は
    本文の冒頭でおぎなう。一行説明のほうが短く正確なので優先する。
    """
    out = {}
    step = 20  # 本文も引くため1回20件まで
    for i in range(0, len(titles), step):
        chunk = titles[i:i + step]
        pages, redirects = _query(chunk, extracts=True)
        # 転送先の見出しで返ってくるので、こちらが尋ねた名前に戻す
        back = {to: frm for frm, to in redirects.items()}
        for p in pages:
            title = back.get(p["title"], p["title"])
            d = (p.get("description") or "").strip()
            if JUNK.search(d):
                continue  # 曖昧さ回避・一覧記事は接尾辞を補って引き直す
            if not d:
                d = (p.get("extract") or "").strip().replace("\n", " ")
            if d:
                out[title] = d
        sys.stderr.write(f"\r  {min(i + step, len(titles))}/{len(titles)}")
        time.sleep(0.08)
    sys.stderr.write("\n")
    return out


# 「和歌山県」の「山」、「鹿児島県」の「島」に反応してしまうため、
# 都道府県・市区町村の名前は判定の前に落とす。どこにあるかは分類ではない。
PLACE_SUFFIX = re.compile(r"[一-龥ぁ-んァ-ヶ]{2,4}[都道府県]|[一-龥ぁ-んァ-ヶ]{2,5}[市区町村](?=[のには、。]|$)")


def classify(text):
    """説明文から分類を決める。上に置いた分類ほど優先(火山を山より先に)"""
    text = PLACE_SUFFIX.sub("", text)
    for c in CATS:
        for kw in c.get("desc", []):
            if kw in text:
                return c["key"]
    return None


def build_map():
    if not os.path.exists(WORDS):
        print(f"語彙リストがありません: {WORDS}", file=sys.stderr)
        return {}
    words = [w.strip() for w in open(WORDS, encoding="utf-8")
             if w.strip() and not w.startswith("#")]
    # 語尾で分かる語もあえて照会する。「徳島」「広島」は島ではなく市であり、
    # 語尾からの推測が外れる。表に載せておけば実行時にそちらが優先される。
    print(f"照会する語: {len(words)}")

    got = descriptions(words)
    # 曖昧さ回避などで落ちた語は、接尾辞を補ってもう一度だけ試す
    missing = [w for w in words if w not in got]
    if missing:
        print(f"再照会: {len(missing)} 語(接尾辞を補って)")
        cand, origin = [], {}
        for w in missing:
            for s in SUFFIXES:
                cand.append(w + s)
                origin[w + s] = w
        found = descriptions(cand)
        # SUFFIXES の並び順どおりに拾う。まとめて引くと返ってくる順が不定で、
        # 「富山」が富山市ではなく富山山に、「乳頭」が乳頭温泉ではなく
        # 乳頭山に化けることがあった。
        for w in missing:
            for suf in SUFFIXES:
                if w + suf in found:
                    got[w] = found[w + suf]
                    break

    out, unresolved = {}, []
    for w in words:
        key = classify(got.get(w, ""))
        if key:
            out[w] = key
        else:
            unresolved.append(w)
    print(f"分類できた: {len(out)}/{len(words)}")
    if unresolved:
        print("分類できなかった語(手で辞書に書くべきもの):")
        print("  " + " ".join(unresolved))
    return out


def main():
    word_map = build_map() if "--fetch" in sys.argv else {}
    if not word_map and os.path.exists(OUT):
        # --fetch なしのときは既存の表を保つ(分類の色だけ直したいことが多いため)
        old = re.search(r"const CATEGORY_MAP = (\{.*?\});", open(OUT, encoding="utf-8").read(), re.S)
        if old:
            word_map = json.loads(old.group(1))
            print(f"既存の対応表を引き継ぎ: {len(word_map)} 語")

    slim = [{k: v for k, v in c.items() if k != "desc"} for c in CATS]
    body = [
        "/* 分類ごとの色(自動生成 — tools/build-categories.py で再生成)",
        "   元データ: data/categories.json / data/category-words.txt",
        "   CATEGORIES: 分類そのものの色。suffix は日本の地名の語尾。",
        "   CATEGORY_MAP: 語尾に出ない言葉の対応表。Wikipediaの一行説明から作成。",
        "   説明文の出典: ウィキペディア日本語版 (CC BY-SA 4.0) — 本文は含めず分類名のみを利用 */",
        "const CATEGORIES = " + json.dumps(slim, ensure_ascii=False, indent=2) + ";",
        "",
        "const CATEGORY_MAP = " + json.dumps(word_map, ensure_ascii=False,
                                             indent=2, sort_keys=True) + ";",
        "",
    ]
    open(OUT, "w", encoding="utf-8").write("\n".join(body))
    print(f"書き出し: {os.path.relpath(OUT, ROOT)}  分類 {len(slim)} / 語 {len(word_map)}")


if __name__ == "__main__":
    main()
