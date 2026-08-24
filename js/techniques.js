/* 配色技法を直接指定するモード。
   「カマイユ 青」「セパレーション」「中差色相配色 黄」のように技法名を入力すると、
   PCCS理論に沿って厳密にその技法どおりのパレットを組み立てる。
   (講座資料「配色調和 色相を基準とした配色技法」「トーンを基準とした配色技法」
    「慣用的な配色技法」に準拠) */

const TECHNIQUE_WORDS = [
  { match: ["同一色相配色", "同一色相"], key: "monoHue" },
  { match: ["類似色相配色", "類似色相"], key: "analogousHue" },
  { match: ["中差色相配色", "中差色相"], key: "midHue" },
  { match: ["対照色相配色", "対照色相"], key: "contrastHue" },
  { match: ["補色配色", "補色"], key: "complementary" },
  { match: ["ドミナントカラー配色", "ドミナントカラー"], key: "dominantColor" },
  { match: ["ドミナントトーン配色", "ドミナントトーン", "トーン・イン・トーン配色", "トーンイントーン"], key: "dominantTone" },
  { match: ["トーン・オン・トーン配色", "トーンオントーン"], key: "toneOnTone" },
  { match: ["トーナル配色", "トーナル"], key: "tonal" },
  { match: ["フォ・カマイユ配色", "フォ・カマイユ", "フォカマイユ"], key: "fauxCamaieu" },
  { match: ["カマイユ配色", "カマイユ"], key: "camaieu" },
  { match: ["セパレーション配色", "セパレーション"], key: "separation" },
  { match: ["リピテーション配色", "リピテーション"], key: "repetition" },
  { match: ["色相のグラデーション", "色相グラデーション"], key: "hueGradation" },
  { match: ["トーンのグラデーション", "トーングラデーション"], key: "toneGradation" },
];

// 技法名を検出する(「フォ・カマイユ」が「カマイユ」に埋もれないよう、
// 実際に入力中で見つかった一致文字列の長さで比較する)
function lookupTechniqueWord(input) {
  const scored = TECHNIQUE_WORDS
    .map(t => ({ t, best: Math.max(0, ...t.match.filter(m => input.includes(m)).map(m => m.length)) }))
    .filter(x => x.best > 0);
  if (!scored.length) return null;
  scored.sort((a, b) => b.best - a.best);
  return scored[0].t.key;
}

function tone(key) { return PCCS.TONES[key]; }
// locked: palette.jsの色調補正(トーン寄せ・全体シフト・ナチュラルハーモニー)を一切受けない、確定色
function hx(h, s, l, name) { return { h: ((h % 360) + 360) % 360, s, l, name, locked: true }; }

// 各技法のビルダー。h=基準の色相、戻り値はアンカー配列(2〜6色)
const TECHNIQUE_BUILDERS = {
  monoHue(h) {
    const t = ["p", "lt", "sf", "s", "dk"].map(k => tone(k));
    return t.map((tn, i) => hx(h, tn.cs, tn.cl, ["最も淡く", "淡く", "中庸に", "強く", "最も深く"][i] + "染めた色"));
  },
  analogousHue(h) {
    const base = tone("s");
    return [
      hx(h - 25, base.cs, base.cl, "隣り合う色"),
      hx(h, base.cs, base.cl, "基準の色"),
      hx(h + 25, base.cs, base.cl, "もう一方の隣"),
      hx(h, base.cs * 0.5, Math.min(92, base.cl + 28), "基準の色のティント"),
    ];
  },
  midHue(h) {
    const base = tone("v");
    return [hx(h, base.cs, base.cl, "基準の色"), hx(h + 90, base.cs, base.cl, "90°離れた色"),
            hx(h - 90, base.cs * 0.7, base.cl + 10, "反対側の中差色")];
  },
  contrastHue(h) {
    const base = tone("s");
    return [hx(h, base.cs, base.cl, "基準の色"), hx(h + 140, base.cs, base.cl, "対照の色"),
            hx(h - 140, base.cs * 0.6, base.cl + 15, "もう一つの対照色")];
  },
  complementary(h) {
    const base = tone("v");
    return [hx(h, base.cs, base.cl, "基準の色"), hx(h + 180, base.cs, base.cl, "補色"),
            hx(h, base.cs * 0.3, 92, "基準の色のティント"), hx(h + 180, base.cs * 0.3, 20, "補色のシェード")];
  },
  dominantColor(h) {
    const t = ["p", "lt", "d", "dk"].map(k => tone(k));
    return t.map((tn, i) => hx(h, tn.cs, tn.cl, ["淡い支配色", "明るい支配色", "くすんだ支配色", "深い支配色"][i]));
  },
  dominantTone(h) {
    const t = tone("sf");
    const names = ["支配トーンの基準色", "支配トーンの色相2", "支配トーンの色相3", "支配トーンの色相4", "支配トーンの色相5"];
    return [0, 72, 144, 216, 288].map((dh, i) => hx(h + dh, t.cs, t.cl, names[i]));
  },
  toneOnTone(h) {
    const t = ["lt", "sf", "d", "dk"].map(k => tone(k));
    return t.map((tn, i) => hx(h, tn.cs, tn.cl, ["浅い濃淡", "柔らかな濃淡", "鈍い濃淡", "深い濃淡"][i]));
  },
  tonal(h) {
    const t = tone("d");
    const names = ["低め側のトーナル", "トーナルの基準色", "高め側のトーナル"];
    return [h - 30, h, h + 30].map((hh, i) => hx(hh, t.cs, t.cl + (i - 1) * 6, names[i]));
  },
  camaieu(h) {
    const t = tone("sf");
    const names = ["カマイユの微差色(暗)", "カマイユの微差色(やや暗)", "カマイユの基準色",
                   "カマイユの微差色(やや明)", "カマイユの微差色(明)"];
    return [-6, -2, 0, 3, 7].map((dh, i) => hx(h + dh, t.cs + dh, t.cl - dh * 0.6, names[i]));
  },
  fauxCamaieu(h) {
    const t = tone("sf");
    return [hx(h, t.cs, t.cl, "基準の色"), hx(h, t.cs * 0.8, t.cl + 14, "基準の色の変化"),
            hx(h + 20, t.cs, t.cl - 6, "隣接色相の色"), hx(h + 20, t.cs * 0.8, t.cl + 10, "隣接色相の変化")];
  },
  separation(h) {
    const t = tone("v");
    return [hx(h, t.cs, t.cl, "色その一"), hx(0, 0, 12, "セパレーションの黒"),
            hx(h + 150, t.cs, t.cl, "色その二")];
  },
  repetition(h) {
    const t = tone("s");
    return [hx(h, t.cs, t.cl, "くり返す色A"), hx(h + 150, t.cs, t.cl, "くり返す色B"),
            hx(h, t.cs * 0.7, t.cl + 16, "色Aの変化"), hx(0, 0, 92, "リズムの白")];
  },
  hueGradation(h) {
    return [0, 20, 40, 60, 80].map(dh => {
      const t = tone("s");
      return hx(h + dh, t.cs, t.cl, dh === 0 ? "グラデーションの起点" : `グラデーション+${dh}°`);
    });
  },
  toneGradation(h) {
    const t = ["p", "lt", "sf", "d", "dk", "dkg"].map(k => tone(k));
    return t.map((tn, i) => hx(h, tn.cs, tn.cl, `トーン段階${i + 1}`));
  },
};

const TECHNIQUE_JA_NAME = {
  monoHue: "同一色相配色", analogousHue: "類似色相配色", midHue: "中差色相配色",
  contrastHue: "対照色相配色", complementary: "補色配色", dominantColor: "ドミナントカラー配色",
  dominantTone: "ドミナントトーン配色", toneOnTone: "トーン・オン・トーン配色",
  tonal: "トーナル配色", camaieu: "カマイユ配色", fauxCamaieu: "フォ・カマイユ配色",
  separation: "セパレーション", repetition: "リピテーション配色",
  hueGradation: "色相のグラデーション", toneGradation: "トーンのグラデーション",
};

const TECHNIQUE_STORY = {
  monoHue: "ひとつの色相を、明度と彩度だけで語りつくす",
  analogousHue: "隣り合う色相で、静かにまとまる",
  midHue: "90°の距離が生む、ほどよい緊張感",
  contrastHue: "色相環の遠い者同士、はっきりとした対比",
  complementary: "真向かいの色同士、もっとも強いコントラスト",
  dominantColor: "ひとつの色相がすべてを支配する",
  dominantTone: "ひとつの気分が、色相を超えて全体を支配する",
  toneOnTone: "同じ色相の濃淡を積み重ねる、おとなしい調和",
  tonal: "くすみの効いた、大人のトーナル",
  camaieu: "ほとんど同じ色に見えるほどの、繊細な違い",
  fauxCamaieu: "カマイユよりわずかに動きのある、偽りの単色画",
  separation: "無彩色を挟んで、色の境界を引き締める",
  repetition: "秩序なく見える色も、くり返せば調和になる",
  hueGradation: "色相環をなだらかに歩いていく",
  toneGradation: "同じ色相の中を、明度で下りていく",
};

// 技法モードでパレットのアンカーを生成する(既存のcolorEntriesがあればその色相を基準に使う)
function buildTechniquePalette(techKey, baseHue) {
  const anchors = TECHNIQUE_BUILDERS[techKey](baseHue);
  return {
    ja: TECHNIQUE_JA_NAME[techKey],
    story: TECHNIQUE_STORY[techKey],
    anchors,
    isTechnique: true,
    techniqueKey: techKey,
  };
}
