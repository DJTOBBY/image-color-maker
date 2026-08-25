/* 言葉 → 色の翻訳辞書
   場所・時間・季節・物語のことばを、色のアンカー(h,s,l)とトーンの気配に変換する。
   anchors: その言葉が呼び起こす色
   toneBias: PCCSトーンの傾向(先頭ほど優先)
   sparkle/matte: ビーズの加工の好み(ラスター・オーロラ系 / ツヤケシ系)
*/

/* 基本の色語。入力に含まれるとパレットの「主役」になり、
   他のテーマ語はその色相から離れた色を落として脇役にまわる。 */
const COLOR_WORDS = [
  { match: ["red", "レッド", "赤", "紅"], ja: "赤", h: 0, s: 75, l: 48 },
  { match: ["pink", "ピンク", "桃色"], ja: "ピンク", h: 340, s: 70, l: 72 },
  { match: ["orange", "オレンジ", "橙"], ja: "オレンジ", h: 28, s: 82, l: 55 },
  { match: ["yellow", "イエロー", "黄色", "黄"], ja: "黄", h: 50, s: 85, l: 58 },
  { match: ["lime", "ライム", "黄緑"], ja: "黄緑", h: 85, s: 60, l: 55 },
  { match: ["green", "グリーン", "緑"], ja: "緑", h: 140, s: 52, l: 42 },
  { match: ["turquoise", "teal", "ターコイズ", "青緑"], ja: "ターコイズ", h: 180, s: 58, l: 48 },
  { match: ["cyan", "sky blue", "シアン", "水色", "空色"], ja: "水色", h: 196, s: 62, l: 68 },
  { match: ["blue", "ブルー", "青", "藍"], ja: "青", h: 218, s: 68, l: 45 },
  { match: ["navy", "ネイビー", "紺"], ja: "紺", h: 225, s: 58, l: 26 },
  { match: ["indigo", "インディゴ", "青紫"], ja: "青紫", h: 258, s: 50, l: 42 },
  { match: ["purple", "violet", "パープル", "バイオレット", "紫"], ja: "紫", h: 288, s: 45, l: 45 },
  { match: ["brown", "ブラウン", "茶色", "茶"], ja: "茶", h: 25, s: 45, l: 35 },
  { match: ["beige", "ベージュ"], ja: "ベージュ", h: 35, s: 35, l: 76 },
  { match: ["white", "ホワイト", "白"], ja: "白", h: 40, s: 8, l: 95 },
  { match: ["gray", "grey", "グレー", "灰色"], ja: "グレー", h: 220, s: 5, l: 58 },
  { match: ["black", "ブラック", "黒"], ja: "黒", h: 225, s: 12, l: 12 },
  { match: ["gold", "ゴールド", "金色", "金"], ja: "金", h: 45, s: 65, l: 52 },
  { match: ["silver", "シルバー", "銀色", "銀"], ja: "銀", h: 220, s: 8, l: 72 },
];

/* 色の強さ・明るさを変える修飾語 */
const MODIFIERS = [
  { match: ["dark", "ダーク", "暗い"], dl: -18, ds: 0 },
  { match: ["deep", "ディープ", "深い", "濃い"], dl: -14, ds: 12 },
  { match: ["light", "ライト", "明るい"], dl: 16, ds: -6 },
  { match: ["pale", "ペール", "淡い", "薄い"], dl: 20, ds: -22 },
  { match: ["vivid", "ビビッド", "鮮やか"], dl: 0, ds: 25 },
  { match: ["dusty", "smoky", "くすんだ", "スモーキー"], dl: -4, ds: -25 },
  { match: ["bright", "ブライト"], dl: 10, ds: 12 },
];

const DICTIONARY = [
  // ===== 和田三造『色彩の辞典』(1933)の命名配色 30種 =====
  // 出典: colorcombinations.org(CC-BY-4.0)。原本は平安〜明治の日本の伝統配色。
  { match: ["kurenai kon", "紅と紺"], ja: "紅と紺",
    story: "平安の袍と江戸の礼装 — 紅花の紅と紺の対比。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 0, s: 57, l: 38, name: "紅" }, { h: 222, s: 49, l: 21, name: "紺" }, { h: 42, s: 48, l: 92, name: "胡粉" }],
    toneBias: ["sf", "dk"] },
  { match: ["sakura wakatake", "桜と若竹", "若竹"], ja: "桜と若竹",
    story: "桜のもっとも淡い紅と若竹の緑 — 春そのものの配色。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 342, s: 75, l: 91, name: "桜" }, { h: 100, s: 28, l: 67, name: "若竹" }, { h: 44, s: 52, l: 94, name: "生成" }, { h: 94, s: 19, l: 31, name: "松葉" }],
    toneBias: ["lt", "sf"] },
  { match: ["asagi shu", "浅葱と朱", "浅葱"], ja: "浅葱と朱",
    story: "新選組の羽織の褪せた青と、鳥居の朱。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 191, s: 42, l: 33, name: "浅葱" }, { h: 8, s: 68, l: 47, name: "朱" }, { h: 42, s: 48, l: 92, name: "胡粉" }, { h: 0, s: 0, l: 14, name: "墨" }],
    toneBias: ["v", "dk"] },
  { match: ["kariyasu rikyu", "刈安と利休鼠", "刈安", "利休鼠"], ja: "刈安と利休鼠",
    story: "刈安の淡い黄と利休鼠 — 侘びた渋さ。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 51, s: 55, l: 66, name: "刈安" }, { h: 100, s: 8, l: 55, name: "利休鼠" }, { h: 44, s: 30, l: 88, name: "生成" }],
    toneBias: ["lt", "d"] },
  { match: ["gunjo gofun", "群青と胡粉", "群青"], ja: "群青と胡粉",
    story: "岩絵具の群青と、貝殻の胡粉の白。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 224, s: 62, l: 30, name: "群青" }, { h: 42, s: 48, l: 92, name: "胡粉" }, { h: 0, s: 0, l: 15, name: "墨" }],
    toneBias: ["dk", "lt"] },
  { match: ["kaki kogecha", "柿と焦茶", "焦茶"], ja: "柿と焦茶",
    story: "熟れた柿の色と焦茶 — 実りの対比。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 20, s: 60, l: 48, name: "柿" }, { h: 25, s: 40, l: 25, name: "焦茶" }, { h: 44, s: 40, l: 85, name: "生成" }],
    toneBias: ["d", "dkg"] },
  { match: ["murasaki gin", "紫と銀"], ja: "紫と銀",
    story: "高貴な紫と銀 — 洗練の対比。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 280, s: 35, l: 33, name: "紫" }, { h: 220, s: 8, l: 72, name: "銀" }, { h: 0, s: 0, l: 14, name: "墨" }, { h: 44, s: 45, l: 90, name: "生成" }],
    toneBias: ["sf", "dk"] },
  { match: ["moegi sumi", "萌黄と墨", "萌黄"], ja: "萌黄と墨",
    story: "萌え出る若葉の緑と墨の黒。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 95, s: 45, l: 40, name: "萌黄" }, { h: 0, s: 0, l: 15, name: "墨" }, { h: 44, s: 40, l: 88, name: "生成" }],
    toneBias: ["dkg", "sf"] },
  { match: ["daidai kon", "橙と紺"], ja: "橙と紺",
    story: "橙と紺 — 大胆で朗らかな対比。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 28, s: 78, l: 55, name: "橙" }, { h: 222, s: 50, l: 22, name: "紺" }, { h: 42, s: 48, l: 92, name: "胡粉" }],
    toneBias: ["v", "b"] },
  { match: ["seiji kinari", "青磁と生成", "青磁"], ja: "青磁と生成",
    story: "青磁の静けさと生成りの布。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 170, s: 30, l: 55, name: "青磁" }, { h: 44, s: 30, l: 88, name: "生成" }, { h: 25, s: 30, l: 40, name: "焦茶" }],
    toneBias: ["lt", "d"] },
  { match: ["akane tokiwa", "茜と常磐", "常磐"], ja: "茜と常磐",
    story: "茜の赤と常磐の緑 — 大胆な対照。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 3, s: 60, l: 42, name: "茜" }, { h: 145, s: 45, l: 28, name: "常磐" }, { h: 44, s: 40, l: 88, name: "生成" }, { h: 0, s: 0, l: 15, name: "墨" }],
    toneBias: ["d", "v"] },
  { match: ["ruri gofun", "瑠璃と胡粉", "瑠璃"], ja: "瑠璃と胡粉",
    story: "瑠璃の深い青と胡粉の白。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 228, s: 60, l: 32, name: "瑠璃" }, { h: 42, s: 48, l: 92, name: "胡粉" }, { h: 0, s: 0, l: 16, name: "墨" }],
    toneBias: ["dk", "lt"] },
  { match: ["nadeshiko mizu", "撫子と水色", "撫子"], ja: "撫子と水色",
    story: "撫子の淡紅と水色 — かわいらしい配色。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 345, s: 45, l: 78, name: "撫子" }, { h: 196, s: 45, l: 72, name: "水色" }, { h: 44, s: 30, l: 90, name: "生成" }],
    toneBias: ["lt", "b"] },
  { match: ["matcha kinari", "抹茶と生成", "抹茶"], ja: "抹茶と生成",
    story: "抹茶の緑と生成りの静けさ。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 80, s: 38, l: 42, name: "抹茶" }, { h: 44, s: 30, l: 88, name: "生成" }, { h: 25, s: 25, l: 35, name: "焦茶" }],
    toneBias: ["lt", "d"] },
  { match: ["entan sumi", "鉛丹と墨", "鉛丹"], ja: "鉛丹と墨",
    story: "鉛丹の赤と墨の黒 — 力強い対比。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 15, s: 68, l: 48, name: "鉛丹" }, { h: 0, s: 0, l: 14, name: "墨" }, { h: 42, s: 48, l: 90, name: "胡粉" }],
    toneBias: ["v", "dk"] },
  { match: ["yamabuki kuri", "山吹と栗"], ja: "山吹と栗",
    story: "山吹の黄と栗の茶 — 実りの秋。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 48, s: 70, l: 55, name: "山吹" }, { h: 22, s: 40, l: 30, name: "栗" }, { h: 44, s: 40, l: 88, name: "生成" }],
    toneBias: ["d", "b"] },
  { match: ["fuji ai", "藤と藍"], ja: "藤と藍",
    story: "藤の淡紫と藍の対比。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 265, s: 32, l: 62, name: "藤" }, { h: 208, s: 53, l: 24, name: "藍" }, { h: 44, s: 40, l: 88, name: "生成" }],
    toneBias: ["lt", "sf"] },
  { match: ["tobi kogane", "鳶と黄金", "黄金"], ja: "鳶と黄金",
    story: "鳶色の茶と黄金 — あたたかな輝き。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 20, s: 45, l: 38, name: "鳶" }, { h: 46, s: 65, l: 52, name: "黄金" }, { h: 25, s: 25, l: 22, name: "墨茶" }],
    toneBias: ["d", "sf"], sparkle: true },
  { match: ["ao shiro", "青と白"], ja: "青と白",
    story: "青と白 — 澄みきった対比。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 210, s: 55, l: 42, name: "青" }, { h: 0, s: 0, l: 96, name: "白" }, { h: 0, s: 0, l: 15, name: "墨" }],
    toneBias: ["lt", "sf"] },
  { match: ["kikyo sumi", "桔梗と墨", "桔梗"], ja: "桔梗と墨",
    story: "桔梗の紫と墨 — 静かな気品。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 255, s: 40, l: 40, name: "桔梗" }, { h: 0, s: 0, l: 15, name: "墨" }, { h: 44, s: 40, l: 88, name: "生成" }],
    toneBias: ["dk", "sf"] },
  { match: ["usubeni cha", "薄紅と茶", "薄紅"], ja: "薄紅と茶",
    story: "薄紅と茶 — 穏やかであたたかな配色。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 350, s: 45, l: 72, name: "薄紅" }, { h: 25, s: 35, l: 35, name: "茶" }, { h: 44, s: 35, l: 88, name: "生成" }],
    toneBias: ["b", "sf"] },
  { match: ["kogecha kinari", "焦茶と生成"], ja: "焦茶と生成",
    story: "焦茶と生成り — 侘びた静けさ。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 25, s: 40, l: 28, name: "焦茶" }, { h: 44, s: 35, l: 88, name: "生成" }],
    toneBias: ["d", "dkg"] },
  { match: ["sora shu", "空と朱"], ja: "空と朱",
    story: "空の青と朱 — 明快な対比。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 200, s: 55, l: 62, name: "空" }, { h: 8, s: 68, l: 47, name: "朱" }, { h: 0, s: 0, l: 96, name: "白" }],
    toneBias: ["v", "b"] },
  { match: ["hanada gin", "縹と銀", "縹"], ja: "縹と銀",
    story: "縹の青と銀 — 洗練された冷たさ。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 212, s: 45, l: 40, name: "縹" }, { h: 220, s: 8, l: 72, name: "銀" }, { h: 0, s: 0, l: 15, name: "墨" }],
    toneBias: ["sf", "dk"] },
  { match: ["kon kinari", "紺と生成"], ja: "紺と生成",
    story: "紺と生成り — 端正な組み合わせ。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 222, s: 50, l: 22, name: "紺" }, { h: 44, s: 35, l: 88, name: "生成" }, { h: 0, s: 0, l: 15, name: "墨" }],
    toneBias: ["sf", "dkg"] },
  { match: ["shu kuro kin", "朱・黒・金"], ja: "朱・黒・金",
    story: "朱と黒と金 — 力強く華やかな三色。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 8, s: 70, l: 45, name: "朱" }, { h: 0, s: 0, l: 12, name: "黒" }, { h: 46, s: 65, l: 52, name: "金" }],
    toneBias: ["v", "dk"], sparkle: true },
  { match: ["ominaeshi asagi", "女郎花と浅葱", "女郎花"], ja: "女郎花と浅葱",
    story: "女郎花の黄と浅葱の青。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 50, s: 55, l: 58, name: "女郎花" }, { h: 191, s: 42, l: 35, name: "浅葱" }, { h: 44, s: 40, l: 88, name: "生成" }],
    toneBias: ["lt", "b"] },
  { match: ["enji matsuba", "臙脂と松葉", "臙脂"], ja: "臙脂と松葉",
    story: "臙脂の赤と松葉の緑 — 力強い対比。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 351, s: 57, l: 39, name: "臙脂" }, { h: 104, s: 23, l: 26, name: "松葉" }, { h: 44, s: 52, l: 94, name: "生成" }, { h: 46, s: 65, l: 52, name: "黄金" }],
    toneBias: ["v", "dk"] },
  { match: ["edo murasaki nezumi", "江戸紫と鼠", "江戸紫"], ja: "江戸紫と鼠",
    story: "江戸紫と鼠色 — 粋の美学。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 258, s: 31, l: 42, name: "江戸紫" }, { h: 0, s: 0, l: 54, name: "鼠" }, { h: 0, s: 0, l: 11, name: "墨" }, { h: 44, s: 52, l: 94, name: "生成" }],
    toneBias: ["sf", "v"] },
  { match: ["ukon ai", "鬱金と藍", "鬱金"], ja: "鬱金と藍",
    story: "鬱金の黄と藍の対比。和田三造『色彩の辞典』(1933)より",
    anchors: [{ h: 45, s: 72, l: 56, name: "鬱金" }, { h: 208, s: 53, l: 23, name: "藍" }, { h: 41, s: 51, l: 90, name: "生成" }],
    toneBias: ["d", "b"] },

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

  // ===== 中国の時代・色(色韵 cncolor.art を参考) =====
  { match: ["shang zhou", "商周", "五方正色"], ja: "商周", story: "五方正色 — 青赤黄白黒、方位と結びついた最古の色体系",
    anchors: [
      { h: 210, s: 45, l: 32, name: "東の青" },
      { h: 0, s: 55, l: 40, name: "南の赤" },
      { h: 48, s: 55, l: 48, name: "中央の黄" },
      { h: 0, s: 0, l: 88, name: "西の白" },
      { h: 0, s: 0, l: 15, name: "北の黒" },
    ], toneBias: ["dp", "d"], matte: true, technique: "対照色相配色" },
  { match: ["tang dynasty", "唐", "盛唐", "唐朝"], ja: "唐", story: "盛世華彩 — 琥珀黄と雨過天青の豊かな時代",
    anchors: [
      { h: 40, s: 60, l: 52, name: "琥珀黄" },
      { h: 200, s: 30, l: 68, name: "雨過天青" },
      { h: 355, s: 60, l: 42, name: "唐三彩の赤" },
      { h: 45, s: 65, l: 55, name: "唐三彩の金" },
    ], toneBias: ["dp", "s"] },
  { match: ["song dynasty", "宋", "汝窯", "汝窑"], ja: "宋", story: "天青色の汝窯、白磁の定窯 — 素雅を極めた時代",
    anchors: [
      { h: 195, s: 25, l: 60, name: "天青色" },
      { h: 40, s: 10, l: 90, name: "定窯の白" },
      { h: 30, s: 15, l: 40, name: "素朴な灰茶" },
    ], toneBias: ["ltg", "sf"], matte: true, technique: "トーナル配色" },
  { match: ["ming qing", "明清", "紫禁城", "故宮"], ja: "明清", story: "宮廷色彩の等級制度 — 黄は皇帝だけの色",
    anchors: [
      { h: 48, s: 70, l: 52, name: "明黄(皇帝の黄)" },
      { h: 355, s: 65, l: 38, name: "宮墻の朱" },
      { h: 220, s: 55, l: 30, name: "琺瑯の青" },
      { h: 45, s: 60, l: 45, name: "金" },
    ], toneBias: ["dp", "v"], sparkle: true },
  { match: ["cinnabar", "朱砂", "朱草"], ja: "朱砂", story: "古代中国の辰砂 — 印と守りの赤",
    anchors: [
      { h: 8, s: 60, l: 40, name: "朱草" },
      { h: 0, s: 0, l: 20, name: "墨" },
      { h: 42, s: 45, l: 45, name: "青銅の金" },
    ], toneBias: ["dp"], matte: true },
  { match: ["cochineal", "胭脂", "胭脂虫"], ja: "胭脂", story: "コチニール虫から生まれた紅",
    anchors: [
      { h: 355, s: 55, l: 40, name: "胭脂虫の紅" },
      { h: 340, s: 40, l: 65, name: "頬紅の淡紅" },
      { h: 0, s: 0, l: 92, name: "白磁" },
    ], toneBias: ["s", "sf"] },

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

  { match: ["japan blue", "ジャパンブルー", "藍染", "阿波藍"], ja: "ジャパンブルー",
    story: "明治のお雇い外国人が「この国は藍色に染まっている」と驚いた、日本の青",
    anchors: [
      { h: 218, s: 55, l: 28, name: "藍" },
      { h: 210, s: 40, l: 45, name: "縹(はなだ)" },
      { h: 200, s: 30, l: 65, name: "瓶覗(かめのぞき)" },
      { h: 225, s: 45, l: 15, name: "褐色(かちいろ)" },
      { h: 45, s: 20, l: 92, name: "晒しの生成り" },
    ], toneBias: ["dp", "d"], matte: true, technique: "トーン・オン・トーン配色" },
  { match: ["japan", "nippon", "ジャパン", "日本"], ja: "日本", story: "藍と朱、金と墨の国",
    anchors: [
      { h: 220, s: 55, l: 28, name: "藍" },
      { h: 355, s: 70, l: 45, name: "朱" },
      { h: 45, s: 60, l: 52, name: "金" },
      { h: 0, s: 0, l: 22, name: "墨" },
      { h: 45, s: 25, l: 90, name: "生成り" },
    ], toneBias: ["dp", "s"] },

  // ===== 日本の時代 =====
  { match: ["heian", "平安", "王朝", "十二単"], ja: "平安", story: "王朝の襲の色目 — 季節を色で重ねた美学",
    anchors: [
      { h: 345, s: 55, l: 72, name: "紅梅" },
      { h: 85, s: 45, l: 60, name: "萌黄" },
      { h: 48, s: 70, l: 55, name: "山吹" },
      { h: 265, s: 35, l: 60, name: "藤紫" },
      { h: 45, s: 25, l: 92, name: "白の単衣" },
    ], toneBias: ["sf", "lt"], technique: "類似色相配色" },
  { match: ["momoyama", "桃山", "安土桃山"], ja: "桃山", story: "金碧障壁画 — 金地に濃彩が咲いた時代",
    anchors: [
      { h: 45, s: 60, l: 55, name: "金箔の地" },
      { h: 140, s: 45, l: 28, name: "狩野派の松" },
      { h: 225, s: 60, l: 35, name: "群青" },
      { h: 355, s: 70, l: 45, name: "緋" },
    ], toneBias: ["dp"], sparkle: true, technique: "対照トーン配色" },
  { match: ["edo", "江戸", "粋"], ja: "江戸", story: "四十八茶百鼠 — 奢侈禁止令が育てた粋の美学",
    anchors: [
      { h: 220, s: 55, l: 28, name: "藍" },
      { h: 18, s: 50, l: 38, name: "団十郎茶" },
      { h: 90, s: 8, l: 55, name: "利休鼠" },
      { h: 0, s: 0, l: 25, name: "墨" },
    ], toneBias: ["g", "d"], matte: true, technique: "トーナル配色" },
  { match: ["meiji", "明治", "ハイカラ", "文明開化"], ja: "明治", story: "文明開化 — 煉瓦とガス灯と海老茶袴",
    anchors: [
      { h: 12, s: 50, l: 42, name: "煉瓦色" },
      { h: 340, s: 40, l: 32, name: "海老茶袴" },
      { h: 230, s: 40, l: 30, name: "書生の紺" },
      { h: 45, s: 50, l: 70, name: "ガス灯の色" },
    ], toneBias: ["d", "dp"], matte: true },

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
  // ===== 気持ち・生きもの・様式 =====
  // 分類が分かっても色が決まらない言葉たち。
  // 「蛍は昆虫」と分かっても色は出ない。ここは手で書くしかない。
  { match: ["memory", "記憶", "思い出", "おもいで"], ja: "記憶", story: "褪せてなお残るもの",
    anchors: [
      { h: 36, s: 28, l: 72, name: "セピアの紙" },
      { h: 205, s: 18, l: 62, name: "褪せた空の青" },
      { h: 20, s: 22, l: 42, name: "陰の褐" },
      { h: 44, s: 20, l: 88, name: "余白の生成り" },
    ], toneBias: ["ltg", "d"], matte: true, technique: "トーナル配色" },
  { match: ["nostalgia", "郷愁", "ノスタルジー", "懐かしい"], ja: "郷愁", story: "戻れない場所の色",
    anchors: [
      { h: 30, s: 42, l: 58, name: "夕陽の飴色" },
      { h: 200, s: 22, l: 52, name: "遠い水の青" },
      { h: 355, s: 30, l: 62, name: "色褪せた紅" },
      { h: 42, s: 26, l: 82, name: "障子の白" },
    ], toneBias: ["sf", "ltg"], matte: true },
  { match: ["silence", "静寂", "しじま", "静けさ"], ja: "静寂", story: "音のない場所",
    anchors: [
      { h: 210, s: 6, l: 92, name: "白の静けさ" },
      { h: 215, s: 10, l: 66, name: "薄墨" },
      { h: 205, s: 14, l: 38, name: "沈んだ青灰" },
      { h: 40, s: 8, l: 80, name: "灰白" },
    ], toneBias: ["p", "ltg"], matte: true, technique: "カマイユ配色" },
  { match: ["hope", "希望", "きぼう"], ja: "希望", story: "こちらへ向かう光",
    anchors: [
      { h: 88, s: 52, l: 62, name: "芽ぶきの黄緑" },
      { h: 198, s: 56, l: 74, name: "晴れの水色" },
      { h: 48, s: 72, l: 70, name: "さしこむ陽" },
      { h: 40, s: 20, l: 94, name: "光の白" },
    ], toneBias: ["b", "lt"], technique: "ナチュラルハーモニー" },
  { match: ["love", "恋", "こい", "恋心"], ja: "恋", story: "打ち明ける前の色",
    anchors: [
      { h: 348, s: 62, l: 82, name: "薄紅" },
      { h: 356, s: 66, l: 52, name: "こみあげる紅" },
      { h: 320, s: 30, l: 72, name: "ためらいの藤" },
      { h: 44, s: 30, l: 92, name: "白磁" },
    ], toneBias: ["lt", "sf"], technique: "トーングラデーション" },
  { match: ["prayer", "祈り", "いのり"], ja: "祈り", story: "捧げるための色",
    anchors: [
      { h: 42, s: 18, l: 92, name: "浄衣の白" },
      { h: 46, s: 60, l: 56, name: "燈明の金" },
      { h: 222, s: 42, l: 28, name: "夜の藍" },
      { h: 12, s: 46, l: 44, name: "香の朱" },
    ], toneBias: ["dp", "p"], technique: "セパレーション配色" },
  { match: ["dream", "夢", "ゆめ"], ja: "夢", story: "輪郭のさだまらないもの",
    anchors: [
      { h: 275, s: 38, l: 80, name: "藤の霞" },
      { h: 196, s: 42, l: 82, name: "水色のもや" },
      { h: 336, s: 34, l: 84, name: "うすい桃" },
      { h: 230, s: 24, l: 62, name: "遠のく青" },
    ], toneBias: ["p", "lt"], sparkle: true, technique: "トーンオントーン配色" },
  { match: ["solitude", "孤独", "ひとり"], ja: "孤独", story: "誰もいない部屋",
    anchors: [
      { h: 218, s: 20, l: 30, name: "沈む青" },
      { h: 210, s: 8, l: 52, name: "冷えた灰" },
      { h: 30, s: 16, l: 24, name: "隅の褐" },
      { h: 200, s: 12, l: 74, name: "窓の明かり" },
    ], toneBias: ["dkg", "d"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["tenderness", "やさしさ", "優しさ", "ぬくもり"], ja: "やさしさ", story: "手のひらの温度",
    anchors: [
      { h: 30, s: 46, l: 86, name: "生成りの肌" },
      { h: 348, s: 44, l: 86, name: "桜のうす紅" },
      { h: 44, s: 52, l: 84, name: "クリーム" },
      { h: 96, s: 26, l: 74, name: "若葉のかげ" },
    ], toneBias: ["p", "lt"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["departure", "旅立ち", "門出", "出発"], ja: "旅立ち", story: "夜明けに発つ",
    anchors: [
      { h: 220, s: 40, l: 34, name: "明けきらぬ藍" },
      { h: 24, s: 68, l: 66, name: "地平の橙" },
      { h: 196, s: 44, l: 76, name: "白みだす空" },
      { h: 42, s: 30, l: 90, name: "はじまりの白" },
    ], toneBias: ["dp", "b"], technique: "色相のグラデーション" },
  { match: ["graduation", "卒業", "そつぎょう"], ja: "卒業", story: "桜と紺の日",
    anchors: [
      { h: 344, s: 56, l: 86, name: "校庭の桜" },
      { h: 224, s: 46, l: 26, name: "制服の紺" },
      { h: 44, s: 24, l: 92, name: "証書の白" },
      { h: 46, s: 54, l: 62, name: "金の箔押し" },
    ], toneBias: ["p", "dk"], technique: "セパレーション配色" },
  { match: ["wedding", "結婚式", "婚礼", "ブライダル"], ja: "結婚式", story: "白と金の一日",
    anchors: [
      { h: 42, s: 16, l: 95, name: "白無垢の白" },
      { h: 46, s: 58, l: 60, name: "祝いの金" },
      { h: 4, s: 62, l: 48, name: "紅の差し色" },
      { h: 120, s: 22, l: 60, name: "青葉の緑" },
    ], toneBias: ["p", "v"], sparkle: true, technique: "セパレーション配色" },

  { match: ["cat", "猫", "ねこ"], ja: "猫", story: "三毛の背中",
    anchors: [
      { h: 28, s: 52, l: 46, name: "茶トラの茶" },
      { h: 40, s: 16, l: 92, name: "腹の白" },
      { h: 30, s: 12, l: 18, name: "斑の黒" },
      { h: 52, s: 70, l: 62, name: "瞳の金" },
    ], toneBias: ["d", "dk"], matte: true, technique: "セパレーション配色" },
  { match: ["butterfly", "蝶", "ちょう", "アゲハ"], ja: "蝶", story: "揚羽の紋",
    anchors: [
      { h: 46, s: 78, l: 62, name: "揚羽の黄" },
      { h: 25, s: 14, l: 14, name: "翅の黒" },
      { h: 205, s: 62, l: 52, name: "縁の瑠璃" },
      { h: 350, s: 52, l: 58, name: "後翅の紅" },
    ], toneBias: ["v", "dk"], sparkle: true, technique: "セパレーション配色" },
  { match: ["fox", "狐", "きつね"], ja: "狐", story: "狐色の毛並み",
    anchors: [
      { h: 24, s: 62, l: 50, name: "狐色" },
      { h: 40, s: 24, l: 90, name: "喉の白" },
      { h: 20, s: 30, l: 24, name: "足先の黒" },
      { h: 36, s: 44, l: 70, name: "陽のあたる毛" },
    ], toneBias: ["s", "d"], matte: true },
  { match: ["deer", "鹿", "しか", "鹿の子"], ja: "鹿", story: "鹿の子まだら",
    anchors: [
      { h: 28, s: 40, l: 52, name: "鹿の子の茶" },
      { h: 40, s: 22, l: 88, name: "斑の白" },
      { h: 100, s: 26, l: 34, name: "下草の緑" },
      { h: 24, s: 20, l: 28, name: "角の褐" },
    ], toneBias: ["sf", "d"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["peacock", "孔雀", "くじゃく"], ja: "孔雀", story: "羽をひろげた青緑",
    anchors: [
      { h: 186, s: 78, l: 34, name: "孔雀青" },
      { h: 150, s: 62, l: 38, name: "羽の緑" },
      { h: 44, s: 72, l: 56, name: "眼状紋の金" },
      { h: 268, s: 44, l: 34, name: "根元の紫" },
    ], toneBias: ["dp", "v"], sparkle: true, technique: "類似色相配色" },
  { match: ["jellyfish", "くらげ", "クラゲ", "水母"], ja: "くらげ", story: "透けてゆらぐもの",
    anchors: [
      { h: 200, s: 34, l: 88, name: "透ける水色" },
      { h: 280, s: 30, l: 80, name: "傘のうす紫" },
      { h: 340, s: 26, l: 84, name: "触手の淡紅" },
      { h: 210, s: 40, l: 40, name: "沈む海の青" },
    ], toneBias: ["p", "lt"], sparkle: true, technique: "トーンオントーン配色" },
  { match: ["goldfish", "金魚", "きんぎょ"], ja: "金魚", story: "水鉢の朱",
    anchors: [
      { h: 8, s: 78, l: 52, name: "金魚の朱" },
      { h: 40, s: 20, l: 92, name: "白い腹" },
      { h: 170, s: 30, l: 40, name: "水鉢の苔" },
      { h: 195, s: 40, l: 74, name: "揺れる水" },
    ], toneBias: ["v", "sf"], technique: "対照色相配色" },
  { match: ["firefly", "蛍", "ほたる"], ja: "蛍", story: "闇にまたたく黄緑",
    anchors: [
      { h: 78, s: 78, l: 66, name: "蛍の光" },
      { h: 150, s: 30, l: 16, name: "夜の草むら" },
      { h: 222, s: 34, l: 22, name: "暮れきった藍" },
      { h: 90, s: 40, l: 40, name: "残光の緑" },
    ], toneBias: ["dkg", "b"], sparkle: true, technique: "セパレーション配色" },
  { match: ["mushroom", "きのこ", "キノコ", "茸"], ja: "きのこ", story: "落葉の下のかたち",
    anchors: [
      { h: 26, s: 34, l: 40, name: "傘の茶" },
      { h: 40, s: 22, l: 82, name: "柄の生成り" },
      { h: 90, s: 24, l: 30, name: "腐葉土の緑" },
      { h: 14, s: 52, l: 46, name: "毒々しい紅" },
    ], toneBias: ["d", "dp"], matte: true },
  { match: ["rice ear", "稲穂", "いなほ", "黄金の稲"], ja: "稲穂", story: "実って垂れる金",
    anchors: [
      { h: 46, s: 66, l: 62, name: "稲穂の金" },
      { h: 38, s: 48, l: 44, name: "熟れた褐" },
      { h: 88, s: 34, l: 50, name: "残る青葉" },
      { h: 200, s: 42, l: 76, name: "秋の空" },
    ], toneBias: ["s", "sf"], matte: true, technique: "ドミナントカラー配色" },

  { match: ["lemon", "レモン", "檸檬"], ja: "レモン", story: "切り口の酸味",
    anchors: [
      { h: 54, s: 88, l: 62, name: "レモンの黄" },
      { h: 46, s: 40, l: 92, name: "果肉の淡黄" },
      { h: 96, s: 44, l: 44, name: "葉の緑" },
      { h: 40, s: 18, l: 96, name: "白い皿" },
    ], toneBias: ["v", "lt"], technique: "ドミナントカラー配色" },
  { match: ["pistachio", "ピスタチオ"], ja: "ピスタチオ", story: "殻を割った淡い緑",
    anchors: [
      { h: 82, s: 34, l: 62, name: "ピスタチオの緑" },
      { h: 40, s: 30, l: 84, name: "殻の生成り" },
      { h: 330, s: 24, l: 66, name: "薄皮の紅紫" },
      { h: 60, s: 20, l: 44, name: "影の苔" },
    ], toneBias: ["sf", "lt"], matte: true },
  { match: ["milk tea", "ミルクティー", "ミルクティ"], ja: "ミルクティー", story: "混ざりきる手前",
    anchors: [
      { h: 28, s: 40, l: 68, name: "ミルクティーの色" },
      { h: 24, s: 44, l: 40, name: "濃い紅茶" },
      { h: 40, s: 30, l: 92, name: "ミルクの白" },
      { h: 34, s: 26, l: 82, name: "泡の淡褐" },
    ], toneBias: ["ltg", "sf"], matte: true, technique: "トーングラデーション" },

  { match: ["kogarashi", "木枯らし", "木枯し", "こがらし"], ja: "木枯らし", story: "葉を落とす風",
    anchors: [
      { h: 34, s: 34, l: 46, name: "枯葉の褐" },
      { h: 210, s: 12, l: 58, name: "冷たい灰" },
      { h: 30, s: 18, l: 26, name: "裸木の幹" },
      { h: 200, s: 20, l: 80, name: "白けた空" },
    ], toneBias: ["d", "ltg"], matte: true, technique: "トーナル配色" },
  { match: ["yunagi", "夕凪", "ゆうなぎ"], ja: "夕凪", story: "風の止まる時間",
    anchors: [
      { h: 22, s: 56, l: 68, name: "凪ぎの橙" },
      { h: 200, s: 26, l: 56, name: "動かない海" },
      { h: 276, s: 24, l: 54, name: "暮れの紫" },
      { h: 42, s: 34, l: 86, name: "薄れる光" },
    ], toneBias: ["sf", "ltg"], matte: true, technique: "トーンオントーン配色" },

  { match: ["embroidery", "刺繍", "刺繡", "ししゅう"], ja: "刺繍", story: "糸で描く",
    anchors: [
      { h: 44, s: 26, l: 86, name: "布の生成り" },
      { h: 350, s: 60, l: 50, name: "紅の糸" },
      { h: 214, s: 50, l: 40, name: "藍の糸" },
      { h: 46, s: 62, l: 58, name: "金糸" },
    ], toneBias: ["v", "p"], sparkle: true, technique: "セパレーション配色" },
  { match: ["ukiyoe", "浮世絵", "うきよえ"], ja: "浮世絵", story: "版木を重ねた色",
    anchors: [
      { h: 214, s: 48, l: 38, name: "藍摺の青" },
      { h: 4, s: 58, l: 48, name: "紅の唇" },
      { h: 44, s: 34, l: 84, name: "地の生成り" },
      { h: 26, s: 14, l: 20, name: "墨の輪郭" },
    ], toneBias: ["dp", "sf"], matte: true, technique: "セパレーション配色" },
  { match: ["genji", "源氏物語", "げんじものがたり"], ja: "源氏物語", story: "十二単の襲",
    anchors: [
      { h: 288, s: 34, l: 44, name: "藤の紫" },
      { h: 344, s: 44, l: 78, name: "紅梅のかさね" },
      { h: 108, s: 26, l: 38, name: "青朽葉" },
      { h: 46, s: 56, l: 58, name: "蒔絵の金" },
    ], toneBias: ["sf", "dp"], matte: true, technique: "トーンオントーン配色" },
  { match: ["manyoshu", "万葉集", "まんようしゅう"], ja: "万葉集", story: "古代の草木の色",
    anchors: [
      { h: 296, s: 30, l: 40, name: "紫草の紫" },
      { h: 4, s: 54, l: 46, name: "茜さす" },
      { h: 50, s: 48, l: 62, name: "刈安の黄" },
      { h: 116, s: 24, l: 34, name: "山の青" },
    ], toneBias: ["d", "sf"], matte: true },
  { match: ["bossa nova", "ボサノバ", "ボサノヴァ"], ja: "ボサノバ", story: "午後の海辺の気だるさ",
    anchors: [
      { h: 176, s: 42, l: 62, name: "潮風の碧" },
      { h: 40, s: 52, l: 76, name: "陽に灼けた砂" },
      { h: 100, s: 34, l: 46, name: "椰子の葉" },
      { h: 20, s: 38, l: 60, name: "木のテラス" },
    ], toneBias: ["sf", "lt"], matte: true, technique: "トーナル配色" },
  { match: ["alice", "不思議の国のアリス", "アリス"], ja: "不思議の国のアリス", story: "水色のエプロンと兎",
    anchors: [
      { h: 196, s: 46, l: 62, name: "アリスブルー" },
      { h: 40, s: 16, l: 94, name: "エプロンの白" },
      { h: 350, s: 62, l: 46, name: "ハートの紅" },
      { h: 130, s: 34, l: 34, name: "庭の深緑" },
    ], toneBias: ["lt", "v"], technique: "セパレーション配色" },
  { match: ["art deco", "アールデコ"], ja: "アールデコ", story: "直線と金の1920年代",
    anchors: [
      { h: 30, s: 12, l: 12, name: "黒漆" },
      { h: 44, s: 62, l: 58, name: "金の装飾" },
      { h: 168, s: 44, l: 34, name: "深い翡翠" },
      { h: 40, s: 20, l: 90, name: "象牙の白" },
    ], toneBias: ["dk", "v"], sparkle: true, technique: "セパレーション配色" },
  { match: ["minimal", "ミニマル", "ミニマリズム"], ja: "ミニマル", story: "削ぎ落とした先",
    anchors: [
      { h: 40, s: 8, l: 94, name: "白" },
      { h: 210, s: 5, l: 62, name: "灰" },
      { h: 30, s: 8, l: 26, name: "黒に近い墨" },
      { h: 36, s: 14, l: 80, name: "生成り" },
    ], toneBias: ["p", "ltg"], matte: true, technique: "トーングラデーション" },
  { match: ["natural", "ナチュラル", "生成り"], ja: "ナチュラル", story: "染めないままの色",
    anchors: [
      { h: 40, s: 26, l: 86, name: "生成りの布" },
      { h: 32, s: 30, l: 62, name: "麻の茶" },
      { h: 90, s: 22, l: 58, name: "枯草の緑" },
      { h: 24, s: 22, l: 38, name: "木の幹" },
    ], toneBias: ["ltg", "sf"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["girly", "ガーリー"], ja: "ガーリー", story: "甘さをためらわない",
    anchors: [
      { h: 344, s: 62, l: 80, name: "砂糖菓子の桃" },
      { h: 40, s: 62, l: 86, name: "クリーム" },
      { h: 280, s: 40, l: 82, name: "うすい藤" },
      { h: 190, s: 44, l: 80, name: "ミントの水色" },
    ], toneBias: ["p", "lt"], technique: "ドミナントトーン配色" },
  { match: ["daffodil", "narcissus", "水仙", "すいせん"], ja: "水仙", story: "寒中に咲く白と黄",
    anchors: [
      { h: 46, s: 20, l: 94, name: "花びらの白" },
      { h: 48, s: 82, l: 62, name: "副冠の黄" },
      { h: 140, s: 32, l: 38, name: "細い葉の緑" },
      { h: 200, s: 16, l: 76, name: "冬の光" },
    ], toneBias: ["p", "v"], technique: "セパレーション配色" },
  { match: ["tulip", "チューリップ"], ja: "チューリップ", story: "並んで咲く原色",
    anchors: [
      { h: 352, s: 74, l: 54, name: "赤いチューリップ" },
      { h: 48, s: 84, l: 62, name: "黄のチューリップ" },
      { h: 340, s: 48, l: 78, name: "淡紅のチューリップ" },
      { h: 120, s: 36, l: 42, name: "茎の緑" },
    ], toneBias: ["v", "b"], technique: "リピテーション配色" },
  { match: ["apple", "林檎", "りんご", "リンゴ"], ja: "林檎", story: "枝についたままの紅",
    anchors: [
      { h: 356, s: 68, l: 46, name: "林檎の紅" },
      { h: 52, s: 62, l: 72, name: "陽のあたる黄" },
      { h: 96, s: 34, l: 34, name: "葉の深緑" },
      { h: 42, s: 26, l: 90, name: "切り口の白" },
    ], toneBias: ["v", "dp"], technique: "ナチュラルハーモニー" },
  { match: ["bird", "小鳥", "ことり"], ja: "小鳥", story: "枝を渡るもの",
    anchors: [
      { h: 30, s: 34, l: 52, name: "羽の茶" },
      { h: 46, s: 72, l: 64, name: "胸の黄" },
      { h: 200, s: 46, l: 62, name: "空の水色" },
      { h: 40, s: 20, l: 90, name: "喉の白" },
    ], toneBias: ["sf", "b"], matte: true },
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

// 入力に含まれる色語・修飾語を拾う。色語はパレットの主役になる
function lookupColorWords(input) {
  const raw = input.trim();
  const lower = raw.toLowerCase().replace(/[_\-]+/g, " ");
  const hit = (list) => list.filter(e => e.match.some(m => /^[a-z ]+$/.test(m)
    ? new RegExp(`(^|[^a-z])${m.replace(/ /g, "\\s*")}([^a-z]|$)`).test(lower)
    : raw.includes(m)));

  // 「青緑」が「青」「緑」も拾ってしまうので、長い語のヒットを優先する
  const colors = hit(COLOR_WORDS);
  const kept = colors.filter(c => !colors.some(o => o !== c &&
    o.match.some(om => c.match.some(cm => om.length > cm.length && om.includes(cm)))));
  // 「紫禁城」の「紫」、「青丹」の「青」のように、
  // 物語辞書や伝統色名の長い語の内部に埋もれた色字は色語として拾わない
  const themeHits = [
    ...DICTIONARY.flatMap(e => e.match.filter(m => raw.includes(m))),
    ...(typeof WACOLORS !== "undefined"
      ? WACOLORS.map(w => w.name).filter(n => n.length >= 2 && raw.includes(n)) : []),
  ];
  const kept2 = kept.filter(c => !c.match.some(cm =>
    themeHits.some(tm => tm.length > cm.length && tm.includes(cm))));

  const mods = hit(MODIFIERS);
  const shift = mods.reduce((a, m) => ({ dl: a.dl + m.dl, ds: a.ds + m.ds }), { dl: 0, ds: 0 });
  return { colors: kept2, shift };
}

// 色語を、濃淡3段のアンカーを持つ辞書エントリに変換する
function colorWordEntry(cw, shift) {
  const l = Math.max(8, Math.min(94, cw.l + shift.dl));
  const s = Math.max(0, Math.min(100, cw.s + shift.ds));
  const mono = s < 15;
  return {
    ja: cw.ja, story: `${cw.ja}を主役に`,
    isColorWord: true, hue: cw.h,
    // 修飾語はここで反映済みなので、あとから全体シフトを重ねない
    anchors: (mono ? [
      { h: cw.h, s, l, name: cw.ja },
      { h: cw.h, s, l: Math.min(96, l + 22), name: `明るい${cw.ja}` },
      { h: cw.h, s, l: Math.max(6, l - 26), name: `暗い${cw.ja}` },
    ] : [
      { h: cw.h, s, l, name: cw.ja },
      { h: cw.h, s: Math.max(12, s - 22), l: Math.min(92, l + 22), name: `淡い${cw.ja}` },
      { h: cw.h, s: Math.min(100, s + 6), l: Math.max(10, l - 20), name: `深い${cw.ja}` },
    ]).map(a => ({ ...a, noShift: true })),
    toneBias: [],
  };
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
