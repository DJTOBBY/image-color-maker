#!/bin/sh
# palette.tohobeads.jp(ロリポップ)へデプロイする。
# 実行するとSSHパスワードを聞かれます。
#
# 使い方:
#   sh tools/deploy-lolipop.sh

set -e
cd "$(dirname "$0")/.."

# アップロード一式を dist/palette に組み立てる
mkdir -p dist/palette
cp index.html dist/palette/
rm -rf dist/palette/css dist/palette/js dist/palette/data
cp -R css js data dist/palette/
cp tools/htaccess-palette dist/palette/.htaccess

# キャッシュバスター: JS/CSS/データの参照にビルド番号を付ける
# (ロリポップはJS/CSSを1週間キャッシュするため、URLを変えて確実に更新を届ける)
STAMP=$(date +%Y%m%d%H%M%S)
sed -i '' -E "s|(href=\"css/[^\"?]+)\"|\1?v=${STAMP}\"|g; s|(src=\"js/[^\"?]+)\"|\1?v=${STAMP}\"|g" dist/palette/index.html
sed -i '' -E "s|(fetch\(\"data/[^\"?]+)\"|\1?v=${STAMP}\"|g" dist/palette/js/match.js

echo "palette.tohobeads.jp へ転送します"
rsync -avz --delete \
  --exclude ".DS_Store" \
  -e "ssh -p 2222" \
  dist/palette/ \
  main.jp-tohobeads@ssh-1.lolipop.jp:~/web/palette/

echo "完了: https://palette.tohobeads.jp/"
