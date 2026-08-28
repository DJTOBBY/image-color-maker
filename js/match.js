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

  // 色名の芯が金属を指すか。「残照の金」「蒔絵の金」は金属だが、
  // 「金木犀の橙」「黄金の稲穂」は金属ではない。名前は「〜の◯◯」の形が
  // 多いので、最後の「の」より後ろだけを見る。
  // 金と銀は分ける。「金」に銀メッキが来ると名前と合わない。
  // 「金緑」「金青」は金属ではなく緑や青のこと。金は除いて後ろの色で見る。
  // 「金茶」「金黄」は金そのものの色なので残す。
  const GOLD_NAME = /(?<!白)金(?![緑青紫黒])|ゴールド|真鍮|銅|箔/;
  const SILVER_NAME = /銀|シルバー|白金|プラチナ|ニッケル/;
  const GOLD_FINISH = /本金メッキ|コゲ金|金彩|銅メッキ/;
  const SILVER_FINISH = /銀メッキ|ニッケルメッキ|仁丹メッキ/;
  const METAL_FINISH = /メッキ|メタリック|金彩|コゲ金/;
  // これ以上離れた色は、金属でも別の色として見える。優遇しない
  const METAL_MAX_D = 30;

  // 金色・銀色に見えるかは、加工名だけでは分からない。
  // No.22 は「銀メッキ」だが、茶の透明ガラスの内側に銀を引いてあるので
  // 見た目は金色になる。カタログの色分類(colorJa)にはそれが「金」と
  // 書かれているので、そちらを主な手がかりにする。
  // メッキ加工40件に対し、金と分類されたビーズは118件ある。
  const looksGold = b => /金/.test(b.colorJa || "") || GOLD_FINISH.test(b.finish);
  const looksSilver = b => /銀/.test(b.colorJa || "") || SILVER_FINISH.test(b.finish);
  function metalKind(name) {
    const tail = String(name || "").split("の").pop();
    if (GOLD_NAME.test(tail)) return "gold";
    if (SILVER_NAME.test(tail)) return "silver";
    if (/メタリック/.test(tail)) return "any";
    return null;
  }

  // パレットの各色に近いビーズを探す(品番は重複させない)
  // inventory: 手持ち品番のSet。inventoryOnly=true なら手持ちだけから選ぶ
  // pinned: 色ごとに「必ず先頭に出すビーズの品番」。
  // ユーザーが「このビーズを使う」と指定した品番は、色名の判定などで弾かれずに必ず出す
  function match(colors, { sparkle = false, matte = false, perColor = 3,
                           inventory = null, inventoryOnly = false } = {}) {
    const usedCodes = new Set();
    const pool = (inventoryOnly && inventory && inventory.size > 0)
      ? beads.filter(b => inventory.has(b.code))
      : beads;
    return colors.map(color => {
      const lab = hexToLab(color.hex);
      const target = { h: color.h, s: color.s, l: color.l };
      const metal = metalKind(color.name);
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
          if (metal) {
            // 「金」「銀」と名づけた色には、金属の加工を選ぶ。
            // これがないと「残照の金」に蛍光の黄色が来てしまう。
            //
            // 明るく冴えた金に近い金属ビーズは無い(最寄りでも距離20超)。
            // それでも、金と名づけた色にはガラスの黄より金属を出したい。
            // 素材のほうが名前に忠実だからで、大きく優遇する。
            // ただし色がかけ離れているものまで拾わないよう、上限を設ける。
            // 銀メッキでも実測が金色に出るビーズがあるので、系統が違っても採る。
            if (d < METAL_MAX_D) {
              const hit = metal === "gold" ? looksGold(b)
                        : metal === "silver" ? looksSilver(b)
                        : (looksGold(b) || looksSilver(b));
              // 選び方は三段。メッキ系をいちばん優先する。
              //   1. メッキ系で、その金属の色に見えるもの
              //   2. メッキ系(別の金属でも、金属の質感はある)
              //   3. メッキではないが金・銀と分類されたもの(パールなど)
              // 渋い金ならメッキ玉が4前後まで近づくが、冴えた金には
              // 20以上離れたものしかない(トーホーに冴えた金の玉が無い)。
              // それでも名前が金なら金の玉を出したいので、大きく引く。
              const plated = METAL_FINISH.test(b.finish);
              if (plated && hit) d -= 20;
              else if (plated) d -= 14;
              else if (hit) d -= 10;
            }
          } else if (!sparkle && /玉虫|メッキ|メタリック/.test(b.finish)) {
            // 玉虫・メッキ系は計測色と見た目が乖離しやすい。
            // キラキラ指定のないテーマでは減点
            d += 4;
          }
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

      // 「このビーズを使う」で指定された品番は、必ず先頭に置く。
      // (色は一致していても、公式色名が目標色と食い違うと減点で埋もれてしまうため)
      if (color.seedCode) {
        const seed = beads.find(b => b.code === color.seedCode);
        if (seed) {
          const rest = picks.filter(p => p.bead.code !== seed.code);
          picks.length = 0;
          picks.push({ bead: seed, d: 0, owned: inventory ? inventory.has(seed.code) : false },
                     ...rest.slice(0, perColor - 1));
        }
      }

      if (picks.length) usedCodes.add(picks[0].bead.code);
      return picks;
    });
  }

  // 品番からビーズを1つ引く(「939F」「TOHO 939F」「no.939f」などの揺れを吸収する)
  function findByCode(input) {
    if (!beads) return null;
    const key = String(input).toUpperCase()
      .replace(/TOHO/g, "").replace(/NO\.?/g, "").replace(/[#\s]/g, "").trim();
    if (!key) return null;
    return beads.find(b => b.code.toUpperCase() === key)
        || beads.find(b => b.code.toUpperCase().replace(/[-\s]/g, "") === key.replace(/[-\s]/g, ""))
        || null;
  }

  function ready() { return !!beads; }

  return { load, match, worksFor, findByCode, ready };
})();
