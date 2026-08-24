/* トーホービーズ実品番へのマッチング
   data/beads.json(Finderの実物写真計測色 + カタログ情報)を使用 */

const BeadMatcher = (() => {
  let beads = null;
  let works = [];

  async function load() {
    if (beads) return beads;
    // シェア用単一ファイル版では window.__BEADS__ にデータが埋め込まれている
    if (window.__BEADS__) {
      beads = window.__BEADS__.beads.map(b => ({ ...b, lab: hexToLab(b.hex) }));
      works = (window.__WORKS__ && window.__WORKS__.works) || [];
      return beads;
    }
    const res = await fetch("data/beads.json");
    const json = await res.json();
    beads = json.beads.map(b => ({ ...b, lab: hexToLab(b.hex) }));
    // 作品事例は任意データ(無ければ黙って空のまま)
    try {
      const w = await fetch("data/works.json");
      if (w.ok) works = (await w.json()).works || [];
    } catch (_) {}
    return beads;
  }
  function worksFor(input) {
    const lower = input.toLowerCase();
    return works.filter(w => (w.keywords || []).some(k => lower.includes(String(k).toLowerCase())));
  }

  const SPARKLE_RE = /ラスター|オーロラ|メッキ|金彩|玉虫|パール|ブロンズ|サニー/;
  const MATTE_RE = /ツヤケシ/;

  // パレットの各色に近いビーズを探す(品番は重複させない)
  // inventory: 手持ち品番のSet。inventoryOnly=true なら手持ちだけから選ぶ
  function match(colors, { sparkle = false, matte = false, perColor = 3,
                           inventory = null, inventoryOnly = false } = {}) {
    const usedCodes = new Set();
    const pool = (inventoryOnly && inventory && inventory.size > 0)
      ? beads.filter(b => inventory.has(b.code))
      : beads;
    return colors.map(color => {
      const lab = hexToLab(color.hex);
      const ranked = pool
        .filter(b => !usedCodes.has(b.code))
        .map(b => {
          let d = labDist(lab, b.lab);
          if (sparkle && SPARKLE_RE.test(b.finish)) d -= 4;
          if (matte && MATTE_RE.test(b.finish)) d -= 4;
          if (b.buy) d -= 2; // 購入リンクがある品を少し優遇
          if (inventory && inventory.has(b.code)) d -= 3; // 手持ちを少し優遇
          return { bead: b, d, owned: inventory ? inventory.has(b.code) : false };
        })
        .sort((a, b) => a.d - b.d)
        .slice(0, perColor);
      if (ranked.length) usedCodes.add(ranked[0].bead.code);
      return ranked;
    });
  }

  return { load, match, worksFor };
})();
