/* PCCS(日本色研配色体系)の簡易実装
   「ビーズワークのためのカラーディプロマ講座」資料に準拠:
   - 12色相(2:R 〜 24:RP)
   - 12トーン + 無彩色(W/Gy/Bk)
   - トーンのイメージ語
*/

const PCCS = (() => {
  // 12色相(講座ワークシートと同じ構成)。degはHSL色相の代表値
  const HUES = [
    { no: 2,  sym: "R",  ja: "赤",           deg: 0 },
    { no: 4,  sym: "rO", ja: "赤みのだいだい", deg: 20 },
    { no: 6,  sym: "yO", ja: "黄みのだいだい", deg: 35 },
    { no: 8,  sym: "Y",  ja: "黄",           deg: 52 },
    { no: 10, sym: "YG", ja: "黄緑",         deg: 80 },
    { no: 12, sym: "G",  ja: "緑",           deg: 140 },
    { no: 14, sym: "BG", ja: "青緑",         deg: 170 },
    { no: 16, sym: "gB", ja: "緑みの青",     deg: 197 },
    { no: 18, sym: "B",  ja: "青",           deg: 218 },
    { no: 20, sym: "V",  ja: "青紫",         deg: 258 },
    { no: 22, sym: "P",  ja: "紫",           deg: 288 },
    { no: 24, sym: "RP", ja: "赤紫",         deg: 325 },
  ];

  // 12トーン。cs/cl はHSL空間での代表中心(彩度・明度)
  const TONES = {
    v:   { ja: "ビビッド",           cs: 90, cl: 50, words: ["冴えた", "鮮やかな", "派手な", "生き生きした"] },
    b:   { ja: "ブライト",           cs: 75, cl: 64, words: ["明るい", "健康的な", "陽気な", "華やかな"] },
    s:   { ja: "ストロング",         cs: 68, cl: 45, words: ["強い", "動的な", "情熱的な"] },
    dp:  { ja: "ディープ",           cs: 72, cl: 32, words: ["深い", "濃い", "充実した", "伝統的な", "和風の"] },
    lt:  { ja: "ライト",             cs: 58, cl: 77, words: ["浅い", "澄んだ", "さわやかな", "楽しい"] },
    sf:  { ja: "ソフト",             cs: 42, cl: 64, words: ["柔らかな", "穏やかな", "ぼんやりした"] },
    d:   { ja: "ダル",               cs: 42, cl: 45, words: ["鈍い", "くすんだ", "中間色の"] },
    dk:  { ja: "ダーク",             cs: 45, cl: 24, words: ["暗い", "大人っぽい", "丈夫な", "円熟した"] },
    p:   { ja: "ペール",             cs: 30, cl: 88, words: ["薄い", "軽い", "優しい", "淡い", "かわいい"] },
    ltg: { ja: "ライトグレイッシュ", cs: 18, cl: 70, words: ["落ち着いた", "淡い", "おとなしい"] },
    g:   { ja: "グレイッシュ",       cs: 18, cl: 45, words: ["灰みの", "濁った", "地味な"] },
    dkg: { ja: "ダークグレイッシュ", cs: 18, cl: 20, words: ["陰気な", "重い", "硬い", "男性的な"] },
  };

  const NEUTRALS = [
    { key: "W",    ja: "ホワイト", maxL: 101, minL: 88, words: ["清潔な", "冷たい", "新鮮な"] },
    { key: "ltGy", ja: "ライトグレイ", maxL: 88, minL: 65, words: ["スモーキーな", "しゃれた"] },
    { key: "mGy",  ja: "ミディアムグレイ", maxL: 65, minL: 42, words: ["スモーキーな", "寂しい"] },
    { key: "dkGy", ja: "ダークグレイ", maxL: 42, minL: 20, words: ["シックな", "おしゃれな"] },
    { key: "Bk",   ja: "ブラック", maxL: 20, minL: -1, words: ["高級な", "フォーマルな", "締まった"] },
  ];

  function hueDist(a, b) {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  }

  // HSL(h:0-360, s:0-100, l:0-100)→ PCCS色相・トーン分類
  function classify(h, s, l) {
    if (s < 9) {
      const n = NEUTRALS.find(n => l >= n.minL && l < n.maxL) || NEUTRALS[4];
      return { neutral: true, toneKey: n.key, toneJa: n.ja, words: n.words, label: n.key };
    }
    let hue = HUES[0];
    for (const cand of HUES) {
      if (hueDist(h, cand.deg) < hueDist(h, hue.deg)) hue = cand;
    }
    let toneKey = "v", best = Infinity;
    for (const [key, t] of Object.entries(TONES)) {
      const d = (s - t.cs) ** 2 + ((l - t.cl) * 1.4) ** 2;
      if (d < best) { best = d; toneKey = key; }
    }
    const tone = TONES[toneKey];
    return {
      neutral: false,
      hueNo: hue.no, hueSym: hue.sym, hueJa: hue.ja,
      toneKey, toneJa: tone.ja, words: tone.words,
      label: `${toneKey}${hue.no}`,
      pccsName: `${hue.no}:${hue.sym} ${hue.ja} / ${tone.ja}`,
    };
  }

  // トーンの中心に向けて彩度・明度を寄せる(0-1で強さ指定)
  function pullToTone(s, l, toneKey, amount = 0.55) {
    const t = TONES[toneKey];
    if (!t) return { s, l };
    return {
      s: s + (t.cs - s) * amount,
      l: l + (t.cl - l) * amount,
    };
  }

  // ナチュラルハーモニー: 黄(deg≈52)に近い色相は明るく、青紫(deg≈258)に近い色相は暗く
  // complex=true でコンプレックスハーモニー(逆転)
  function naturalHarmony(h, l, strength = 8, complex = false) {
    const toYellow = 1 - hueDist(h, 52) / 180;   // 1=黄に一致
    const toViolet = 1 - hueDist(h, 258) / 180;
    let dl = (toYellow - toViolet) * strength;
    if (complex) dl = -dl;
    return Math.max(4, Math.min(96, l + dl));
  }

  return { HUES, TONES, NEUTRALS, classify, pullToTone, naturalHarmony, hueDist };
})();
