/* パレット生成
   辞書のアンカー色 + PCCSトーン + 配色技法で、テーマを5〜8色に翻訳する。 */

// ---------- 色ユーティリティ ----------
function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)].map(v => Math.round(v * 255));
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}
function hslToHex(h, s, l) { return rgbToHex(...hslToRgb(h, s, l)); }
function hexToRgb(hex) {
  const m = hex.replace("#", "");
  return [0, 2, 4].map(i => parseInt(m.slice(i, i + 2), 16));
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return [h, s * 100, l * 100];
}
// hex → CIE Lab(ビーズマッチング用)
function hexToLab(hex) {
  let [r, g, b] = hexToRgb(hex).map(v => {
    v /= 255;
    return v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92;
  });
  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  [x, y, z] = [f(x), f(y), f(z)];
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
function labDist(a, b) {
  return Math.hypot(a[0] - b[0], (a[1] - b[1]) * 0.9, (a[2] - b[2]) * 0.9);
}

// ---------- 配色技法の解説(講座資料の用語) ----------
const TECHNIQUES = {
  "類似色相配色": "色相環で隣り合う色相でまとめる配色。似た色同士でまとまりやすく、分量に差をつけるのがコツ。",
  "対照色相配色": "色相環で120°〜180°離れた色相の組み合わせ。強いコントラストの個性的な配色。",
  "対照トーン配色": "低彩度×高彩度、低明度×高明度など、対照的に離れたトーンの組み合わせ。闇に灯りが映えるようなコントラスト。",
  "ドミナントカラー配色": "同一色相でトーンに変化をつけ、ひとつの色相に支配させる配色。",
  "ドミナントトーン配色": "同一トーンで色相に変化をつける配色。トーンの気分が全体を支配する。",
  "トーン・オン・トーン配色": "同一色相でトーン違いを重ねる、おとなしく良く調和する濃淡配色。",
  "トーナル配色": "ダル(くすみ)トーン中心の中彩度配色。シックで調和のとれた大人の配色。",
  "色相のグラデーション": "色相をなだらかに変化させる配色。空や海の移ろいをそのまま写す。",
  "ナチュラルハーモニー": "黄に近い色相を明るく、青紫に近い色相を暗く。自然界の見え方に沿った、最もなじみ深い調和。",
  "コンプレックスハーモニー": "自然の見えと逆に、黄寄りを暗く青寄りを明るく。違和感が新鮮で目を引く配色。",
  "セパレーション": "色の境目に無彩色を挟んで引き締める技法。",
  "カマイユ配色": "色相・明度・彩度ともに微妙な差でまとめる、デリケートで繊細な配色。",
};

// ---------- パレット生成 ----------
function generatePalette(input, count = 6) {
  // 色語(青・BLUE など)があればパレットの主役に据える
  const cw = typeof lookupColorWords === "function"
    ? lookupColorWords(input) : { colors: [], shift: { dl: 0, ds: 0 } };
  const colorEntries = cw.colors.map(c => colorWordEntry(c, cw.shift));
  const themeEntries = [
    ...(typeof trendLookup === "function" ? trendLookup(input) : []),
    ...(typeof WaColor !== "undefined" ? WaColor.lookup(input) : []),
    ...lookupTheme(input),
  ];
  // 同じ名前のエントリ(色語の「水色」と伝統色の「水色」など)は先勝ちでひとつに
  const seen = new Set();
  let entries = [...colorEntries, ...themeEntries].filter(e => {
    if (seen.has(e.ja)) return false;
    seen.add(e.ja);
    return true;
  });
  const usedFallback = entries.length === 0;
  if (usedFallback) entries = [hashFallback(input)];

  // アンカーとバイアスを集める
  const anchors = [];
  const toneBias = [];
  let shift = { dl: 0, ds: 0 }, shiftCount = 0;
  let sparkle = false, matte = false, technique = null;
  for (const e of entries) {
    for (const a of (e.anchors || [])) anchors.push({ ...a, from: e.ja, lead: !!e.isColorWord });
    for (const t of (e.toneBias || [])) if (!toneBias.includes(t)) toneBias.push(t);
    if (e.shift) { shift.dl += e.shift.dl || 0; shift.ds += e.shift.ds || 0; shiftCount++; }
    if (e.sparkle) sparkle = true;
    if (e.matte) matte = true;
    if (e.technique && !technique) technique = e.technique;
  }
  // 複数の言葉のシフトは平均し、強すぎる暗転・退色を防ぐ
  if (shiftCount > 1) { shift.dl /= shiftCount; shift.ds /= shiftCount; }
  shift.dl = Math.max(-24, Math.min(24, shift.dl));
  shift.ds = Math.max(-24, Math.min(24, shift.ds));
  // 色語が指定されたら、その色相から遠すぎる色は落とす(「JAPAN BLUE」に桃色が混ざらないように)
  if (colorEntries.length) {
    const leadHues = colorEntries.map(e => e.hue);
    const near = anchors.filter(a => a.lead || a.s < 18 ||
      leadHues.some(h => PCCS.hueDist(a.h, h) <= 100));
    if (near.length >= 2) anchors.splice(0, anchors.length, ...near);
    // 主役の色語を先頭に(mainとして技法や展開の基準になる)
    anchors.sort((a, b) => (b.lead ? 1 : 0) - (a.lead ? 1 : 0));
    // 修飾語(dark/淡い など)はテーマ側の色にも効かせる
    shift.dl += cw.shift.dl; shift.ds += cw.shift.ds;
    shift.dl = Math.max(-28, Math.min(28, shift.dl));
    shift.ds = Math.max(-28, Math.min(28, shift.ds));
  }

  if (anchors.length === 0) anchors.push({ h: 220, s: 30, l: 50, name: "無題の色", from: input });

  // 技法を決める(辞書指定がなければアンカーの色相分布から)
  if (!technique) {
    const hues = anchors.filter(a => a.s > 12).map(a => a.h);
    const spread = hues.length > 1
      ? Math.max(...hues.map((h, i) => hues.slice(i + 1).map(h2 => PCCS.hueDist(h, h2))).flat(), 0)
      : 0;
    if (spread >= 100) technique = "対照色相配色";
    else if (spread >= 35) technique = "類似色相配色";
    else if (toneBias.length >= 2 && toneBias[0] !== toneBias[1]) technique = "トーン・オン・トーン配色";
    else technique = "ドミナントカラー配色";
  }
  const complex = technique === "コンプレックスハーモニー";

  // 候補色を増やす: アンカー + 技法に沿った展開
  const candidates = anchors.map(a => ({ ...a }));
  const main = anchors[0];
  const expansions = [
    { h: main.h, s: main.s * 0.8, l: Math.min(88, main.l + 26), name: `${main.name}のティント` },
    { h: main.h, s: main.s * 0.9, l: Math.max(14, main.l - 24), name: `${main.name}のシェード` },
  ];
  if (technique === "類似色相配色" || technique === "色相のグラデーション") {
    expansions.push(
      { h: (main.h + 28) % 360, s: main.s, l: main.l + 8, name: "となりの色相" },
      { h: (main.h + 332) % 360, s: main.s, l: main.l - 8, name: "もうひとつの隣" },
    );
  }
  // 色語で色相を指定されているときは、補色を足すと「的確さ」が濁るので入れない
  if (!colorEntries.length && (technique === "対照色相配色" || technique === "対照トーン配色")) {
    expansions.push({ h: (main.h + 180) % 360, s: Math.min(85, main.s + 10), l: main.l, name: "対岸の色" });
  }
  if (technique === "対照トーン配色") {
    // 闇に灯りが映えるように、シフトの影響を受けない明るいアクセントを保証する
    expansions.push({ h: (main.h + 40) % 360, s: 62, l: 82, name: "灯りの色", noShift: true });
  }
  for (const ex of expansions) candidates.push({ ...ex, from: main.from, derived: true });

  // トーンへ寄せる + 全体シフト + ナチュラルハーモニー
  const toneCycle = toneBias.length ? toneBias : ["sf"];
  candidates.forEach((c, i) => {
    if (c.locked) return; // トレンドの記録色などは原色のまま守る
    const l0 = c.l; // 補正前の明度(名前の付け直し判定に使う)
    if (c.s > 18) {
      const tone = toneCycle[i % toneCycle.length];
      const pulled = PCCS.pullToTone(c.s, c.l, tone, c.derived ? 0.35 : 0.45);
      // 色の素性を守る: 彩度の増加と明度の移動に上限を設ける
      c.s = Math.min(pulled.s, c.s + 14);
      c.l = c.l + Math.max(-20, Math.min(20, pulled.l - c.l));
    }
    if (!c.noShift) {
      c.s = Math.max(0, Math.min(100, c.s + shift.ds));
      c.l = Math.max(5, Math.min(95, c.l + shift.dl));
    }
    if (c.s > 12) c.l = PCCS.naturalHarmony(c.h, c.l, 7, complex);
    // 元の色から大きく変わったのに名前が元のまま、というズレを防ぐ
    // (色語から作った「淡い青」などは既に名前が明暗を語っているので触らない)
    if (!c.derived && !c.lead && !/[夜宵闇暁淡薄深明暗]/.test(c.name)) {
      if (c.l - l0 <= -15) c.name = `宵の${c.name}`;
      else if (c.l - l0 >= 15) c.name = `淡い${c.name}`;
    }
  });

  // 多様性を保ちながらcount色選ぶ(貪欲 max-min Lab距離)
  const withLab = candidates.map(c => ({ ...c, hex: hslToHex(c.h, c.s, c.l) }))
    .map(c => ({ ...c, lab: hexToLab(c.hex) }));
  const picked = [withLab[0]];
  while (picked.length < Math.min(count, withLab.length)) {
    let best = null, bestScore = -1;
    for (const c of withLab) {
      if (picked.includes(c)) continue;
      const score = Math.min(...picked.map(p => labDist(c.lab, p.lab)))
        + (c.derived ? 0 : 12); // 本来のアンカーを優先
    if (score > bestScore) { bestScore = score; best = c; }
    }
    if (!best) break;
    if (bestScore < 9 && picked.length >= 5) break; // 5色に満たないうちは近い色も許容
    picked.push(best);
  }

  // 明→暗に並べ、PCCS分類を付ける
  picked.sort((a, b) => b.l - a.l);
  const usedWaNames = new Set();
  const colors = picked.map(c => {
    const wa = typeof WaColor !== "undefined"
      ? WaColor.nearest(c.hex, 26, usedWaNames) : null;
    // 「青のティント」のような機械的な名前は、近い伝統色の名前に置き換える
    const plain = c.lead || /(のティント|のシェード)$/.test(c.name);
    const name = (colorEntries.length && plain && wa) ? wa.name : c.name;
    if (wa) usedWaNames.add(wa.name);
    return {
      hex: c.hex, h: c.h, s: c.s, l: c.l,
      name, from: c.from,
      pccs: PCCS.classify(c.h, c.s, c.l),
      wa: wa && wa.name === name ? null : wa,
    };
  });

  // 技法ラベルを実際の色相・トーン分布と突き合わせて補正する
  const chroma = colors.filter(c => !c.pccs.neutral);
  if (chroma.length > 1) {
    const spreadNow = Math.max(...chroma.map((c, i) =>
      chroma.slice(i + 1).map(c2 => PCCS.hueDist(c.h, c2.h))).flat(), 0);
    const toneKinds = new Set(chroma.map(c => c.pccs.toneKey)).size;
    if ((technique === "ドミナントカラー配色" || technique === "トーン・オン・トーン配色") && spreadNow >= 70) {
      technique = toneKinds <= 3 ? "ドミナントトーン配色" : "対照色相配色";
    }
  }

  // トーンのイメージ語(講座資料のトーン概念表から)
  const moodWords = [...new Set(colors.flatMap(c => c.pccs.words.slice(0, 2)))].slice(0, 5);

  return {
    input, entries, usedFallback, colors,
    technique, techniqueNote: TECHNIQUES[technique] || "",
    moodWords, sparkle, matte,
    associations: typeof paletteAssociations === "function" ? paletteAssociations(colors) : [],
    story: entries.map(e => e.story).filter(Boolean).join("、"),
  };
}
