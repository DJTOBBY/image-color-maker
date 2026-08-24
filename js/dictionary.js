/* 言葉 → 色の翻訳辞書
   場所・時間・季節・物語のことばを、色のアンカー(h,s,l)とトーンの気配に変換する。
   anchors: その言葉が呼び起こす色
   toneBias: PCCSトーンの傾向(先頭ほど優先)
   sparkle/matte: ビーズの加工の好み(ラスター・オーロラ系 / ツヤケシ系)
*/

const DICTIONARY = [
  // ===== 日本の場所 =====
  { match: ["tokyo", "東京", "トーキョー"], ja: "東京", story: "眠らない街の残像",
    anchors: [
      { h: 330, s: 85, l: 58, name: "ネオンピンク" },
      { h: 187, s: 80, l: 52, name: "電光シアン" },
      { h: 230, s: 30, l: 25, name: "ビル影の紺" },
    ],
    toneBias: ["v", "dk"], sparkle: true },
  { match: ["kyoto", "京都"], ja: "京都", story: "千年の都の襲の色目",
    anchors: [
      { h: 350, s: 45, l: 42, name: "蘇芳" },
      { h: 45, s: 55, l: 55, name: "黄金茶" },
      { h: 100, s: 25, l: 40, name: "青苔" },
      { h: 280, s: 30, l: 35, name: "古代紫" },
    ],
    toneBias: ["dp", "d"], matte: true },
  { match: ["setouchi", "瀬戸内"], ja: "瀬戸内", story: "凪いだ内海と島影",
    anchors: [
      { h: 200, s: 45, l: 62, name: "凪の水色" },
      { h: 185, s: 30, l: 50, name: "島影の青緑" },
      { h: 40, s: 45, l: 78, name: "陽だまりの砂" },
      { h: 25, s: 65, l: 60, name: "みかん色" },
    ],
    toneBias: ["sf", "lt"] },
  { match: ["okinawa", "沖縄", "ryukyu", "琉球"], ja: "沖縄", story: "珊瑚礁と紅型の島",
    anchors: [
      { h: 178, s: 75, l: 55, name: "珊瑚礁の海" },
      { h: 350, s: 80, l: 60, name: "紅型の紅" },
      { h: 50, s: 85, l: 60, name: "ハイビスカスの黄" },
    ],
    toneBias: ["b", "v"] },
  { match: ["hokkaido", "北海道"], ja: "北海道", story: "雪原とラベンダーの大地",
    anchors: [
      { h: 210, s: 20, l: 88, name: "雪原の白" },
      { h: 270, s: 40, l: 65, name: "ラベンダー" },
      { h: 110, s: 35, l: 45, name: "牧草の緑" },
    ],
    toneBias: ["p", "ltg"] },
  { match: ["fuji", "富士"], ja: "富士", story: "霊峰の暁",
    anchors: [
      { h: 225, s: 40, l: 40, name: "藍鼠" },
      { h: 355, s: 65, l: 70, name: "曙の红" },
      { h: 220, s: 15, l: 90, name: "冠雪の白" },
    ],
    toneBias: ["sf", "dp"] },

  // ===== 世界の場所 =====
  { match: ["paris", "パリ"], ja: "パリ", story: "灰色の屋根とカフェの灯",
    anchors: [
      { h: 220, s: 12, l: 60, name: "亜鉛屋根のグレー" },
      { h: 40, s: 60, l: 62, name: "カフェオレ" },
      { h: 350, s: 55, l: 55, name: "ボルドーの差し色" },
    ],
    toneBias: ["ltg", "g", "d"], matte: true },
  { match: ["london", "ロンドン"], ja: "ロンドン", story: "霧とレンガの街",
    anchors: [
      { h: 220, s: 15, l: 55, name: "霧のグレー" },
      { h: 10, s: 55, l: 40, name: "赤レンガ" },
      { h: 150, s: 35, l: 30, name: "ブリティッシュグリーン" },
    ],
    toneBias: ["g", "dk"], matte: true },
  { match: ["newyork", "new york", "ニューヨーク", "nyc"], ja: "ニューヨーク", story: "摩天楼のコントラスト",
    anchors: [
      { h: 45, s: 90, l: 55, name: "イエローキャブ" },
      { h: 220, s: 25, l: 22, name: "鉄骨の紺鼠" },
      { h: 0, s: 0, l: 92, name: "スカイラインの白" },
    ],
    toneBias: ["v", "dkg"] },
  { match: ["england", "イングランド"], ja: "イングランド", story: "湖水地方の伝統色",
    anchors: [
      { h: 150, s: 35, l: 32, name: "ハンターグリーン" },
      { h: 15, s: 55, l: 42, name: "テラコッタ" },
      { h: 45, s: 45, l: 70, name: "コッツウォルズの石" },
      { h: 215, s: 45, l: 35, name: "ネイビーブレザー" },
    ],
    toneBias: ["dp", "d"], matte: true },
  { match: ["nordic", "scandinavia", "北欧", "スカンジナビア"], ja: "北欧", story: "白夜と針葉樹",
    anchors: [
      { h: 200, s: 25, l: 85, name: "白夜の空" },
      { h: 160, s: 25, l: 40, name: "針葉樹" },
      { h: 20, s: 50, l: 60, name: "木肌のオレンジ" },
    ],
    toneBias: ["ltg", "sf"], matte: true },
  { match: ["morocco", "モロッコ", "marrakech", "マラケシュ"], ja: "モロッコ", story: "土壁とマジョレルブルー",
    anchors: [
      { h: 18, s: 60, l: 55, name: "土壁のテラコッタ" },
      { h: 235, s: 75, l: 45, name: "マジョレルブルー" },
      { h: 45, s: 70, l: 55, name: "スパイスの黄" },
    ],
    toneBias: ["dp", "s"] },
  { match: ["desert", "砂漠", "sahara", "サハラ"], ja: "砂漠", story: "風紋と蜃気楼",
    anchors: [
      { h: 35, s: 55, l: 68, name: "砂丘のベージュ" },
      { h: 20, s: 65, l: 50, name: "赤土" },
      { h: 200, s: 40, l: 70, name: "蜃気楼の空" },
    ],
    toneBias: ["sf", "d"], matte: true },

  // ===== 自然・風景 =====
  { match: ["sea", "ocean", "海", "うみ"], ja: "海", story: "深さを変える青のグラデーション",
    anchors: [
      { h: 195, s: 70, l: 55, name: "浅瀬のターコイズ" },
      { h: 215, s: 65, l: 40, name: "沖の群青" },
      { h: 220, s: 20, l: 90, name: "波頭の白" },
    ],
    toneBias: ["b", "dp"], technique: "色相のグラデーション" },
  { match: ["forest", "森", "woods"], ja: "森", story: "木漏れ日と深い緑",
    anchors: [
      { h: 120, s: 40, l: 30, name: "深緑" },
      { h: 90, s: 45, l: 55, name: "木漏れ日の黄緑" },
      { h: 30, s: 40, l: 35, name: "幹の焦茶" },
    ],
    toneBias: ["dp", "d"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["mountain", "山", "alps", "アルプス"], ja: "山", story: "稜線の遠近",
    anchors: [
      { h: 220, s: 30, l: 45, name: "遠山の青" },
      { h: 140, s: 30, l: 38, name: "山肌の緑" },
      { h: 220, s: 12, l: 85, name: "霞の白" },
    ],
    toneBias: ["g", "sf"] },
  { match: ["sakura", "桜", "cherry blossom", "チェリーブロッサム"], ja: "桜", story: "ひとひらの春",
    anchors: [
      { h: 345, s: 60, l: 85, name: "桜色" },
      { h: 335, s: 45, l: 70, name: "花影の薄紅" },
      { h: 95, s: 30, l: 60, name: "若葉" },
    ],
    toneBias: ["p", "lt"] },
  { match: ["lavender", "ラベンダー"], ja: "ラベンダー", story: "薄暮の香り",
    anchors: [
      { h: 270, s: 45, l: 68, name: "ラベンダー" },
      { h: 290, s: 30, l: 50, name: "モーヴ" },
    ],
    toneBias: ["sf", "ltg"] },
  { match: ["snow", "雪", "スノー"], ja: "雪", story: "音のない白",
    anchors: [
      { h: 210, s: 15, l: 92, name: "新雪の白" },
      { h: 210, s: 25, l: 75, name: "雪影の青" },
    ],
    toneBias: ["p", "ltg"], sparkle: true },
  { match: ["rain", "雨", "レイン"], ja: "雨", story: "濡れた石畳",
    anchors: [
      { h: 215, s: 20, l: 60, name: "雨雲のグレー" },
      { h: 200, s: 35, l: 45, name: "水たまりの青" },
    ],
    toneBias: ["ltg", "g"] },
  { match: ["storm", "嵐", "thunder"], ja: "嵐", story: "帯電した空",
    anchors: [
      { h: 250, s: 30, l: 25, name: "雷雲の鉄紺" },
      { h: 55, s: 90, l: 60, name: "稲光の黄" },
    ],
    toneBias: ["dkg", "v"] },

  // ===== 時間・光 =====
  { match: ["night", "夜", "ナイト"], ja: "夜", story: "灯りが際立つ闇",
    anchors: [{ h: 232, s: 45, l: 20, name: "夜の紺青" }],
    shift: { dl: -18, ds: -5 }, toneBias: ["dk", "dkg", "dp"],
    technique: "対照トーン配色", sparkle: true },
  { match: ["midnight", "ミッドナイト", "真夜中"], ja: "真夜中", story: "夜の底のしじま",
    anchors: [
      { h: 235, s: 50, l: 15, name: "ミッドナイトブルー" },
      { h: 260, s: 35, l: 25, name: "宵闇の紫紺" },
    ],
    shift: { dl: -24, ds: -8 }, toneBias: ["dkg", "dk"],
    technique: "対照トーン配色", sparkle: true },
  { match: ["dawn", "夜明け", "暁", "sunrise", "朝焼け"], ja: "夜明け", story: "群青が薔薇色にひらく刻",
    anchors: [
      { h: 350, s: 60, l: 72, name: "曙色" },
      { h: 25, s: 70, l: 65, name: "朝焼けの橙" },
      { h: 230, s: 40, l: 45, name: "残んの群青" },
    ],
    toneBias: ["lt", "sf"], technique: "色相のグラデーション" },
  { match: ["sunset", "夕焼け", "夕暮れ", "dusk", "サンセット"], ja: "夕暮れ", story: "燃えて沈む光",
    anchors: [
      { h: 15, s: 85, l: 55, name: "夕陽の緋" },
      { h: 40, s: 80, l: 60, name: "残照の金" },
      { h: 300, s: 30, l: 45, name: "暮れなずむ紫" },
    ],
    toneBias: ["s", "dp"], technique: "色相のグラデーション" },
  { match: ["morning", "朝", "モーニング"], ja: "朝", story: "洗いたての光",
    anchors: [
      { h: 55, s: 55, l: 80, name: "朝の光" },
      { h: 200, s: 40, l: 75, name: "澄んだ空気" },
    ],
    shift: { dl: 12 }, toneBias: ["lt", "p"] },
  { match: ["moon", "月", "ムーン"], ja: "月", story: "冴えた光の輪",
    anchors: [
      { h: 55, s: 30, l: 85, name: "月白" },
      { h: 230, s: 25, l: 30, name: "月夜の藍" },
    ],
    toneBias: ["p", "dkg"], sparkle: true, technique: "対照トーン配色" },
  { match: ["star", "星", "スター", "galaxy", "銀河"], ja: "星", story: "散らばる光の粒",
    anchors: [
      { h: 250, s: 45, l: 22, name: "星夜の紺" },
      { h: 50, s: 60, l: 82, name: "星明かり" },
    ],
    toneBias: ["dk", "p"], sparkle: true },

  // ===== 季節 =====
  { match: ["spring", "春", "スプリング"], ja: "春", story: "ほどけていく色",
    anchors: [
      { h: 345, s: 55, l: 80, name: "薄桜" },
      { h: 90, s: 45, l: 65, name: "若草" },
      { h: 55, s: 60, l: 75, name: "菜の花" },
    ],
    toneBias: ["p", "lt"] },
  { match: ["summer", "夏", "サマー"], ja: "夏", story: "眩しさの純度",
    anchors: [
      { h: 205, s: 80, l: 55, name: "夏空" },
      { h: 60, s: 85, l: 60, name: "向日葵" },
      { h: 0, s: 0, l: 95, name: "入道雲の白" },
    ],
    toneBias: ["v", "b"] },
  { match: ["autumn", "fall", "秋", "オータム"], ja: "秋", story: "実りと紅葉",
    anchors: [
      { h: 20, s: 70, l: 45, name: "紅葉の朱" },
      { h: 40, s: 65, l: 50, name: "黄金の稲穂" },
      { h: 30, s: 45, l: 32, name: "栗皮茶" },
      { h: 350, s: 55, l: 38, name: "深紅の蔦" },
    ],
    toneBias: ["dp", "d"], matte: true, technique: "ドミナントカラー配色" },
  { match: ["winter", "冬", "ウィンター"], ja: "冬", story: "張りつめた空気",
    anchors: [
      { h: 210, s: 25, l: 80, name: "冬空の淡青" },
      { h: 220, s: 30, l: 35, name: "凍てつく紺" },
      { h: 0, s: 0, l: 90, name: "霜の白" },
    ],
    toneBias: ["ltg", "dkg"] },

  // ===== 物語・気分 =====
  { match: ["folklore", "フォークロア", "民話"], ja: "フォークロア", story: "語り継がれる文様の色",
    anchors: [
      { h: 15, s: 55, l: 38, name: "刺繍の茜" },
      { h: 40, s: 50, l: 55, name: "亜麻色" },
      { h: 150, s: 30, l: 30, name: "森の言い伝えの緑" },
      { h: 350, s: 45, l: 30, name: "木苺の暗紅" },
    ],
    toneBias: ["d", "dp"], matte: true, technique: "トーナル配色" },
  { match: ["nostalgia", "nostalgic", "ノスタルジー", "ノスタルジック", "郷愁"], ja: "郷愁", story: "色褪せたアルバム",
    anchors: [
      { h: 35, s: 40, l: 60, name: "セピア" },
      { h: 180, s: 20, l: 55, name: "退色した青緑" },
    ],
    shift: { ds: -20 }, toneBias: ["g", "ltg"], matte: true, technique: "トーナル配色" },
  { match: ["retro", "レトロ", "showa", "昭和"], ja: "レトロ", story: "喫茶店の看板色",
    anchors: [
      { h: 15, s: 70, l: 50, name: "レトロオレンジ" },
      { h: 170, s: 45, l: 45, name: "青磁グリーン" },
      { h: 45, s: 60, l: 55, name: "からし色" },
      { h: 340, s: 40, l: 40, name: "小豆色" },
    ],
    toneBias: ["d", "s"], matte: true },
  { match: ["vintage", "ヴィンテージ", "antique", "アンティーク"], ja: "アンティーク", story: "時を吸った金属と布",
    anchors: [
      { h: 42, s: 45, l: 45, name: "真鍮" },
      { h: 350, s: 35, l: 35, name: "褪せたワイン" },
      { h: 200, s: 20, l: 40, name: "古い硝子の青" },
    ],
    toneBias: ["d", "dk"], matte: true },
  { match: ["neon", "ネオン", "cyber", "サイバー"], ja: "ネオン", story: "電気仕掛けの色",
    anchors: [
      { h: 320, s: 95, l: 60, name: "ネオンマゼンタ" },
      { h: 160, s: 90, l: 55, name: "ネオングリーン" },
      { h: 190, s: 95, l: 55, name: "エレクトリックブルー" },
    ],
    toneBias: ["v"], sparkle: true, technique: "対照色相配色" },
  { match: ["pastel", "パステル"], ja: "パステル", story: "砂糖菓子の棚",
    anchors: [], shift: { dl: 22, ds: -18 }, toneBias: ["p", "lt"],
    technique: "ドミナントトーン配色" },
  { match: ["tropical", "トロピカル"], ja: "トロピカル", story: "果実と極彩の鳥",
    anchors: [
      { h: 45, s: 90, l: 55, name: "マンゴー" },
      { h: 330, s: 80, l: 58, name: "ブーゲンビリア" },
      { h: 165, s: 75, l: 45, name: "椰子の緑" },
    ],
    toneBias: ["v", "b"], technique: "対照色相配色" },
  { match: ["ocean", "オーシャン", "marine", "マリン"], ja: "マリン", story: "潮風の白と紺",
    anchors: [
      { h: 215, s: 60, l: 35, name: "マリンネイビー" },
      { h: 0, s: 0, l: 95, name: "セイルの白" },
      { h: 5, s: 75, l: 50, name: "救命浮輪の赤" },
    ],
    toneBias: ["dp", "v"] },
  { match: ["fairy", "フェアリー", "fairytale", "おとぎ話"], ja: "おとぎ話", story: "ページの中の淡い光",
    anchors: [
      { h: 280, s: 40, l: 75, name: "妖精のすみれ" },
      { h: 180, s: 40, l: 78, name: "水の精の青" },
      { h: 350, s: 50, l: 82, name: "頬紅のピンク" },
    ],
    toneBias: ["p", "lt"], sparkle: true },
  { match: ["candy", "キャンディ", "sweets", "スイーツ"], ja: "キャンディ", story: "瓶詰めの甘さ",
    anchors: [
      { h: 345, s: 75, l: 70, name: "いちごミルク" },
      { h: 190, s: 65, l: 70, name: "ソーダ" },
      { h: 55, s: 80, l: 70, name: "レモンドロップ" },
    ],
    toneBias: ["lt", "b"] },
  { match: ["aquarium", "水族館", "アクアリウム"], ja: "水族館", story: "青い光の回廊",
    anchors: [
      { h: 200, s: 70, l: 45, name: "水槽の青" },
      { h: 175, s: 55, l: 60, name: "揺れる水面" },
      { h: 230, s: 45, l: 25, name: "深海の闇" },
      { h: 15, s: 70, l: 60, name: "熱帯魚の朱" },
    ],
    toneBias: ["dp", "lt"], sparkle: true, technique: "対照トーン配色" },
  { match: ["mode", "モード", "chic", "シック", "monochrome", "モノクロ"], ja: "モード", story: "無彩色の緊張感",
    anchors: [
      { h: 0, s: 0, l: 10, name: "黒" },
      { h: 0, s: 0, l: 95, name: "白" },
      { h: 0, s: 0, l: 55, name: "グレー" },
    ],
    toneBias: ["dkg"], technique: "セパレーション" },
];

// テーマ文字列を辞書エントリの列に解決する
function lookupTheme(input) {
  const raw = input.trim();
  const lower = raw.toLowerCase().replace(/[_\-]+/g, " ");
  const hits = [];
  for (const entry of DICTIONARY) {
    for (const m of entry.match) {
      const isAscii = /^[a-z ]+$/.test(m);
      const found = isAscii
        ? new RegExp(`(^|[^a-z])${m.replace(/ /g, "\\s*")}([^a-z]|$)`).test(lower)
        : raw.includes(m);
      if (found) { hits.push({ entry, token: m }); break; }
    }
  }
  // 「夜」⊂「真夜中」のような包含ヒットは長い方だけ残す
  const filtered = hits.filter(h =>
    !hits.some(o => o !== h && o.token.length > h.token.length && o.token.includes(h.token)));
  return filtered.map(h => h.entry);
}

// 辞書に無い言葉のフォールバック: 文字列から色相を決める
function hashFallback(input) {
  let h = 0;
  for (const ch of input) h = (h * 31 + ch.codePointAt(0)) % 360;
  return {
    ja: input.trim(), story: "この言葉だけの色",
    anchors: [
      { h, s: 55, l: 55, name: "面影の色" },
      { h: (h + 40) % 360, s: 45, l: 65, name: "残響の色" },
    ],
    toneBias: ["sf", "d"],
  };
}
