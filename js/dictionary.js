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

  { match: ["japan", "nippon", "ジャパン", "日本"], ja: "日本", story: "藍と朱、金と墨の国",
    anchors: [
      { h: 220, s: 55, l: 28, name: "藍" },
      { h: 355, s: 70, l: 45, name: "朱" },
      { h: 45, s: 60, l: 52, name: "金" },
      { h: 0, s: 0, l: 22, name: "墨" },
      { h: 45, s: 25, l: 90, name: "生成り" },
    ], toneBias: ["dp", "s"] },

  // ===== 日本の街 =====
  { match: ["asakusa", "浅草"], ja: "浅草", story: "雷門の朱と提灯の灯",
    anchors: [
      { h: 355, s: 70, l: 45, name: "雷門の朱" },
      { h: 25, s: 80, l: 55, name: "提灯の橙" },
      { h: 220, s: 50, l: 30, name: "半纏の藍" },
      { h: 45, s: 60, l: 50, name: "金装飾" },
    ], toneBias: ["s", "dp"] },
  { match: ["kamakura", "鎌倉"], ja: "鎌倉", story: "紫陽花の路地と海霞",
    anchors: [
      { h: 240, s: 40, l: 65, name: "紫陽花の青紫" },
      { h: 110, s: 25, l: 42, name: "山門の苔" },
      { h: 210, s: 20, l: 62, name: "海霞の灰青" },
      { h: 30, s: 30, l: 40, name: "古材の茶" },
    ], toneBias: ["sf", "g"], matte: true },
  { match: ["kanazawa", "金沢"], ja: "金沢", story: "金箔と加賀友禅",
    anchors: [
      { h: 45, s: 65, l: 55, name: "金箔" },
      { h: 350, s: 55, l: 38, name: "友禅の臙脂" },
      { h: 220, s: 55, l: 32, name: "加賀の群青" },
      { h: 100, s: 25, l: 35, name: "兼六園の松" },
    ], toneBias: ["dp"], sparkle: true },
  { match: ["nara", "奈良"], ja: "奈良", story: "鹿と古都の夕景",
    anchors: [
      { h: 30, s: 40, l: 50, name: "鹿の子色" },
      { h: 90, s: 40, l: 60, name: "若草山" },
      { h: 40, s: 30, l: 40, name: "古銅色" },
      { h: 20, s: 65, l: 55, name: "柿色" },
    ], toneBias: ["d", "sf"], matte: true },

  // ===== 世界の街・国 =====
  { match: ["venice", "venezia", "ベネチア", "ヴェネチア"], ja: "ヴェネチア", story: "運河と仮面舞踏会",
    anchors: [
      { h: 175, s: 30, l: 45, name: "運河の緑青" },
      { h: 15, s: 55, l: 48, name: "屋根のテラコッタ" },
      { h: 45, s: 50, l: 60, name: "大理石の黄金" },
      { h: 340, s: 40, l: 35, name: "仮面の臙脂" },
    ], toneBias: ["d", "dp"] },
  { match: ["santorini", "サントリーニ", "greece", "ギリシャ", "エーゲ海"], ja: "エーゲ海", story: "白壁と青いドーム",
    anchors: [
      { h: 210, s: 15, l: 92, name: "白壁" },
      { h: 220, s: 80, l: 45, name: "ドームの瑠璃" },
      { h: 195, s: 70, l: 55, name: "エーゲ海の青" },
      { h: 330, s: 70, l: 60, name: "ブーゲンビリア" },
    ], toneBias: ["v", "p"], technique: "対照トーン配色" },
  { match: ["hawaii", "ハワイ", "aloha", "アロハ"], ja: "ハワイ", story: "プルメリアと貿易風",
    anchors: [
      { h: 180, s: 70, l: 50, name: "ラグーンの青" },
      { h: 350, s: 80, l: 58, name: "ハイビスカス" },
      { h: 50, s: 75, l: 65, name: "プルメリアの黄" },
      { h: 130, s: 50, l: 45, name: "モンステラ" },
    ], toneBias: ["b", "v"] },
  { match: ["provence", "プロヴァンス", "南仏"], ja: "プロヴァンス", story: "ラベンダー畑と蜂蜜色の村",
    anchors: [
      { h: 270, s: 45, l: 62, name: "ラベンダー畑" },
      { h: 55, s: 70, l: 58, name: "ひまわり" },
      { h: 80, s: 25, l: 45, name: "オリーブ" },
      { h: 40, s: 50, l: 68, name: "蜂蜜色の石壁" },
    ], toneBias: ["sf", "lt"] },
  { match: ["india", "インド", "マハラジャ"], ja: "インド", story: "スパイスとサリーの極彩",
    anchors: [
      { h: 30, s: 90, l: 55, name: "サフラン" },
      { h: 330, s: 85, l: 55, name: "サリーのピンク" },
      { h: 50, s: 85, l: 55, name: "マリーゴールド" },
      { h: 185, s: 60, l: 40, name: "孔雀の青緑" },
    ], toneBias: ["v", "s"], technique: "対照色相配色" },
  { match: ["egypt", "エジプト", "ファラオ"], ja: "エジプト", story: "砂岩とラピスラズリ",
    anchors: [
      { h: 40, s: 40, l: 68, name: "砂岩" },
      { h: 225, s: 70, l: 35, name: "ラピスラズリ" },
      { h: 45, s: 65, l: 52, name: "ファラオの金" },
      { h: 160, s: 40, l: 40, name: "ナイルの緑" },
    ], toneBias: ["dp"], sparkle: true },
  { match: ["iceland", "アイスランド", "氷河"], ja: "アイスランド", story: "氷河と黒砂とオーロラ",
    anchors: [
      { h: 200, s: 35, l: 80, name: "氷河の青白" },
      { h: 0, s: 0, l: 18, name: "玄武岩の黒" },
      { h: 140, s: 40, l: 55, name: "オーロラの緑" },
      { h: 100, s: 20, l: 45, name: "苔の大地" },
    ], toneBias: ["ltg", "dkg"], technique: "対照トーン配色" },

  // ===== 自然・花 =====
  { match: ["hydrangea", "紫陽花", "あじさい", "アジサイ"], ja: "紫陽花", story: "雨に染まる青のグラデーション",
    anchors: [
      { h: 230, s: 45, l: 65, name: "紫陽花の青" },
      { h: 270, s: 40, l: 60, name: "移ろいの紫" },
      { h: 330, s: 35, l: 68, name: "薄紅の萼" },
      { h: 110, s: 35, l: 50, name: "雨の葉" },
    ], toneBias: ["sf", "lt"], technique: "類似色相配色" },
  { match: ["sunflower", "向日葵", "ひまわり", "ヒマワリ"], ja: "向日葵", story: "真夏の黄の行進",
    anchors: [
      { h: 50, s: 90, l: 55, name: "向日葵の黄" },
      { h: 30, s: 55, l: 30, name: "花芯の焦茶" },
      { h: 205, s: 70, l: 55, name: "夏空" },
      { h: 110, s: 50, l: 42, name: "茎の緑" },
    ], toneBias: ["v", "b"] },
  { match: ["rose", "薔薇", "バラ", "ローズ"], ja: "薔薇", story: "ビロードの花弁",
    anchors: [
      { h: 350, s: 75, l: 42, name: "深紅の薔薇" },
      { h: 340, s: 55, l: 70, name: "ロゼのピンク" },
      { h: 130, s: 35, l: 30, name: "棘の深緑" },
      { h: 45, s: 35, l: 85, name: "クリームの花弁" },
    ], toneBias: ["dp", "s"] },
  { match: ["camellia", "椿", "つばき", "ツバキ"], ja: "椿", story: "雪中に咲く紅",
    anchors: [
      { h: 355, s: 70, l: 45, name: "椿の紅" },
      { h: 0, s: 0, l: 94, name: "白椿" },
      { h: 140, s: 35, l: 28, name: "艶葉の深緑" },
      { h: 50, s: 70, l: 55, name: "蕊の金" },
    ], toneBias: ["dp"], matte: true },
  { match: ["ginkgo", "銀杏", "いちょう", "イチョウ"], ja: "銀杏", story: "黄金の並木道",
    anchors: [
      { h: 48, s: 75, l: 55, name: "銀杏の黄金" },
      { h: 210, s: 45, l: 70, name: "晩秋の空" },
      { h: 30, s: 20, l: 50, name: "幹の灰茶" },
    ], toneBias: ["b", "lt"] },
  { match: ["rainbow", "虹", "レインボー"], ja: "虹", story: "雨上がりの七色",
    anchors: [
      { h: 0, s: 75, l: 55, name: "虹の赤" },
      { h: 45, s: 80, l: 55, name: "虹の黄" },
      { h: 130, s: 60, l: 48, name: "虹の緑" },
      { h: 220, s: 65, l: 52, name: "虹の青" },
      { h: 280, s: 50, l: 55, name: "虹の紫" },
    ], toneBias: ["b", "lt"], technique: "色相のグラデーション" },
  { match: ["coral reef", "珊瑚", "サンゴ", "コーラル"], ja: "珊瑚礁", story: "浅瀬のいきものたち",
    anchors: [
      { h: 10, s: 70, l: 62, name: "珊瑚のオレンジ" },
      { h: 185, s: 65, l: 55, name: "礁湖の青" },
      { h: 45, s: 30, l: 88, name: "白砂" },
      { h: 320, s: 55, l: 62, name: "熱帯魚のピンク" },
    ], toneBias: ["b", "lt"] },
  { match: ["deep sea", "深海", "しんかい"], ja: "深海", story: "光の届かない群青",
    anchors: [
      { h: 220, s: 55, l: 15, name: "深海の紺" },
      { h: 200, s: 40, l: 25, name: "沈む青" },
      { h: 180, s: 50, l: 70, name: "発光生物の光" },
    ], toneBias: ["dkg", "dk"], sparkle: true, technique: "対照トーン配色" },
  { match: ["aurora", "オーロラ", "極光"], ja: "オーロラ", story: "夜空に揺れる光のカーテン",
    anchors: [
      { h: 150, s: 70, l: 55, name: "緑のカーテン" },
      { h: 280, s: 50, l: 45, name: "紫の裾" },
      { h: 230, s: 50, l: 18, name: "極夜の空" },
    ], toneBias: ["v", "dk"], sparkle: true, technique: "対照トーン配色" },
  { match: ["fireworks", "花火", "はなび"], ja: "花火", story: "夜空にひらく大輪",
    anchors: [
      { h: 235, s: 45, l: 14, name: "夜空" },
      { h: 45, s: 85, l: 60, name: "金の火花" },
      { h: 355, s: 80, l: 55, name: "赤の閃光" },
      { h: 160, s: 70, l: 55, name: "緑の残光" },
    ], toneBias: ["v", "dkg"], sparkle: true, technique: "対照トーン配色" },
  { match: ["moss garden", "苔庭", "苔"], ja: "苔", story: "しっとりと積もる緑",
    anchors: [
      { h: 90, s: 35, l: 38, name: "苔色" },
      { h: 30, s: 25, l: 35, name: "湿った土" },
      { h: 200, s: 10, l: 55, name: "石の灰" },
    ], toneBias: ["g", "d"], matte: true },
  { match: ["bamboo", "竹林", "竹"], ja: "竹林", story: "青竹を抜ける光",
    anchors: [
      { h: 140, s: 30, l: 55, name: "青竹色" },
      { h: 100, s: 45, l: 65, name: "若竹" },
      { h: 55, s: 50, l: 75, name: "木漏れ日" },
    ], toneBias: ["sf", "lt"] },
  { match: ["lotus", "蓮", "はす", "睡蓮"], ja: "蓮", story: "夜明けの水面にひらく",
    anchors: [
      { h: 340, s: 55, l: 78, name: "蓮のピンク" },
      { h: 150, s: 30, l: 55, name: "白粉の葉" },
      { h: 190, s: 25, l: 60, name: "静かな水面" },
    ], toneBias: ["p", "lt"] },

  // ===== 食べもの・飲みもの =====
  { match: ["coffee", "コーヒー", "珈琲", "カフェラテ"], ja: "珈琲", story: "深煎りの香り",
    anchors: [
      { h: 25, s: 45, l: 22, name: "深煎りの焦茶" },
      { h: 35, s: 55, l: 55, name: "クレマのキャラメル" },
      { h: 40, s: 30, l: 85, name: "ミルクの白" },
    ], toneBias: ["dk", "d"], matte: true, technique: "トーン・オン・トーン配色" },
  { match: ["matcha", "抹茶", "まっちゃ"], ja: "抹茶", story: "茶筅の泡立つ緑",
    anchors: [
      { h: 80, s: 40, l: 45, name: "抹茶の緑" },
      { h: 350, s: 35, l: 40, name: "小豆" },
      { h: 45, s: 30, l: 88, name: "生成りの器" },
    ], toneBias: ["sf", "d"], matte: true },
  { match: ["chocolate", "チョコレート", "ショコラ"], ja: "ショコラ", story: "溶けるビターの艶",
    anchors: [
      { h: 25, s: 50, l: 25, name: "ビターの焦茶" },
      { h: 30, s: 45, l: 45, name: "ミルクチョコ" },
      { h: 45, s: 60, l: 55, name: "金の包み紙" },
    ], toneBias: ["dk", "dp"] },
  { match: ["wine", "ワイン", "ぶどう酒"], ja: "ワイン", story: "グラスの中の深紅",
    anchors: [
      { h: 345, s: 60, l: 30, name: "ボルドー" },
      { h: 290, s: 40, l: 35, name: "葡萄の紫" },
      { h: 40, s: 55, l: 55, name: "琥珀のグラス" },
    ], toneBias: ["dp", "dk"] },
  { match: ["berry", "ベリー", "ラズベリー", "ブルーベリー"], ja: "ベリー", story: "摘みたての果実",
    anchors: [
      { h: 340, s: 70, l: 45, name: "ラズベリー" },
      { h: 250, s: 40, l: 35, name: "ブルーベリー" },
      { h: 45, s: 35, l: 88, name: "クリーム" },
    ], toneBias: ["dp", "s"] },
  { match: ["honey", "蜂蜜", "はちみつ", "ハニー"], ja: "蜂蜜", story: "とろりと光る金",
    anchors: [
      { h: 42, s: 75, l: 55, name: "蜂蜜の金" },
      { h: 35, s: 60, l: 45, name: "琥珀" },
      { h: 48, s: 40, l: 85, name: "ミルクティー" },
    ], toneBias: ["lt", "sf"], sparkle: true },
  { match: ["cream soda", "クリームソーダ", "メロンソーダ"], ja: "クリームソーダ", story: "純喫茶の淡い夏",
    anchors: [
      { h: 140, s: 60, l: 60, name: "メロンソーダ" },
      { h: 50, s: 40, l: 90, name: "バニラの泡" },
      { h: 355, s: 75, l: 55, name: "さくらんぼ" },
      { h: 190, s: 40, l: 80, name: "溶ける氷" },
    ], toneBias: ["lt", "b"] },
  { match: ["mint", "ミント", "ペパーミント", "チョコミント"], ja: "ミント", story: "ひんやり弾ける緑",
    anchors: [
      { h: 160, s: 50, l: 70, name: "ミントグリーン" },
      { h: 25, s: 45, l: 30, name: "チョコの粒" },
      { h: 0, s: 0, l: 95, name: "白" },
    ], toneBias: ["lt", "p"] },
  { match: ["peach", "ピーチ", "白桃"], ja: "ピーチ", story: "うぶ毛のやわらかさ",
    anchors: [
      { h: 20, s: 65, l: 78, name: "桃のうす紅" },
      { h: 45, s: 40, l: 88, name: "果肉のクリーム" },
      { h: 100, s: 30, l: 60, name: "葉の若緑" },
    ], toneBias: ["p", "lt"] },
  { match: ["caramel", "キャラメル", "カラメル"], ja: "キャラメル", story: "香ばしく煮詰めた甘さ",
    anchors: [
      { h: 32, s: 60, l: 50, name: "キャラメル" },
      { h: 25, s: 55, l: 32, name: "焦がした縁" },
      { h: 45, s: 35, l: 82, name: "ミルク" },
    ], toneBias: ["sf", "d"] },

  // ===== 行事・季節のイベント =====
  { match: ["christmas", "クリスマス", "xmas", "聖夜"], ja: "クリスマス", story: "モミの木と贈りものの夜",
    anchors: [
      { h: 140, s: 45, l: 28, name: "モミの深緑" },
      { h: 355, s: 70, l: 42, name: "クリスマスの赤" },
      { h: 45, s: 65, l: 55, name: "オーナメントの金" },
      { h: 0, s: 0, l: 94, name: "粉雪" },
    ], toneBias: ["dp", "v"], sparkle: true, technique: "対照色相配色" },
  { match: ["halloween", "ハロウィン", "ハロウィーン"], ja: "ハロウィン", story: "カボチャ提灯の夜",
    anchors: [
      { h: 28, s: 85, l: 52, name: "パンプキン" },
      { h: 260, s: 40, l: 25, name: "魔女の紫紺" },
      { h: 0, s: 0, l: 12, name: "夜の黒" },
      { h: 90, s: 60, l: 50, name: "毒りんごの緑" },
    ], toneBias: ["v", "dkg"], technique: "対照トーン配色" },
  { match: ["新年", "正月", "お正月", "迎春"], ja: "お正月", story: "初春の紅白と金",
    anchors: [
      { h: 355, s: 70, l: 45, name: "紅" },
      { h: 0, s: 0, l: 95, name: "白" },
      { h: 45, s: 65, l: 52, name: "金" },
      { h: 140, s: 40, l: 30, name: "松の緑" },
    ], toneBias: ["v", "dp"], sparkle: true },
  { match: ["tanabata", "七夕", "たなばた", "天の川"], ja: "七夕", story: "天の川と五色の短冊",
    anchors: [
      { h: 235, s: 50, l: 22, name: "七夕の夜空" },
      { h: 140, s: 40, l: 55, name: "笹の葉" },
      { h: 330, s: 55, l: 70, name: "短冊の桃" },
      { h: 50, s: 65, l: 65, name: "星々" },
    ], toneBias: ["dk", "lt"], sparkle: true, technique: "対照トーン配色" },
  { match: ["matsuri", "祭り", "夏祭り", "縁日"], ja: "夏祭り", story: "提灯と法被のにぎわい",
    anchors: [
      { h: 220, s: 55, l: 30, name: "法被の藍" },
      { h: 355, s: 75, l: 50, name: "提灯の赤" },
      { h: 50, s: 80, l: 60, name: "屋台の灯り" },
    ], toneBias: ["v", "dp"] },
  { match: ["valentine", "バレンタイン"], ja: "バレンタイン", story: "手渡す小さな赤",
    anchors: [
      { h: 350, s: 75, l: 50, name: "ハートの赤" },
      { h: 340, s: 55, l: 75, name: "リボンのピンク" },
      { h: 25, s: 50, l: 30, name: "ショコラ" },
    ], toneBias: ["s", "p"] },

  // ===== 物語・音楽・空想 =====
  { match: ["jazz", "ジャズ", "ブルーノート"], ja: "ジャズ", story: "煙るバーの低音",
    anchors: [
      { h: 225, s: 45, l: 22, name: "ブルーノートの紺" },
      { h: 42, s: 55, l: 50, name: "真鍮のサックス" },
      { h: 345, s: 50, l: 32, name: "ベルベットの緋" },
    ], toneBias: ["dk", "dkg"], sparkle: true },
  { match: ["gothic", "ゴシック", "ゴス"], ja: "ゴシック", story: "薔薇と黒鉄の様式",
    anchors: [
      { h: 0, s: 0, l: 10, name: "漆黒" },
      { h: 350, s: 65, l: 32, name: "深紅の薔薇" },
      { h: 270, s: 35, l: 30, name: "闇の紫" },
      { h: 220, s: 8, l: 65, name: "銀の鎖" },
    ], toneBias: ["dkg", "dp"], technique: "対照トーン配色" },
  { match: ["bohemian", "ボヘミアン", "エスニック"], ja: "ボヘミアン", story: "織物と旅の記憶",
    anchors: [
      { h: 18, s: 60, l: 48, name: "テラコッタ" },
      { h: 45, s: 60, l: 50, name: "マスタード" },
      { h: 280, s: 30, l: 40, name: "ペイズリーの紫" },
      { h: 150, s: 35, l: 32, name: "深い緑" },
    ], toneBias: ["d", "dp"], matte: true, technique: "トーナル配色" },
  { match: ["taisho", "大正ロマン", "大正"], ja: "大正ロマン", story: "矢絣とモダンガール",
    anchors: [
      { h: 350, s: 50, l: 38, name: "矢絣の臙脂" },
      { h: 265, s: 35, l: 55, name: "藤紫" },
      { h: 42, s: 45, l: 45, name: "金茶" },
      { h: 150, s: 30, l: 30, name: "深緑" },
    ], toneBias: ["dp", "d"], matte: true },
  { match: ["和モダン", "ジャパンディ", "japandi"], ja: "和モダン", story: "藍と生成りの静けさ",
    anchors: [
      { h: 220, s: 50, l: 28, name: "藍" },
      { h: 45, s: 25, l: 88, name: "生成り" },
      { h: 355, s: 65, l: 45, name: "朱の差し色" },
      { h: 0, s: 0, l: 25, name: "墨" },
    ], toneBias: ["dp", "ltg"], technique: "セパレーション" },
  { match: ["circus", "サーカス", "カーニバル"], ja: "サーカス", story: "テントの中の喝采",
    anchors: [
      { h: 355, s: 80, l: 50, name: "テントの赤" },
      { h: 0, s: 0, l: 95, name: "ストライプの白" },
      { h: 45, s: 80, l: 55, name: "金モール" },
      { h: 215, s: 65, l: 45, name: "夜空の青" },
    ], toneBias: ["v", "b"] },
  { match: ["merry-go-round", "メリーゴーランド", "メリーゴーラウンド", "遊園地"], ja: "メリーゴーランド", story: "回る木馬と豆電球",
    anchors: [
      { h: 340, s: 50, l: 80, name: "木馬のピンク" },
      { h: 45, s: 60, l: 65, name: "豆電球の金" },
      { h: 190, s: 45, l: 75, name: "空色の鞍" },
      { h: 50, s: 30, l: 90, name: "クリームの柱" },
    ], toneBias: ["lt", "p"], sparkle: true },
  { match: ["library", "図書館", "としょかん", "書斎"], ja: "図書館", story: "革表紙と古紙の匂い",
    anchors: [
      { h: 25, s: 45, l: 30, name: "革表紙の茶" },
      { h: 150, s: 30, l: 28, name: "緑のランプシェード" },
      { h: 45, s: 30, l: 80, name: "古紙のクリーム" },
      { h: 42, s: 50, l: 50, name: "金の題字" },
    ], toneBias: ["dk", "d"], matte: true },
  { match: ["stained glass", "ステンドグラス", "大聖堂"], ja: "ステンドグラス", story: "鉛線に嵌まる光の色",
    anchors: [
      { h: 225, s: 70, l: 40, name: "瑠璃の硝子" },
      { h: 350, s: 70, l: 42, name: "深紅の硝子" },
      { h: 45, s: 75, l: 55, name: "琥珀の硝子" },
      { h: 140, s: 55, l: 38, name: "深緑の硝子" },
      { h: 0, s: 0, l: 15, name: "鉛の線" },
    ], toneBias: ["v", "dp"], sparkle: true, technique: "セパレーション" },
  { match: ["magic", "魔法", "まほう", "魔女", "witch"], ja: "魔法", story: "呪文と星屑",
    anchors: [
      { h: 275, s: 55, l: 40, name: "魔法の紫" },
      { h: 50, s: 70, l: 60, name: "星屑の金" },
      { h: 230, s: 50, l: 25, name: "夜のとばり" },
    ], toneBias: ["dp", "v"], sparkle: true },
  { match: ["mermaid", "人魚", "マーメイド"], ja: "人魚", story: "鱗と真珠のきらめき",
    anchors: [
      { h: 175, s: 55, l: 55, name: "尾びれの青緑" },
      { h: 250, s: 35, l: 70, name: "鱗の薄紫" },
      { h: 45, s: 20, l: 90, name: "真珠" },
    ], toneBias: ["lt", "sf"], sparkle: true },
  { match: ["space", "宇宙", "うちゅう", "cosmos", "コスモ", "惑星"], ja: "宇宙", story: "星雲と無音の暗黒",
    anchors: [
      { h: 240, s: 40, l: 12, name: "宇宙の黒" },
      { h: 285, s: 55, l: 45, name: "星雲の紫" },
      { h: 210, s: 60, l: 65, name: "恒星の青白" },
      { h: 45, s: 70, l: 60, name: "遠い星の金" },
    ], toneBias: ["dkg", "v"], sparkle: true, technique: "対照トーン配色" },
  { match: ["angel", "天使", "エンジェル"], ja: "天使", story: "光輪と羽根",
    anchors: [
      { h: 0, s: 0, l: 96, name: "羽根の白" },
      { h: 48, s: 55, l: 65, name: "光輪の金" },
      { h: 200, s: 40, l: 80, name: "天上の空色" },
      { h: 340, s: 40, l: 85, name: "頬のうす紅" },
    ], toneBias: ["p"], sparkle: true },
  { match: ["純喫茶", "喫茶店", "キッサテン"], ja: "純喫茶", story: "深煎りとビロードの椅子",
    anchors: [
      { h: 25, s: 45, l: 28, name: "深煎りの茶" },
      { h: 350, s: 45, l: 35, name: "臙脂のソファ" },
      { h: 140, s: 55, l: 58, name: "クリームソーダ" },
      { h: 40, s: 55, l: 55, name: "飴色の照明" },
    ], toneBias: ["d", "s"], matte: true },
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
