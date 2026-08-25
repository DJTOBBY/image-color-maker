/* 作ったパレットをブラウザに保存して、あとから呼び出す。
   保存するのは復元に必要な最小限(テーマ・色数・技法の番号・残した色)だけ。
   色そのものは同じ入力から必ず同じ結果になるので、保存しなくても再現できる。 */

const SavedPalettes = (() => {
  const KEY = "csp-saved";
  const MAX = 60;

  function all() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch (_) { return []; }
  }
  function write(list) { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); }

  // 同じ設定のものは二重に保存しない
  function keyOf(p) {
    return [p.input, p.count, p.variant, (p.locked || []).map(l => l.hex).sort().join(",")].join("|");
  }

  function has(p) {
    const k = keyOf(p);
    return all().some(s => keyOf(s) === k);
  }

  function add(palette, lockedList) {
    const item = {
      id: Date.now().toString(36),
      input: palette.input,
      count: palette.colors.length,
      variant: palette.variant || 0,
      locked: (lockedList || []).map(l => ({ hex: l.hex, name: l.name })),
      technique: palette.technique,
      // 一覧に色を並べるためだけの控え
      swatches: palette.colors.map(c => c.hex),
      savedAt: new Date().toISOString(),
    };
    if (has(item)) return null;
    const list = all();
    list.unshift(item);
    write(list);
    return item;
  }

  function remove(id) { write(all().filter(s => s.id !== id)); }
  function clear() { localStorage.removeItem(KEY); }

  return { all, add, remove, clear, has, keyOf };
})();
