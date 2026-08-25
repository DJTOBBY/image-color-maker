/* いま辞書が持っている項目名を data/existing-terms.txt に書き出す。
   外へ次の納品を頼むとき、これを渡せば重複を避けられる。

     node tools/dump-terms.js
*/
const fs = require("fs"), vm = require("vm"), path = require("path");
const ROOT = path.dirname(__dirname);
const ctx = { console };
vm.createContext(ctx);
for (const f of ["js/pccs.js", "js/palette.js", "js/techniques.js",
                 "js/entries-imported.js", "js/dictionary.js"]) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  vm.runInContext(fs.readFileSync(p, "utf8") +
    '\n;for(const n of ["DICTIONARY","IMPORTED_ENTRIES"])try{globalThis[n]=eval(n)}catch(e){}',
    ctx, { filename: p });
}
const all = (ctx.DICTIONARY || []).concat(ctx.IMPORTED_ENTRIES || []);
const names = [...new Set(all.map(e => e.ja))].sort((a, b) => a.localeCompare(b, "ja"));
const out = path.join(ROOT, "data/existing-terms.txt");
fs.writeFileSync(out,
  `# COLOR STORY PALETTE がすでに持っている項目(${names.length}件)\n` +
  "# 納品前にこの一覧と突き合わせ、重複する語は外してください。\n" +
  "# 自動生成 — node tools/dump-terms.js\n" +
  names.join("\n") + "\n");
console.log(`${names.length}件 → ${path.relpath ? out : "data/existing-terms.txt"}`);
