# COLOR STORY PALETTE by TOHOBEADS

(開発名: イメージカラーメーカー)

「TOKYO NIGHT」「SETOUCHI SEA」「KYOTO AUTUMN」のような**場所・記憶・物語のことば**を、
5〜8色のカラーパレットと**トーホービーズの実品番**に翻訳する静的Webアプリ。
有料API不使用・すべてブラウザ内で完結。

## 使い方

```bash
cd イメージカラーメーカー
python3 -m http.server 8874
```

http://localhost:8874 を開き、テーマを入力して「翻訳する」。
「PDFとして保存 / 印刷」でA4一枚の配色レシピ資料になる。

## 仕組み

1. **辞書翻訳** — [js/dictionary.js](js/dictionary.js) の語彙(場所・時間・季節・物語)が
   色アンカー(HSL)とトーンの気配に変換する。未知語は文字列ハッシュでフォールバック。
2. **PCCS準拠のパレット生成** — [js/palette.js](js/palette.js) + [js/pccs.js](js/pccs.js)。
   「ビーズワークのためのカラーディプロマ講座」資料の体系に準拠:
   - PCCS 12色相 × 12トーン分類(各色に `dk18` のようなラベル)
   - トーンのイメージ語(ペール=優しい・淡い、ダーク=大人っぽい・円熟した 等)
   - 配色技法の自動選択と表示(類似/対照色相、対照トーン、ドミナントカラー/トーン、トーナル等)
   - ナチュラルハーモニー補正(黄寄りを明るく、青紫寄りを暗く)
3. **ビーズマッチング** — [js/match.js](js/match.js)。CIE Lab距離で近い実品番を検索。
   テーマに応じてラスター・オーロラ系/ツヤケシ系の加工を優遇。購入リンク付き。
4. **ワークシート** — 講座と同じ形式で、使用色相を色相環に・使用トーンをトーン図に丸印で表示。

## データ

### ビーズ実品番 — `data/beads.json`(2,255品番)

`tools/build-data.py` で生成:

- TOHO BEADS FINDER `/api/beads?catalog=round-links-v2` — 実物写真の計測色(photoSearch)・購入リンク
- toho-beads-catalog `data/catalog.json` — 色分類(family)・カタログhex

```bash
python3 tools/build-data.py
```

### トレンドカラー年表 — [js/trend.js](js/trend.js)

PANTONE Color of the Year(2000〜2025)と年代パレット(60s〜2020s、Y2K、平成レトロ)。
「2016 SPRING」「Y2K TOKYO」「90年代の海」のような入力に反応する。トレンドの記録色は
トーン補正を受けず原色のまま守られる(`locked`)。

### 伝統色・襲の色目 — [js/wacolor.js](js/wacolor.js)

日本の伝統色 約100色。「瑠璃色の夜」のように入力語として使えるほか、
生成した各色に最も近い伝統色名(≒蘇芳 など)を資料に添える。
襲の色目(梅・藤・紅葉・菊など8種)は配色セットとして丸ごと使われる。

### 色の連想 — [js/associations.js](js/associations.js)

講座資料の連想調査表に基づく色系統→連想語。資料に「この配色が呼び起こすもの」として表示。

### 手持ちビーズ(在庫リスト)

画面の「手持ちビーズ」欄に品番を書くとlocalStorageに保存され、
マッチング時に手持ち品番へ「手持ち」バッジが付く。
「手持ちのビーズだけでマッチングする」にチェックすると在庫内だけで探す。

### 作品事例 — `data/works.json`

自作の作品写真をテーマに紐づける。`images/` に写真を置き、works配列に
`{title, image, keywords, note}` を追加すると、keywordsがテーマに含まれたとき
資料に「この物語で作った作品」として表示される。
