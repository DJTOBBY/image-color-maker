/* 色の連想(抽象的な連想)
   講座資料の連想調査表(『色のしくみ』2008調査)に基づく色系統→連想語 */

const ASSOCIATIONS = {
  "赤":     ["情熱", "興奮", "エネルギー", "強さ"],
  "橙":     ["元気", "陽気", "親しみ", "暖かさ"],
  "黄":     ["明るさ", "希望", "活発", "幸福"],
  "緑":     ["癒し", "自然", "安心", "すがすがしさ"],
  "青":     ["冷静", "知的", "清潔", "落ち着き"],
  "藍":     ["和", "クール", "深み", "誠実"],
  "紫":     ["神秘", "優雅", "上品", "不思議"],
  "ピンク": ["恋", "幸せ", "やわらかさ", "若々しさ"],
  "白":     ["純粋", "清潔", "神聖", "始まり"],
  "黒":     ["高級", "重厚", "フォーマル", "スマート"],
  "茶":     ["安定", "素朴", "温もり", "自然"],
  "グレー": ["都会的", "洗練", "控えめ", "静けさ"],
};

// HSLから連想の色系統を判定する
function associationFamily(h, s, l) {
  if (s < 10) {
    if (l >= 85) return "白";
    if (l <= 18) return "黒";
    return "グレー";
  }
  if (l <= 22 && (h >= 200 && h <= 270)) return "藍";
  // 茶: 暗めで彩度控えめの暖色
  if (h >= 15 && h <= 50 && l < 50 && s < 65) return "茶";
  if (h < 12 || h >= 342) return (l >= 70 || (s < 60 && l >= 60)) ? "ピンク" : "赤";
  if (h < 42) return "橙";
  if (h < 68) return "黄";
  if (h < 165) return "緑";
  if (h < 250) return "青";
  if (h < 315) return "紫";
  return (l >= 60) ? "ピンク" : "赤";
}

// パレット全体の連想語(重複を除いて最大5語)
function paletteAssociations(colors) {
  const words = [];
  for (const c of colors) {
    const fam = associationFamily(c.h, c.s, c.l);
    for (const w of (ASSOCIATIONS[fam] || []).slice(0, 2)) {
      if (!words.includes(w)) words.push(w);
    }
  }
  return words.slice(0, 5);
}
