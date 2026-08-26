#!/usr/bin/env python3
"""あとから届いた「ひとこと」だけを、既存のCSVに反映する。

色は良いが文だけ作り直してもらったとき、色を触らずに文だけ差し替える。
表示名で突き合わせる。

  python3 tools/update-stories.py data/entries-batch200-v10.csv ~/Downloads/stories.csv
"""
import csv, io, sys

def load(path):
    return [r for r in csv.DictReader(open(path, encoding="utf-8-sig"))
            if (r.get("表示名") or "").strip()]

def main():
    target, source = sys.argv[1], sys.argv[2]
    new = {r["表示名"].strip(): (r.get("ひとこと") or "").strip() for r in load(source)}
    rows = load(target)
    changed, missing = 0, []
    for r in rows:
        t = r["表示名"].strip()
        if t in new and new[t] and new[t] != r["ひとこと"]:
            r["ひとこと"] = new[t]
            changed += 1
        elif t not in new:
            missing.append(t)
    w = csv.DictWriter(io.open(target, "w", encoding="utf-8-sig", newline=""),
                       fieldnames=list(rows[0].keys()))
    w.writeheader()
    for r in rows:
        w.writerow(r)
    print(f"差し替えた: {changed} / {len(rows)}")
    if missing:
        print(f"新しい文が無かった項目: {len(missing)} — {' '.join(missing[:8])}")
    print("色は触っていません。tools/import-entries.py で入れ直してください。")

if __name__ == "__main__":
    main()
