/* トレンドカラー年表
   - PANTONE Color of the Year(2000〜2025)
   - 年代パレット(60s〜2020s、Y2K、昭和・平成レトロ)
   「2016 SPRING」「Y2K TOKYO」「90年代の海」のような入力に反応する。
*/

const PANTONE_COY = {
  2000: [{ hex: "#9BB7D4", name: "セルリアンブルー" }],
  2001: [{ hex: "#C74375", name: "フューシャローズ" }],
  2002: [{ hex: "#BF1932", name: "トゥルーレッド" }],
  2003: [{ hex: "#7BC4C4", name: "アクアスカイ" }],
  2004: [{ hex: "#E2583E", name: "タイガーリリー" }],
  2005: [{ hex: "#53B0AE", name: "ブルーターコイズ" }],
  2006: [{ hex: "#DECDBE", name: "サンドダラー" }],
  2007: [{ hex: "#9B1B30", name: "チリペッパー" }],
  2008: [{ hex: "#5A5B9F", name: "ブルーアイリス" }],
  2009: [{ hex: "#F0C05A", name: "ミモザ" }],
  2010: [{ hex: "#45B5AA", name: "ターコイズ" }],
  2011: [{ hex: "#D94F70", name: "ハニーサックル" }],
  2012: [{ hex: "#DD4124", name: "タンジェリンタンゴ" }],
  2013: [{ hex: "#009473", name: "エメラルド" }],
  2014: [{ hex: "#B163A3", name: "ラディアントオーキッド" }],
  2015: [{ hex: "#955251", name: "マルサラ" }],
  2016: [{ hex: "#F7CAC9", name: "ローズクォーツ" }, { hex: "#92A8D1", name: "セレニティ" }],
  2017: [{ hex: "#88B04B", name: "グリーナリー" }],
  2018: [{ hex: "#5F4B8B", name: "ウルトラバイオレット" }],
  2019: [{ hex: "#FF6F61", name: "リビングコーラル" }],
  2020: [{ hex: "#0F4C81", name: "クラシックブルー" }],
  2021: [{ hex: "#939597", name: "アルティメットグレー" }, { hex: "#F5DF4D", name: "イルミネイティング" }],
  2022: [{ hex: "#6667AB", name: "ベリーペリ" }],
  2023: [{ hex: "#BB2649", name: "ビバマゼンタ" }],
  2024: [{ hex: "#FFBE98", name: "ピーチファズ" }],
  2025: [{ hex: "#A47864", name: "モカムース" }],
};

const DECADES = {
  1920: { ja: "1920年代", story: "アールデコとジャズエイジ — 黒と金の狂騒",
    colors: [
      { hex: "#16161A", name: "タキシードの黒" },
      { hex: "#C9A227", name: "アールデコの金" },
      { hex: "#E8D9B0", name: "シャンパン" },
      { hex: "#1E6B52", name: "エメラルド" },
    ], toneBias: ["dkg", "dp"], sparkle: true, technique: "対照トーン配色" },
  1930: { ja: "1930年代", story: "銀幕のハリウッド — バイアスドレスの光沢",
    colors: [
      { hex: "#D9C289", name: "シャンパンゴールド" },
      { hex: "#C0C2C9", name: "銀幕のシルバー" },
      { hex: "#C79098", name: "ダスティローズ" },
      { hex: "#24344D", name: "ミッドナイトブルー" },
    ], toneBias: ["ltg", "g"], sparkle: true },
  1940: { ja: "1940年代", story: "ユーティリティの時代 — カーキと勝利の赤",
    colors: [
      { hex: "#7A6A45", name: "カーキ" },
      { hex: "#2C3A5B", name: "ネイビー" },
      { hex: "#B22234", name: "ビクトリーレッド" },
      { hex: "#C9B99B", name: "ユーティリティベージュ" },
    ], toneBias: ["d", "dk"], matte: true, technique: "トーナル配色" },
  1950: { ja: "1950年代", story: "フィフティーズ — ダイナーとニュールックの甘い色",
    colors: [
      { hex: "#D2374A", name: "チェリーレッド" },
      { hex: "#9FD9C3", name: "ミントグリーン" },
      { hex: "#F4C6CE", name: "ペールピンク" },
      { hex: "#4FB6C6", name: "ダイナーターコイズ" },
      { hex: "#F4EAD5", name: "クリーム" },
    ], toneBias: ["lt", "b"] },
  1960: { ja: "1960年代", story: "サイケデリック・ポップの時代",
    colors: [
      { hex: "#ED6D00", name: "ポップオレンジ" },
      { hex: "#E7609E", name: "ショッキングピンク" },
      { hex: "#A8C700", name: "ライムグリーン" },
      { hex: "#00A3AF", name: "ターコイズ" },
    ], toneBias: ["v", "b"] },
  1970: { ja: "1970年代", story: "アースカラーとフォークの時代",
    colors: [
      { hex: "#6B8E23", name: "アボカドグリーン" },
      { hex: "#D9A62E", name: "ハーベストゴールド" },
      { hex: "#7B5544", name: "ウッドブラウン" },
      { hex: "#C55A11", name: "バーントオレンジ" },
    ], toneBias: ["d", "dp"], matte: true },
  1980: { ja: "1980年代", story: "ネオンとバブルの時代",
    colors: [
      { hex: "#FF2D95", name: "ホットピンク" },
      { hex: "#0892D0", name: "エレクトリックブルー" },
      { hex: "#E7F03D", name: "ネオンイエロー" },
      { hex: "#7C4DFF", name: "ビビッドパープル" },
    ], toneBias: ["v"], sparkle: true, technique: "対照色相配色" },
  1990: { ja: "1990年代", story: "グランジと渋カジの時代",
    colors: [
      { hex: "#5F6B3C", name: "モスグリーン" },
      { hex: "#7C2B36", name: "バーガンディ" },
      { hex: "#3F5E78", name: "デニムブルー" },
      { hex: "#C7A252", name: "マスタード" },
    ], toneBias: ["d", "dk"], matte: true, technique: "トーナル配色" },
  2010: { ja: "2010年代", story: "ミレニアルピンクとくすみの始まり",
    colors: [
      { hex: "#F4C2C2", name: "ミレニアルピンク" },
      { hex: "#B76E79", name: "ローズゴールド" },
      { hex: "#98D7C2", name: "ミントグリーン" },
      { hex: "#B5A79B", name: "グレージュ" },
    ], toneBias: ["ltg", "sf"] },
  2020: { ja: "2020年代", story: "くすみカラーとニュアンスの時代",
    colors: [
      { hex: "#C89FA3", name: "ダスティピンク" },
      { hex: "#9CAF88", name: "セージグリーン" },
      { hex: "#B0603C", name: "テラコッタ" },
      { hex: "#0F4C81", name: "クラシックブルー" },
    ], toneBias: ["g", "ltg"], matte: true, technique: "トーナル配色" },
};

// 世紀単位の歴史パレット(1400年代〜1910年代)。storyに色彩史の背景を添える
const CENTURIES = {
  1400: { ja: "15世紀・初期ルネサンス", story: "ラピスラズリを砕いたウルトラマリンは金より高価で、聖母の衣にだけ許された青だった",
    colors: [
      { hex: "#26428B", name: "ウルトラマリン" },
      { hex: "#C7391F", name: "辰砂の朱" },
      { hex: "#C9A227", name: "金箔" },
      { hex: "#6B6B3A", name: "緑土(テールヴェルト)" },
      { hex: "#EDE3CF", name: "象牙の地" },
    ], toneBias: ["dp"], sparkle: true },
  1500: { ja: "16世紀・盛期ルネサンス", story: "ティツィアーノの赤とヴェネツィア派の黄金 — 油彩が色に深みを与えた世紀",
    colors: [
      { hex: "#8B1E2D", name: "ティツィアーノの赤" },
      { hex: "#B87F33", name: "ヴェネツィアの金褐" },
      { hex: "#2F5D3A", name: "ドレープの深緑" },
      { hex: "#D8D3C8", name: "真珠の灰" },
    ], toneBias: ["dp", "dk"] },
  1600: { ja: "17世紀・バロック", story: "カラヴァッジョとレンブラント — 闇(キアロスクーロ)が光を生んだ世紀",
    colors: [
      { hex: "#2B1D12", name: "闇の焦茶" },
      { hex: "#B07A24", name: "レンブラントの金褐" },
      { hex: "#7E1F1F", name: "深紅のドレープ" },
      { hex: "#E8C87A", name: "蝋燭の光" },
    ], toneBias: ["dkg", "dk"], technique: "対照トーン配色" },
  1700: { ja: "18世紀・ロココ", story: "ポンパドゥール夫人のパステルとセーヴル磁器の青 — 宮廷が甘い色に染まった世紀",
    colors: [
      { hex: "#E8A0AE", name: "ローズ・ポンパドゥール" },
      { hex: "#A9C8E8", name: "セーヴルの空色" },
      { hex: "#B5C99A", name: "ピスタチオ" },
      { hex: "#F2E7D3", name: "クリーム" },
      { hex: "#CBA135", name: "金彩" },
    ], toneBias: ["p", "lt"], technique: "ドミナントトーン配色" },
  1800: { ja: "19世紀", story: "1856年、パーキンの合成染料モーヴが誕生 — 色が貴族から大衆のものになった世紀",
    colors: [
      { hex: "#915C83", name: "パーキンのモーヴ" },
      { hex: "#732636", name: "ヴィクトリアンボルドー" },
      { hex: "#2E4A34", name: "ビリヤードの深緑" },
      { hex: "#A8C4DD", name: "印象派の空色" },
      { hex: "#8A6D4F", name: "セピア" },
    ], toneBias: ["d", "dp"], matte: true },
  1900: { ja: "1900年代・ベルエポック", story: "ミュシャとアールヌーヴォー — 曲線と黄金、ポスターが街を飾った時代",
    colors: [
      { hex: "#C29B40", name: "ミュシャの金褐" },
      { hex: "#C48A8A", name: "くすんだ薔薇" },
      { hex: "#77743B", name: "オリーブ" },
      { hex: "#2E6E63", name: "孔雀の青緑" },
      { hex: "#EFE6D0", name: "アイボリー" },
    ], toneBias: ["sf", "d"] },
};

const ERAS = [
  { match: ["y2k"], ja: "Y2K", story: "ミレニアムの光沢 — シルバーとベビーカラー",
    colors: [
      { hex: "#C9CDD2", name: "メタリックシルバー" },
      { hex: "#F5C7D8", name: "ベビーピンク" },
      { hex: "#9BD3EE", name: "スカイブルー" },
      { hex: "#C7B9E2", name: "ライラック" },
    ], toneBias: ["p", "lt"], sparkle: true },
  { match: ["平成レトロ", "平成"], ja: "平成レトロ", story: "ファンシー雑貨のパステルポップ",
    colors: [
      { hex: "#F7A8C4", name: "ファンシーピンク" },
      { hex: "#8CD7E8", name: "ソーダブルー" },
      { hex: "#FBEA8C", name: "クリームイエロー" },
      { hex: "#B9E4C9", name: "メロンソーダ" },
    ], toneBias: ["lt", "b"] },
];

function trendEntryFromColors(ja, story, colors, extra = {}) {
  return {
    ja, story,
    anchors: colors.map(c => {
      const [h, s, l] = rgbToHsl(...hexToRgb(c.hex));
      return { h, s, l, name: c.name, locked: true };
    }),
    toneBias: extra.toneBias || [],
    sparkle: extra.sparkle, matte: extra.matte, technique: extra.technique,
    isTrend: true,
  };
}

// 入力からトレンド指定を拾って辞書エントリ形式で返す
function trendLookup(input) {
  const entries = [];
  const lower = input.toLowerCase();

  // 西暦(1400〜2029)
  const yearMatch = lower.match(/(1[4-9]\d\d|20[0-2]\d)/);
  if (yearMatch) {
    const year = Number(yearMatch[1]);
    if (year < 1920) {
      // 世紀単位の歴史パレット(1900-1919はベルエポック)
      const cent = CENTURIES[year >= 1900 ? 1900 : Math.floor(year / 100) * 100];
      if (cent) entries.push(trendEntryFromColors(cent.ja, cent.story, cent.colors, cent));
      return entries;
    }
    if (PANTONE_COY[year]) {
      entries.push(trendEntryFromColors(
        `${year}年のトレンド`,
        `${year}年 PANTONE Color of the Year「${PANTONE_COY[year].map(c => c.name).join("と")}」`,
        PANTONE_COY[year]));
    } else {
      const dec = DECADES[Math.floor(year / 10) * 10];
      if (dec) {
        // 同じ年代でも年ごとに主役の色と明暗を少し変える(世界観は年代のまま)
        const offset = year % dec.colors.length;
        const rotated = [...dec.colors.slice(offset), ...dec.colors.slice(0, offset)];
        const entry = trendEntryFromColors(`${year}年(${dec.ja})`, dec.story, rotated, dec);
        const dl = ((year % 7) - 3) * 1.5; // -4.5〜+4.5の明度ゆらぎ
        entry.anchors.forEach((a, i) => {
          a.l = Math.max(8, Math.min(92, a.l + dl + (i % 2 ? -2 : 2)));
        });
        entries.push(entry);
      }
    }
    return entries;
  }

  // 年代表記(90s / 90年代 / 1970s など)
  const decMatch = lower.match(/(19|20)?([2-9]0|10)\s*(?:s|'s|年代)/);
  if (decMatch) {
    let d = Number(decMatch[2]);
    if (decMatch[1] === "19") d += 1900;
    else if (decMatch[1] === "20") d += 2000;
    else d += (d >= 30 ? 1900 : 2000); // 「30〜90年代」単独は20世紀、「10・20年代」は21世紀と解釈
    const dec = DECADES[d];
    if (dec) { entries.push(trendEntryFromColors(dec.ja, dec.story, dec.colors, dec)); return entries; }
  }

  // 時代のことば(Y2K・平成レトロ)
  for (const era of ERAS) {
    if (era.match.some(m => lower.includes(m) || input.includes(m))) {
      entries.push(trendEntryFromColors(era.ja, era.story, era.colors, era));
      break;
    }
  }
  return entries;
}
