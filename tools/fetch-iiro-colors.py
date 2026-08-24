#!/usr/bin/env python3
"""i-iro.com(色彩図鑑)の伝統色987色を取得する。

- 一覧はREST API(https://www.i-iro.com/dic/wp-json/wp/v2/posts)で取得(slug/link/title)
- 個別の色データ(マンセル値・HEX・RGB・CMYK・分類)はREST APIに含まれないため、
  各ページのHTML(.color-page 内の table.color-data)から抽出する
- 0.6秒間隔のポライトな取得、途中で止めても再開可能(取得済みはスキップ)

使い方:
    python3 tools/fetch-iiro-colors.py            # 全件(987件・約12分)
    python3 tools/fetch-iiro-colors.py --limit 10  # お試し
"""
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "iiro-colors.json"
API = "https://www.i-iro.com/dic/wp-json/wp/v2/posts"
DELAY = 0.6
UA = "image-color-maker-research (personal craft tool; polite crawl)"

TABLE_RE = re.compile(r'<table class="color-data">(.*?)</table>', re.S)
ROW_RE = re.compile(r'<th scope="row">(.*?)</th>\s*<td>(.*?)</td>', re.S)
TAG_RE = re.compile(r"<[^>]+>")
CATEGORY_RE = re.compile(r"分類[：:]\s*<a[^>]*>([^<]+)</a>")


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", errors="replace")


def list_all_posts():
    posts, page = [], 1
    while True:
        url = f"{API}?per_page=100&page={page}&_fields=slug,link,title,tags"
        try:
            data = json.loads(fetch(url))
        except Exception:
            break
        if not data:
            break
        posts.extend(data)
        page += 1
        time.sleep(0.2)
    return posts


def clean(html):
    text = TAG_RE.sub("", html).replace("&nbsp;", " ").strip()
    text = re.sub(r"\s+", " ", text)
    return text


def parse_color_page(html):
    tables = TABLE_RE.findall(html)
    fields = {}
    for t in tables:
        for label, value in ROW_RE.findall(t):
            fields[clean(label)] = clean(re.sub(r"<br[^>]*>", " ", value))
    cat_m = CATEGORY_RE.search(html)
    category = cat_m.group(1) if cat_m else None
    return {
        "name": fields.get("色の名前"),
        "reading": fields.get("読み / 綴り"),
        "munsell": fields.get("マンセル値"),
        "hex": fields.get("HEXWebカラー") or fields.get("HEX"),
        "rgb": fields.get("RGB"),
        "cmyk": fields.get("CMYK"),
        "category": category,
    }


def main():
    limit = None
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])

    print("一覧を取得中…")
    posts = list_all_posts()
    print(f"{len(posts)}件見つかりました")
    if limit:
        posts = posts[:limit]

    results = json.loads(OUT.read_text()) if OUT.exists() else {}
    todo = [p for p in posts if p["slug"] not in results]
    print(f"取得対象: {len(todo)}件(既存 {len(results)}件)")

    done = 0
    try:
        for p in todo:
            slug = p["slug"]
            try:
                html = fetch(p["link"])
                data = parse_color_page(html)
                data["slug"] = slug
                data["title"] = clean(p["title"]["rendered"])
                results[slug] = data
            except Exception as e:
                print(f"  {slug}: 失敗 ({e})", flush=True)
            done += 1
            if done % 50 == 0:
                OUT.write_text(json.dumps(results, ensure_ascii=False))
                print(f"  {done}/{len(todo)} 保存済み", flush=True)
            time.sleep(DELAY)
    finally:
        OUT.write_text(json.dumps(results, ensure_ascii=False, indent=0))
        print(f"完了: {len(results)}件 → {OUT}")


if __name__ == "__main__":
    main()
