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
  "同一色相配色": "同一色相内の配色。良く調和するが、変化に乏しいため明度・彩度で差をつける。",
  "類似色相配色": "色相環で隣り合う色相でまとめる配色。似た色同士でまとまりやすく、分量に差をつけるのがコツ。",
  "中差色相配色": "色相環で左右に90°の角度をもった色同士の配色。明快なコントラストをもった配色になる。",
  "対照色相配色": "色相環で120°〜180°離れた色相の組み合わせ。強いコントラストの個性的な配色。",
  "補色配色": "色相環で180°の関係にある色同士の配色。非常に強いコントラストの個性的な配色。2色を混色すると灰色になる。",
  "対照トーン配色": "低彩度×高彩度、低明度×高明度など、対照的に離れたトーンの組み合わせ。闇に灯りが映えるようなコントラスト。",
  "ドミナントカラー配色": "同一色相でトーンに変化をつけ、ひとつの色相に支配させる配色。",
  "ドミナントトーン配色": "同一トーンで色相に変化をつける配色。トーンの気分が全体を支配する。",
  "トーン・オン・トーン配色": "同一色相でトーン違いを重ねる、おとなしく良く調和する濃淡配色。",
  "トーナル配色": "ダル(くすみ)トーン中心の中彩度配色。シックで調和のとれた大人の配色。",
  "色相のグラデーション": "色相をなだらかに変化させる配色。空や海の移ろいをそのまま写す。",
  "トーンのグラデーション": "同一色相の中でトーンを秩序だって変化させる配色。",
  "ナチュラルハーモニー": "黄に近い色相を明るく、青紫に近い色相を暗く。自然界の見え方に沿った、最もなじみ深い調和。",
  "コンプレックスハーモニー": "自然の見えと逆に、黄寄りを暗く青寄りを明るく。違和感が新鮮で目を引く配色。",
  "セパレーション": "色の境目に明度差をつけた無彩色などを挟み込み、色を分ける方法。",
  "リピテーション配色": "統一感の欠ける配色であっても、繰り返して使用することで秩序のある配色が得られる方法。",
  "カマイユ配色": "色相・明度・彩度ともに微妙な差でまとめる、デリケートで繊細な配色。",
  "フォ・カマイユ配色": "フォは「偽の、偽りの」という意味。カマイユより、同一色相+類似色相の分だけやや変化に富んだ配色。",
};

// 技法モード専用: 入力文字列から決定的にひとつの色相(0-360)を選ぶ
function techniqueDefaultHue(input) {
  let h = 0;
  for (const ch of input) h = (h * 31 + ch.codePointAt(0)) % 360;
  return h;
}

// ---------- パレット生成 ----------
// variant: 「別の配色を試す」で技法だけを差し替えるときの番号(0=辞書どおり)
// locked: 残したい色の配列 [{hex, name}]。指定するとその色は必ずパレットに含まれ、
//         残りの枠だけが選び直される
function generatePalette(input, count = 6, variant = 0, locked = []) {
  // 色語(青・BLUE など)があればパレットの主役に据える
  const cw = typeof lookupColorWords === "function"
    ? lookupColorWords(input) : { colors: [], shift: { dl: 0, ds: 0 } };

  // 配色技法そのものが指定されたら(「カマイユ 青」「セパレーション」等)、
  // PCCS理論に沿って厳密にその技法だけでパレットを組み立てる
  const techKey = typeof lookupTechniqueWord === "function" ? lookupTechniqueWord(input) : null;
  const techniqueMode = !!techKey;
  let colorEntries = cw.colors.map(c => colorWordEntry(c, cw.shift));
  let themeEntries, entries, usedFallback;

  if (techniqueMode) {
    const baseHue = cw.colors.length ? cw.colors[0].h : techniqueDefaultHue(input);
    const techEntry = buildTechniquePalette(techKey, baseHue);
    // dark/pale などの修飾語があれば、確定色にも明度・彩度で反映する
    if (cw.shift.dl || cw.shift.ds) {
      techEntry.anchors = techEntry.anchors.map(a => ({
        ...a,
        l: Math.max(6, Math.min(96, a.l + cw.shift.dl)),
        s: Math.max(0, Math.min(100, a.s + cw.shift.ds)),
      }));
    }
    entries = [techEntry];
    themeEntries = [];
    colorEntries = []; // 技法モードではanchorsを直接使うため、色語側のanchorsは混ぜない
    usedFallback = false;
  } else {
    themeEntries = [
      ...(typeof trendLookup === "function" ? trendLookup(input) : []),
      ...(typeof WaColor !== "undefined" ? WaColor.lookup(input) : []),
      ...lookupTheme(input),
    ];
    // 同じ名前のエントリ(色語の「水色」と伝統色の「水色」など)は先勝ちでひとつに
    const seen = new Set();
    entries = [...colorEntries, ...themeEntries].filter(e => {
      if (seen.has(e.ja)) return false;
      seen.add(e.ja);
      return true;
    });
    usedFallback = entries.length === 0;
    if (usedFallback) entries = [hashFallback(input)];
  }

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
    if (e.isTechnique) technique = e.ja; // 技法モードでは自動判定より常に優先
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

  // 「別の配色を試す」: テーマの色相・物語はそのままに、配色技法だけを差し替える。
  // テーマが持つ主役の色相を基準に、技法のルールで色を組み直す。
  let variantTechniqueKey = null;
  if (!techniqueMode && variant > 0 && typeof TECHNIQUE_CYCLE !== "undefined") {
    variantTechniqueKey = TECHNIQUE_CYCLE[(variant - 1) % TECHNIQUE_CYCLE.length];
    const chromaAnchors = anchors.filter(a => a.s > 15);
    const baseHue = (chromaAnchors[0] || anchors[0]).h;
    const rebuilt = buildTechniquePalette(variantTechniqueKey, baseHue);
    // 色相の関係は技法どおりに保ちつつ、トーン(渋さ・淡さ)はテーマの気配を継がせたいので、
    // lockedを外して通常のトーン補正パスを通す
    const revoiced = rebuilt.anchors.map(({ locked, ...a }) => a);
    // テーマの無彩色(墨・生成りなど)は「らしさ」の骨格なので残す
    const neutrals = anchors.filter(a => a.s <= 15).slice(0, 2);
    anchors.splice(0, anchors.length, ...revoiced, ...neutrals);
    technique = rebuilt.ja;
  }

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

  // 候補色を増やす: アンカー + 技法に沿った展開(技法モードは既に確定色なので展開しない)
  const candidates = anchors.map(a => ({ ...a }));
  const main = anchors[0];
  const expansions = [];
  if (variantTechniqueKey && anchors.length < count) {
    // 技法の色相関係は壊さず、明度違い(同一色相)だけで色数を補う
    for (const a of anchors.filter(x => x.s > 15).slice(0, 3)) {
      expansions.push({ h: a.h, s: a.s * 0.7, l: Math.min(90, a.l + 24), name: `${a.name}のティント` });
      expansions.push({ h: a.h, s: a.s * 0.9, l: Math.max(12, a.l - 22), name: `${a.name}のシェード` });
    }
  }
  if (!techniqueMode && !variantTechniqueKey) {
    expansions.push(
      { h: main.h, s: main.s * 0.8, l: Math.min(88, main.l + 26), name: `${main.name}のティント` },
      { h: main.h, s: main.s * 0.9, l: Math.max(14, main.l - 24), name: `${main.name}のシェード` },
    );
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

  // 残したい色(ロック)があれば、それを軸に組み直す。
  // ロック色の色相からトーン違いを足して候補を増やす — こうしないと候補が
  // すぐ尽きて「再生成しても同じ色ばかり」になる
  const lockedList = (locked || []).filter(l => l && /^#[0-9a-fA-F]{6}$/.test(l.hex));
  if (lockedList.length && !techniqueMode) {
    // 極端に暗い/濁ったトーン(dk・dkg・g)は入れない。
    // 距離が大きいぶん選ばれやすく、テーマから浮いた「黒っぽい色」になりやすいため
    const toneKeys = ["p", "lt", "sf", "b", "s", "d", "dp"];
    for (const l of lockedList) {
      const [lh, ls, ll] = rgbToHsl(...hexToRgb(l.hex));
      if (ls < 12) continue; // 無彩色からトーン展開しても濁るだけ
      for (const key of toneKeys) {
        const t = PCCS.TONES[key];
        // ロック色そのものと近すぎるものは足さない
        if (Math.abs(t.cl - ll) < 12 && Math.abs(t.cs - ls) < 15) continue;
        candidates.push({
          h: lh, s: t.cs, l: t.cl,
          name: `${l.name || "残した色"}の${t.ja}`,
          from: l.name, derived: true, fromLocked: true,
        });
      }
    }
  }

  // 多様性を保ちながらcount色選ぶ(貪欲 max-min Lab距離)
  const withLab = candidates.map(c => ({ ...c, hex: hslToHex(c.h, c.s, c.l) }))
    .map(c => ({ ...c, lab: hexToLab(c.hex) }));

  // ロック色は必ず残す。候補側の同じ色は重複するので除いておく
  const lockedPicked = lockedList.map(l => ({
    ...l, locked: true,
    ...(([h, s, lg]) => ({ h, s, l: lg }))(rgbToHsl(...hexToRgb(l.hex))),
    lab: hexToLab(l.hex),
  }));
  const lockedHexes = new Set(lockedPicked.map(l => l.hex.toLowerCase()));
  const pool = withLab.filter(c => !lockedHexes.has(c.hex.toLowerCase()));

  const picked = lockedPicked.length ? [...lockedPicked] : [pool.length ? pool[0] : withLab[0]];
  while (picked.length < count) {
    let best = null, bestScore = -1;
    for (const c of pool) {
      if (picked.includes(c)) continue;
      // 色数が少ないほど「テーマ本来の色」を強く優先する。
      // (2〜3色では、対照性だけで選ぶとテーマの主役色が落ちてしまうため)
      const anchorBonus = count <= 3 ? 34 : count <= 4 ? 20 : 12;
      // ロック色から機械的に作ったトーン違いは、テーマ本来の色が尽きたときの控え
      const lockedPenalty = c.fromLocked ? 10 : 0;
      const score = Math.min(...picked.map(p => labDist(c.lab, p.lab)))
        + (c.derived ? 0 : anchorBonus) - lockedPenalty;
    if (score > bestScore) { bestScore = score; best = c; }
    }
    if (!best) break;
    // 指定色数に届くまでは近い色も許容する(2〜4色指定を必ず満たすため)
    if (bestScore < 9 && picked.length >= Math.max(5, count)) break;
    picked.push(best);
  }

  // 明→暗に並べ、PCCS分類を付ける
  picked.sort((a, b) => b.l - a.l);
  // 色を機械的に展開したときの仮の名前。物語を語らないので、伝統色名に置き換える対象
  const MACHINE_NAME = /(のティント|のシェード)$|^(となりの色相|もうひとつの隣|対岸の色|灯りの色|無題の色)$/;
  // 伝統色に該当が無いほど鮮烈な色のための、最後の名付け。
  // PCCSの色相とトーンの言葉で呼ぶ(「冴えた青」など)
  const fallbackName = (c) => {
    const p = PCCS.classify(c.h, c.s, c.l);
    if (p.neutral) return p.toneJa;
    const word = (p.words && p.words[0]) || "";
    return `${word}${p.hueJa}`;
  };
  // 元からある固有名(利休鼠など)を先に予約し、伝統色名の置換と衝突しないようにする
  const usedWaNames = new Set(
    picked.filter(c => !MACHINE_NAME.test(c.name)).map(c => c.name));
  const colors = picked.map(c => {
    // 「青のティント」「もうひとつの隣」のような機械的な名前は、近い伝統色の名前に置き換える。
    // (技法を直接指定したときは「カマイユの基準色」等の名前自体が説明になるので触らない)
    // ロックした色は、そのとき気に入った名前のまま残す
    const plain = !c.locked &&
      (c.lead || MACHINE_NAME.test(c.name) || !!variantTechniqueKey);
    // 置き換える名前が無いと機械名が資料に残ってしまうので、そのときだけ許容距離を広げる
    const wa = typeof WaColor !== "undefined"
      ? WaColor.nearest(c.hex, plain ? 40 : 26, usedWaNames) : null;
    let name = c.name;
    if (!techniqueMode && plain) {
      // 伝統色名が無ければPCCSの言葉で名付け、機械的な仮の名前は資料に残さない
      name = wa ? wa.name : (MACHINE_NAME.test(c.name) ? fallbackName(c) : c.name);
    }
    if (wa) usedWaNames.add(wa.name);
    return {
      hex: c.hex, h: c.h, s: c.s, l: c.l,
      name, from: c.from,
      locked: !!c.locked,
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

  // 複数の辞書ソースが同じ固有名(利休鼠など)を別々のアンカーとして持ち込むことがあるため、
  // 最終防波堤として名前の重複を解消する
  {
    const seenNames = new Set();
    for (const c of colors) {
      if (seenNames.has(c.name)) c.name = `もう一つの${c.name}`;
      seenNames.add(c.name);
    }
  }

  // トーンのイメージ語(講座資料のトーン概念表から)
  const moodWords = [...new Set(colors.flatMap(c => c.pccs.words.slice(0, 2)))].slice(0, 5);

  return {
    input, entries, usedFallback, colors,
    technique, techniqueNote: TECHNIQUES[technique] || "",
    moodWords, sparkle, matte, variant,
    // 「別の配色を試す」が使えるのは、技法を直接指定していない通常のテーマのとき
    canVary: !techniqueMode,
    associations: typeof paletteAssociations === "function" ? paletteAssociations(colors) : [],
    story: entries.map(e => e.story).filter(Boolean).join("、"),
  };
}
