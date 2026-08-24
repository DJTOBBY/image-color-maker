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

  // 一般的な丸ビーズ(丸小・丸大・丸中・特小・特大)を優先する
  const ROUND_RE = /^(丸小|丸大|丸中|特小|特大)ビーズ/;
  function isRound(b) { return (b.shapes || [b.shape]).some(s => ROUND_RE.test(s)); }

  // 目標色(HSL)に対して「あり得る公式色名」を求める。範囲は誤検出を避けるため広めに取る
  const HUE_WORDS = [
    ["赤",       t => t.s > 20 && (t.h >= 340 || t.h < 20)],
    ["ピンク",   t => t.s > 12 && (t.h >= 310 || t.h < 25) && t.l >= 50],
    ["オレンジ", t => t.s > 20 && t.h >= 12 && t.h < 48],
    ["茶",       t => t.h >= 8 && t.h < 55 && t.l < 50 && t.s > 10],
    ["アンバー", t => t.h >= 8 && t.h < 55 && t.l < 55 && t.s > 10],
    ["銅",       t => t.h >= 8 && t.h < 55 && t.l < 55 && t.s > 10],
    ["肌",       t => t.h >= 8 && t.h < 48 && t.l >= 55 && t.s > 8 && t.s < 65],
    ["クリーム", t => t.h >= 30 && t.h < 70 && t.l >= 68],
    ["黄",       t => t.s > 20 && t.h >= 40 && t.h < 75],
    ["黄緑",     t => t.s > 12 && t.h >= 60 && t.h < 110],
    ["緑",       t => t.s > 10 && t.h >= 90 && t.h < 185],
    ["ターコイス", t => t.s > 12 && t.h >= 155 && t.h < 210],
    ["水",       t => t.s > 10 && t.h >= 175 && t.h < 220 && t.l >= 52],
    ["青",       t => t.s > 10 && t.h >= 185 && t.h < 262],
    ["紺",       t => t.h >= 200 && t.h < 275 && t.l < 42],
    ["紫",       t => t.s > 8 && t.h >= 248 && t.h < 330],
    ["白",       t => t.l >= 80 && t.s < 25],
    ["グレー",   t => t.s < 14 && t.l >= 22 && t.l < 82],
    ["黒",       t => t.l < 24],
  ];
  const HUE_WORD_SET = new Set(HUE_WORDS.map(([w]) => w));

  // 公式色名との整合スコア: 合致すればマイナス(優遇)、矛盾すればプラス(減点)
  function colorWordScore(bead, target) {
    const allowed = new Set(HUE_WORDS.filter(([, test]) => test(target)).map(([w]) => w));
    const beadWords = (bead.colorJa || "").split("・").filter(w => HUE_WORD_SET.has(w));
    if (beadWords.length === 0) return 0; // 透・金・ミックス等のみ→中立
    return beadWords.some(w => allowed.has(w)) ? -3 : 9;
  }

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
      const target = { h: color.h, s: color.s, l: color.l };
      const ranked = pool
        .filter(b => !usedCodes.has(b.code))
        .map(b => {
          // 明るさより色みの一致を重視した距離
          let d = Math.hypot(
            (lab[0] - b.lab[0]) * 0.8,
            (lab[1] - b.lab[1]) * 1.3,
            (lab[2] - b.lab[2]) * 1.3);
          d += colorWordScore(b, target); // 公式色名との裏取り
          if (sparkle && SPARKLE_RE.test(b.finish)) d -= 4;
          if (matte && MATTE_RE.test(b.finish)) d -= 4;
          // 玉虫・メッキ系は計測色と見た目が乖離しやすい。キラキラ指定のないテーマでは減点
          if (!sparkle && /玉虫|メッキ|メタリック/.test(b.finish)) d += 4;
          if (b.buy) d -= 2; // 購入リンクがある品を少し優遇
          if (inventory && inventory.has(b.code)) d -= 3; // 手持ちを少し優遇
          return { bead: b, d, owned: inventory ? inventory.has(b.code) : false };
        })
        .sort((a, b) => a.d - b.d);

      // 丸ビーズを中心に選び、他の形は「明らかに近い」時だけ最後の1枠に添える
      const rounds = ranked.filter(r => isRound(r.bead));
      const others = ranked.filter(r => !isRound(r.bead));
      const picks = rounds.slice(0, perColor);
      while (picks.length < perColor && others.length) picks.push(others.shift());
      if (picks.length === perColor && others.length &&
          others[0].d + 3 < picks[perColor - 1].d && !isRound(others[0].bead)) {
        picks[perColor - 1] = others[0];
      }
      if (picks.length) usedCodes.add(picks[0].bead.code);
      return picks;
    });
  }

  return { load, match, worksFor };
})();
