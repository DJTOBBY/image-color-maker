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

echo "palette.tohobeads.jp へ転送します(SSHパスワードを入力してください)"
rsync -avz --delete \
  --exclude ".DS_Store" \
  -e "ssh -p 2222" \
  dist/palette/ \
  main.jp-tohobeads@ssh-1.lolipop.jp:~/web/palette/

echo "完了: https://palette.tohobeads.jp/"
