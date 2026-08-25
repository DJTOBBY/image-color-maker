#!/usr/bin/env python3
"""シェア用の単一ファイル版 dist/share.html を組み立てる。
CSS・JS・ビーズデータをすべて1ファイルに埋め込む(Artifact/どこでも配布用)。

使い方:
    python3 tools/build-share.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

JS_FILES = ["pccs.js", "techniques.js", "palette.js", "wacolor-data.js", "wacolor.js",
            "trend.js", "associations.js", "entries-imported.js", "dictionary.js", "category-data.js", "categories.js",
            "match.js", "export.js", "app.js"]


def main():
    html = (ROOT / "index.html").read_text()
    css = (ROOT / "css" / "style.css").read_text()
    beads = json.loads((ROOT / "data" / "beads.json").read_text())
    works_path = ROOT / "data" / "works.json"
    works = json.loads(works_path.read_text()) if works_path.exists() else {"works": []}

    # body部分を抜き出す
    body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
    # 外部CSS/JSタグを落とす
    body = re.sub(r'<script src="[^"]*"></script>\s*', "", body)

    fonts = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
             '<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700'
             '&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">')

    data_js = (
        f"window.__BEADS__={json.dumps(beads, ensure_ascii=False, separators=(',', ':'))};\n"
        f"window.__WORKS__={json.dumps(works, ensure_ascii=False, separators=(',', ':'))};"
    )
    scripts = "\n".join(f"<script>\n{(ROOT / 'js' / f).read_text()}\n</script>" for f in JS_FILES)

    out = (
        "<title>COLOR STORY PALETTE by TOHOBEADS</title>\n"
        f"{fonts}\n<style>\n{css}\n</style>\n"
        f"{body}\n"
        f"<script>\n{data_js}\n</script>\n{scripts}\n"
    )
    dest = DIST / "share.html"
    dest.write_text(out)
    print(f"{dest} ({dest.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
