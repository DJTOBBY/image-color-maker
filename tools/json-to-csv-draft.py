#!/usr/bin/env python3
"""外部で作った色辞書のJSONを、点検用のCSV下書きに変換する。

そのまま取り込まず、いったん人の目を通すための橋渡し。
すでに辞書にある語は落とし、新しい語だけを並べる。

  python3 tools/json-to-csv-draft.py ~/Downloads/xxx.json data/entries-draft.csv

出てきたCSVを開いて、ひとことと色を手で直してから
tools/import-entries.py で取り込む。
"""
import csv, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def existing_words():
    src = open(os.path.join(ROOT, "js/dictionary.js"), encoding="utf-8").read()
    words = set()
    for m in re.finditer(r"match: \[([^\]]*)\]", src):
        words.update(re.findall(r'"([^"]+)"', m.group(1)))
    return words


def main():
    src_path, out_path = sys.argv[1], sys.argv[2]
    data = json.load(open(src_path, encoding="utf-8"))
    entries = data["entries"] if isinstance(data, dict) else data
    have = existing_words()

    header = ["表示名", "反応することば", "ひとこと", "色1", "色1の名前", "色2", "色2の名前",
              "色3", "色3の名前", "色4", "色4の名前", "トーン", "質感", "配色技法",
              "※分野", "※要確認"]
    rows, skipped = [], 0
    for e in entries:
        words = [e.get("term_ja"), e.get("term_en"), *(e.get("aliases") or [])]
        words = [w for w in dict.fromkeys(filter(None, words))]
        if any(w in have for w in words):
            skipped += 1
            continue
        pal = e.get("palette", [])[:4]  # こちらの書式は4色まで
        row = {"表示名": e.get("term_ja", ""),
               "反応することば": "|".join(w for w in words if w not in have),
               # 定型文のままでは味気ないので、書き直す前提で空欄にしておく
               "ひとこと": "",
               "トーン": "", "質感": "", "配色技法": "",
               "※分野": e.get("category", ""),
               "※要確認": "ひとことと色を書き直す"}
        for i, c in enumerate(pal, start=1):
            row[f"色{i}"] = c.get("hex", "").upper()
            row[f"色{i}の名前"] = c.get("name_ja", "")
        rows.append(row)

    with open(out_path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=header)
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in header})
    print(f"すでにある語で飛ばした: {skipped}")
    print(f"下書きに出した: {len(rows)} → {os.path.relpath(out_path, ROOT)}")
    print("ひとことと色を直してから tools/import-entries.py で取り込んでください。")


if __name__ == "__main__":
    main()
