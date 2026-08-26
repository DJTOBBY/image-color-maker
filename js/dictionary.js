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
  { match: ["seiji kinari", "青磁と生成"], ja: "青磁と生成",
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
  { match: ["mountain", "alps", "アルプス"], ja: "山", story: "稜線の遠近",
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
  { match: ["venice", "venezia", "ベネチア", "ヴェネチア", "ヴェネツィア"], ja: "ヴェネチア", story: "運河と仮面舞踏会",
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
  { match: ["berry", "ベリー", "ブルーベリー"], ja: "ベリー", story: "摘みたての果実",
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
    ], toneBias: ["lt", "sf"], technique: "トーンのグラデーション" },
  { match: ["prayer", "祈り", "いのり"], ja: "祈り", story: "捧げるための色",
    anchors: [
      { h: 42, s: 18, l: 92, name: "浄衣の白" },
      { h: 46, s: 60, l: 56, name: "燈明の金" },
      { h: 222, s: 42, l: 28, name: "夜の藍" },
      { h: 12, s: 46, l: 44, name: "香の朱" },
    ], toneBias: ["dp", "p"], technique: "セパレーション" },
  { match: ["dream", "夢", "ゆめ"], ja: "夢", story: "輪郭のさだまらないもの",
    anchors: [
      { h: 275, s: 38, l: 80, name: "藤の霞" },
      { h: 196, s: 42, l: 82, name: "水色のもや" },
      { h: 336, s: 34, l: 84, name: "うすい桃" },
      { h: 230, s: 24, l: 62, name: "遠のく青" },
    ], toneBias: ["p", "lt"], sparkle: true, technique: "トーン・オン・トーン配色" },
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
    ], toneBias: ["p", "dk"], technique: "セパレーション" },
  { match: ["wedding", "結婚式", "婚礼", "ブライダル"], ja: "結婚式", story: "白と金の一日",
    anchors: [
      { h: 42, s: 16, l: 95, name: "白無垢の白" },
      { h: 46, s: 58, l: 60, name: "祝いの金" },
      { h: 4, s: 62, l: 48, name: "紅の差し色" },
      { h: 120, s: 22, l: 60, name: "青葉の緑" },
    ], toneBias: ["p", "v"], sparkle: true, technique: "セパレーション" },

  { match: ["cat", "猫", "ねこ"], ja: "猫", story: "三毛の背中",
    anchors: [
      { h: 28, s: 52, l: 46, name: "茶トラの茶" },
      { h: 40, s: 16, l: 92, name: "腹の白" },
      { h: 30, s: 12, l: 18, name: "斑の黒" },
      { h: 52, s: 70, l: 62, name: "瞳の金" },
    ], toneBias: ["d", "dk"], matte: true, technique: "セパレーション" },
  { match: ["butterfly", "蝶", "ちょう", "アゲハ"], ja: "蝶", story: "揚羽の紋",
    anchors: [
      { h: 46, s: 78, l: 62, name: "揚羽の黄" },
      { h: 25, s: 14, l: 14, name: "翅の黒" },
      { h: 205, s: 62, l: 52, name: "縁の瑠璃" },
      { h: 350, s: 52, l: 58, name: "後翅の紅" },
    ], toneBias: ["v", "dk"], sparkle: true, technique: "セパレーション" },
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
    ], toneBias: ["p", "lt"], sparkle: true, technique: "トーン・オン・トーン配色" },
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
    ], toneBias: ["dkg", "b"], sparkle: true, technique: "セパレーション" },
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
    ], toneBias: ["ltg", "sf"], matte: true, technique: "トーンのグラデーション" },

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
    ], toneBias: ["sf", "ltg"], matte: true, technique: "トーン・オン・トーン配色" },

  { match: ["embroidery", "刺繍", "刺繡", "ししゅう"], ja: "刺繍", story: "糸で描く",
    anchors: [
      { h: 44, s: 26, l: 86, name: "布の生成り" },
      { h: 350, s: 60, l: 50, name: "紅の糸" },
      { h: 214, s: 50, l: 40, name: "藍の糸" },
      { h: 46, s: 62, l: 58, name: "金糸" },
    ], toneBias: ["v", "p"], sparkle: true, technique: "セパレーション" },
  { match: ["ukiyoe", "浮世絵", "うきよえ"], ja: "浮世絵", story: "版木を重ねた色",
    anchors: [
      { h: 214, s: 48, l: 38, name: "藍摺の青" },
      { h: 4, s: 58, l: 48, name: "紅の唇" },
      { h: 44, s: 34, l: 84, name: "地の生成り" },
      { h: 26, s: 14, l: 20, name: "墨の輪郭" },
    ], toneBias: ["dp", "sf"], matte: true, technique: "セパレーション" },
  { match: ["genji", "源氏物語", "げんじものがたり"], ja: "源氏物語", story: "十二単の襲",
    anchors: [
      { h: 288, s: 34, l: 44, name: "藤の紫" },
      { h: 344, s: 44, l: 78, name: "紅梅のかさね" },
      { h: 108, s: 26, l: 38, name: "青朽葉" },
      { h: 46, s: 56, l: 58, name: "蒔絵の金" },
    ], toneBias: ["sf", "dp"], matte: true, technique: "トーン・オン・トーン配色" },
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
    ], toneBias: ["lt", "v"], technique: "セパレーション" },
  { match: ["art deco", "アールデコ"], ja: "アールデコ", story: "直線と金の1920年代",
    anchors: [
      { h: 30, s: 12, l: 12, name: "黒漆" },
      { h: 44, s: 62, l: 58, name: "金の装飾" },
      { h: 168, s: 44, l: 34, name: "深い翡翠" },
      { h: 40, s: 20, l: 90, name: "象牙の白" },
    ], toneBias: ["dk", "v"], sparkle: true, technique: "セパレーション" },
  { match: ["minimal", "ミニマル", "ミニマリズム"], ja: "ミニマル", story: "削ぎ落とした先",
    anchors: [
      { h: 40, s: 8, l: 94, name: "白" },
      { h: 210, s: 5, l: 62, name: "灰" },
      { h: 30, s: 8, l: 26, name: "黒に近い墨" },
      { h: 36, s: 14, l: 80, name: "生成り" },
    ], toneBias: ["p", "ltg"], matte: true, technique: "トーンのグラデーション" },
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
    ], toneBias: ["p", "v"], technique: "セパレーション" },
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
  // ===== 世界の国・地域 =====
  // 国名は語尾にも地形が出ず、分類からも色が決まらない
  // (「ケニアは国」と分かっても色は出ない)。ここは書くしかない。
  // 民族衣装・建築・工芸・風土など、広く知られた土地の色から起こしている。
  { match: ["kenya", "ケニア", "マサイ"], ja: "ケニア", story: "サバンナとマサイの赤",
    anchors: [
      { h: 356, s: 68, l: 46, name: "マサイの赤" },
      { h: 44, s: 52, l: 60, name: "サバンナの枯草" },
      { h: 96, s: 26, l: 34, name: "アカシアの緑" },
      { h: 22, s: 42, l: 34, name: "大地の赤褐" },
    ], toneBias: ["v", "d"], matte: true, technique: "対照色相配色" },
  { match: ["tunisia", "チュニジア", "シディブサイド"], ja: "チュニジア", story: "白い壁と青い扉",
    anchors: [
      { h: 40, s: 14, l: 94, name: "石灰の白壁" },
      { h: 214, s: 62, l: 44, name: "扉の青" },
      { h: 38, s: 44, l: 72, name: "陽に灼けた砂" },
      { h: 190, s: 40, l: 62, name: "地中海の水色" },
    ], toneBias: ["p", "v"], technique: "セパレーション" },
  { match: ["nigeria", "ナイジェリア"], ja: "ナイジェリア", story: "藍染とブロンズ",
    anchors: [
      { h: 222, s: 46, l: 28, name: "アディレの藍" },
      { h: 32, s: 44, l: 42, name: "ブロンズの褐" },
      { h: 148, s: 48, l: 34, name: "深い緑" },
      { h: 42, s: 22, l: 90, name: "布の生成り" },
    ], toneBias: ["dp", "dk"], matte: true },
  { match: ["south africa", "南アフリカ"], ja: "南アフリカ", story: "テーブルマウンテンと乾いた大地",
    anchors: [
      { h: 210, s: 44, l: 44, name: "山の青" },
      { h: 334, s: 52, l: 66, name: "プロテアの紅" },
      { h: 44, s: 50, l: 58, name: "乾いた草原" },
      { h: 26, s: 36, l: 36, name: "赤い土" },
    ], toneBias: ["sf", "dp"], matte: true },
  { match: ["tuscany", "トスカーナ", "トスカナ"], ja: "トスカーナ", story: "糸杉と焼けた土",
    anchors: [
      { h: 18, s: 46, l: 48, name: "テラコッタ" },
      { h: 128, s: 26, l: 26, name: "糸杉の深緑" },
      { h: 44, s: 48, l: 64, name: "麦の金" },
      { h: 30, s: 30, l: 78, name: "漆喰の生成り" },
    ], toneBias: ["d", "sf"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["andalusia", "アンダルシア"], ja: "アンダルシア", story: "白い村とオレンジの木",
    anchors: [
      { h: 42, s: 16, l: 95, name: "白い壁" },
      { h: 28, s: 82, l: 54, name: "オレンジの実" },
      { h: 200, s: 52, l: 46, name: "タイルの青" },
      { h: 356, s: 62, l: 44, name: "フラメンコの紅" },
    ], toneBias: ["v", "p"], technique: "セパレーション" },
  { match: ["bali", "バリ", "バリ島"], ja: "バリ", story: "棚田と寺院の石",
    anchors: [
      { h: 96, s: 44, l: 46, name: "棚田の緑" },
      { h: 210, s: 6, l: 34, name: "寺院の黒石" },
      { h: 46, s: 24, l: 92, name: "プルメリアの白" },
      { h: 44, s: 62, l: 54, name: "供物の金" },
    ], toneBias: ["dp", "b"], matte: true },
  { match: ["taiwan", "台湾", "タイワン"], ja: "台湾", story: "茶畑と廟の朱",
    anchors: [
      { h: 104, s: 40, l: 42, name: "茶畑の緑" },
      { h: 4, s: 72, l: 46, name: "廟の朱" },
      { h: 44, s: 66, l: 56, name: "提灯の金" },
      { h: 30, s: 20, l: 28, name: "古い木の褐" },
    ], toneBias: ["v", "dp"], technique: "対照色相配色" },
  { match: ["korea", "seoul", "韓国", "ソウル", "朝鮮"], ja: "韓国", story: "五方色と丹青",
    anchors: [
      { h: 214, s: 56, l: 42, name: "五方色の青" },
      { h: 356, s: 66, l: 48, name: "五方色の赤" },
      { h: 48, s: 72, l: 58, name: "五方色の黄" },
      { h: 42, s: 20, l: 92, name: "韓紙の白" },
    ], toneBias: ["v", "p"], technique: "リピテーション配色" },
  { match: ["amalfi", "アマルフィ"], ja: "アマルフィ", story: "レモンと断崖の海",
    anchors: [
      { h: 52, s: 86, l: 62, name: "レモンの黄" },
      { h: 202, s: 66, l: 46, name: "ティレニア海の青" },
      { h: 24, s: 44, l: 78, name: "パステルの家並み" },
      { h: 40, s: 18, l: 94, name: "石段の白" },
    ], toneBias: ["b", "lt"], technique: "対照色相配色" },
  { match: ["switzerland", "スイス"], ja: "スイス", story: "氷河と牧草",
    anchors: [
      { h: 200, s: 26, l: 92, name: "万年雪の白" },
      { h: 198, s: 46, l: 58, name: "氷河の青" },
      { h: 108, s: 40, l: 44, name: "牧草の緑" },
      { h: 358, s: 70, l: 46, name: "十字の赤" },
    ], toneBias: ["b", "p"], technique: "セパレーション" },
  { match: ["austria", "オーストリア", "ウィーン"], ja: "オーストリア", story: "宮廷の黄と深い緑",
    anchors: [
      { h: 44, s: 58, l: 68, name: "宮殿の淡黄" },
      { h: 148, s: 34, l: 24, name: "森の深緑" },
      { h: 42, s: 60, l: 52, name: "装飾の金" },
      { h: 40, s: 16, l: 92, name: "漆喰の白" },
    ], toneBias: ["sf", "dk"], sparkle: true },
  { match: ["norway", "ノルウェー"], ja: "ノルウェー", story: "フィヨルドと赤い小屋",
    anchors: [
      { h: 202, s: 34, l: 34, name: "フィヨルドの藍" },
      { h: 6, s: 58, l: 42, name: "漁師小屋の赤" },
      { h: 40, s: 20, l: 90, name: "白樺の幹" },
      { h: 140, s: 22, l: 40, name: "苔むした岩" },
    ], toneBias: ["dp", "d"], matte: true },
  { match: ["sweden", "スウェーデン"], ja: "スウェーデン", story: "ファールンの赤と白木",
    anchors: [
      { h: 8, s: 54, l: 38, name: "ファールンの赤" },
      { h: 214, s: 48, l: 44, name: "旗の青" },
      { h: 46, s: 68, l: 62, name: "旗の黄" },
      { h: 40, s: 26, l: 88, name: "白木の膚" },
    ], toneBias: ["d", "b"], matte: true },
  { match: ["denmark", "デンマーク", "ヒュッゲ"], ja: "デンマーク", story: "灯りと灰と木",
    anchors: [
      { h: 30, s: 22, l: 78, name: "生成りの布" },
      { h: 355, s: 58, l: 44, name: "旗の赤" },
      { h: 210, s: 8, l: 58, name: "北の灰" },
      { h: 34, s: 40, l: 58, name: "蝋燭の照り" },
    ], toneBias: ["ltg", "sf"], matte: true, technique: "トーナル配色" },
  { match: ["finland", "フィンランド"], ja: "フィンランド", story: "湖と白樺と白夜",
    anchors: [
      { h: 204, s: 40, l: 52, name: "湖の青" },
      { h: 42, s: 18, l: 92, name: "白樺の白" },
      { h: 118, s: 24, l: 34, name: "針葉樹の緑" },
      { h: 268, s: 20, l: 76, name: "白夜の淡い紫" },
    ], toneBias: ["p", "sf"], matte: true, technique: "トーン・オン・トーン配色" },
  { match: ["netherlands", "holland", "オランダ"], ja: "オランダ", story: "デルフトの青と王室の橙",
    anchors: [
      { h: 218, s: 62, l: 40, name: "デルフトの青" },
      { h: 42, s: 20, l: 94, name: "白磁の地" },
      { h: 26, s: 84, l: 54, name: "王室の橙" },
      { h: 100, s: 32, l: 44, name: "牧草の緑" },
    ], toneBias: ["v", "p"], technique: "セパレーション" },
  { match: ["belgium", "ベルギー", "ブリュッセル"], ja: "ベルギー", story: "琥珀とレースと石畳",
    anchors: [
      { h: 38, s: 66, l: 52, name: "ビールの琥珀" },
      { h: 42, s: 22, l: 92, name: "レースの白" },
      { h: 28, s: 10, l: 20, name: "石畳の墨" },
      { h: 48, s: 60, l: 58, name: "金の装飾" },
    ], toneBias: ["d", "dk"], sparkle: true },
  { match: ["portugal", "ポルトガル", "アズレージョ", "リスボン"], ja: "ポルトガル", story: "アズレージョと赤い屋根",
    anchors: [
      { h: 212, s: 58, l: 46, name: "アズレージョの青" },
      { h: 42, s: 18, l: 94, name: "タイルの白" },
      { h: 16, s: 54, l: 46, name: "屋根の赤煉瓦" },
      { h: 348, s: 48, l: 30, name: "ポートワインの深紅" },
    ], toneBias: ["v", "dp"], technique: "セパレーション" },
  { match: ["spain", "スペイン", "マドリード"], ja: "スペイン", story: "闘牛と黄土",
    anchors: [
      { h: 354, s: 72, l: 44, name: "情熱の赤" },
      { h: 44, s: 70, l: 56, name: "黄土の金" },
      { h: 30, s: 12, l: 18, name: "黒衣の墨" },
      { h: 42, s: 18, l: 92, name: "石灰の白" },
    ], toneBias: ["v", "dk"], technique: "セパレーション" },
  { match: ["turkey", "トルコ", "イズニック", "イスタンブール"], ja: "トルコ", story: "イズニックの青と赤",
    anchors: [
      { h: 210, s: 62, l: 42, name: "イズニックの藍" },
      { h: 178, s: 56, l: 46, name: "ターコイズ" },
      { h: 4, s: 66, l: 48, name: "陶画の赤" },
      { h: 44, s: 60, l: 58, name: "宮殿の金" },
    ], toneBias: ["v", "dp"], sparkle: true, technique: "対照色相配色" },
  { match: ["iran", "persia", "イラン", "ペルシャ", "ペルシア"], ja: "イラン", story: "ペルシャの青と絨毯の茜",
    anchors: [
      { h: 206, s: 66, l: 44, name: "ペルシャンブルー" },
      { h: 176, s: 52, l: 48, name: "タイルのターコイズ" },
      { h: 356, s: 54, l: 38, name: "絨毯の茜" },
      { h: 44, s: 58, l: 56, name: "写本の金" },
    ], toneBias: ["dp", "v"], sparkle: true },
  { match: ["thailand", "タイ", "バンコク"], ja: "タイ", story: "黄金の仏塔と僧衣",
    anchors: [
      { h: 44, s: 74, l: 56, name: "仏塔の金" },
      { h: 28, s: 78, l: 52, name: "僧衣の橙" },
      { h: 158, s: 44, l: 36, name: "翡翠の緑" },
      { h: 348, s: 48, l: 62, name: "蓮の紅" },
    ], toneBias: ["v", "b"], sparkle: true },
  { match: ["vietnam", "ベトナム", "アオザイ"], ja: "ベトナム", story: "アオザイと蓮",
    anchors: [
      { h: 344, s: 44, l: 76, name: "蓮のうす紅" },
      { h: 42, s: 20, l: 94, name: "アオザイの白" },
      { h: 6, s: 64, l: 42, name: "漆の朱" },
      { h: 162, s: 38, l: 38, name: "翡翠" },
    ], toneBias: ["p", "dp"], technique: "セパレーション" },
  { match: ["nepal", "ネパール", "タルチョ"], ja: "ネパール", story: "祈りの旗とヒマラヤ",
    anchors: [
      { h: 214, s: 58, l: 46, name: "タルチョの青" },
      { h: 46, s: 76, l: 58, name: "タルチョの黄" },
      { h: 356, s: 68, l: 48, name: "タルチョの赤" },
      { h: 200, s: 20, l: 92, name: "ヒマラヤの白" },
    ], toneBias: ["v", "p"], technique: "リピテーション配色" },
  { match: ["bolivia", "ボリビア", "ウユニ"], ja: "ボリビア", story: "塩の湖と空の鏡",
    anchors: [
      { h: 200, s: 14, l: 94, name: "塩の白" },
      { h: 206, s: 58, l: 62, name: "映る空の青" },
      { h: 350, s: 56, l: 48, name: "アグアヨの紅" },
      { h: 44, s: 62, l: 56, name: "織りの黄" },
    ], toneBias: ["p", "v"], technique: "セパレーション" },
  { match: ["mexico", "メキシコ"], ja: "メキシコ", story: "マリーゴールドとタイル",
    anchors: [
      { h: 30, s: 88, l: 54, name: "マリーゴールドの橙" },
      { h: 330, s: 72, l: 54, name: "メキシカンピンク" },
      { h: 194, s: 56, l: 46, name: "タラベラの青" },
      { h: 158, s: 46, l: 36, name: "翡翠の緑" },
    ], toneBias: ["v", "b"], technique: "対照色相配色" },
  { match: ["brazil", "ブラジル"], ja: "ブラジル", story: "森と海と黄",
    anchors: [
      { h: 140, s: 62, l: 34, name: "森の緑" },
      { h: 48, s: 82, l: 58, name: "旗の黄" },
      { h: 200, s: 62, l: 50, name: "大西洋の青" },
      { h: 24, s: 56, l: 50, name: "赤土" },
    ], toneBias: ["v", "dp"], technique: "対照色相配色" },
  { match: ["argentina", "アルゼンチン", "タンゴ"], ja: "アルゼンチン", story: "空色とタンゴの黒",
    anchors: [
      { h: 202, s: 52, l: 68, name: "空色" },
      { h: 42, s: 18, l: 94, name: "旗の白" },
      { h: 354, s: 62, l: 38, name: "タンゴの深紅" },
      { h: 44, s: 44, l: 56, name: "パンパの金" },
    ], toneBias: ["lt", "dk"], technique: "セパレーション" },
  { match: ["jamaica", "ジャマイカ"], ja: "ジャマイカ", story: "カリブの緑と黄",
    anchors: [
      { h: 140, s: 58, l: 34, name: "島の緑" },
      { h: 48, s: 84, l: 58, name: "陽の黄" },
      { h: 186, s: 60, l: 54, name: "カリブの海" },
      { h: 30, s: 14, l: 16, name: "旗の黒" },
    ], toneBias: ["v", "b"], technique: "セパレーション" },
  { match: ["ireland", "アイルランド"], ja: "アイルランド", story: "エメラルドの島",
    anchors: [
      { h: 138, s: 46, l: 34, name: "エメラルドの牧草" },
      { h: 210, s: 8, l: 56, name: "石垣の灰" },
      { h: 288, s: 28, l: 52, name: "ヒースの紫" },
      { h: 40, s: 24, l: 86, name: "羊毛の生成り" },
    ], toneBias: ["dp", "ltg"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["scotland", "スコットランド", "ハイランド"], ja: "スコットランド", story: "タータンと霧の丘",
    anchors: [
      { h: 148, s: 34, l: 24, name: "タータンの深緑" },
      { h: 352, s: 56, l: 34, name: "タータンの臙脂" },
      { h: 286, s: 26, l: 48, name: "ヒースの紫" },
      { h: 210, s: 10, l: 70, name: "霧の灰" },
    ], toneBias: ["dk", "d"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["wales", "ウェールズ"], ja: "ウェールズ", story: "石板の灰と谷の緑",
    anchors: [
      { h: 214, s: 10, l: 42, name: "スレートの灰" },
      { h: 118, s: 38, l: 36, name: "谷の緑" },
      { h: 354, s: 66, l: 44, name: "竜の赤" },
      { h: 40, s: 22, l: 84, name: "羊の白" },
    ], toneBias: ["d", "dp"], matte: true },
  { match: ["germany", "ドイツ", "バウハウス"], ja: "ドイツ", story: "バウハウスの三原色",
    anchors: [
      { h: 356, s: 72, l: 46, name: "バウハウスの赤" },
      { h: 48, s: 84, l: 56, name: "バウハウスの黄" },
      { h: 218, s: 62, l: 42, name: "バウハウスの青" },
      { h: 30, s: 10, l: 16, name: "黒" },
    ], toneBias: ["v", "dk"], technique: "対照色相配色" },
  { match: ["russia", "ロシア", "モスクワ"], ja: "ロシア", story: "聖堂の金と冬の白",
    anchors: [
      { h: 44, s: 66, l: 54, name: "円屋根の金" },
      { h: 214, s: 56, l: 38, name: "聖堂の青" },
      { h: 354, s: 62, l: 42, name: "赤の広場" },
      { h: 210, s: 12, l: 92, name: "雪の白" },
    ], toneBias: ["dp", "v"], sparkle: true },
  { match: ["poland", "ポーランド", "琥珀の道"], ja: "ポーランド", story: "琥珀と民芸の花",
    anchors: [
      { h: 36, s: 74, l: 52, name: "バルト海の琥珀" },
      { h: 354, s: 60, l: 46, name: "民芸の赤" },
      { h: 42, s: 20, l: 94, name: "旗の白" },
      { h: 128, s: 34, l: 36, name: "刺繍の緑" },
    ], toneBias: ["v", "d"], technique: "リピテーション配色" },
  { match: ["czech", "チェコ", "ボヘミア", "プラハ"], ja: "チェコ", story: "ボヘミアングラスと赤い屋根",
    anchors: [
      { h: 356, s: 52, l: 46, name: "屋根の赤" },
      { h: 274, s: 40, l: 46, name: "硝子の紫" },
      { h: 44, s: 30, l: 84, name: "漆喰の生成り" },
      { h: 214, s: 12, l: 40, name: "石畳の灰" },
    ], toneBias: ["dp", "sf"], sparkle: true },
  { match: ["hungary", "ハンガリー"], ja: "ハンガリー", story: "パプリカと刺繍",
    anchors: [
      { h: 6, s: 74, l: 46, name: "パプリカの赤" },
      { h: 42, s: 24, l: 92, name: "麻布の生成り" },
      { h: 214, s: 52, l: 44, name: "刺繍の青" },
      { h: 130, s: 40, l: 38, name: "刺繍の緑" },
    ], toneBias: ["v", "p"], technique: "セパレーション" },
  { match: ["croatia", "クロアチア", "アドリア"], ja: "クロアチア", story: "アドリア海と赤い瓦",
    anchors: [
      { h: 196, s: 62, l: 48, name: "アドリア海の碧" },
      { h: 14, s: 56, l: 48, name: "屋根の赤瓦" },
      { h: 40, s: 16, l: 90, name: "石灰岩の白" },
      { h: 118, s: 28, l: 34, name: "糸杉の緑" },
    ], toneBias: ["b", "dp"], technique: "対照色相配色" },
  { match: ["australia", "オーストラリア", "ウルル"], ja: "オーストラリア", story: "赤い大地とユーカリ",
    anchors: [
      { h: 16, s: 62, l: 46, name: "ウルルの赤土" },
      { h: 120, s: 14, l: 58, name: "ユーカリの銀緑" },
      { h: 186, s: 58, l: 56, name: "珊瑚礁の海" },
      { h: 40, s: 44, l: 74, name: "乾いた砂" },
    ], toneBias: ["d", "sf"], matte: true, technique: "対照色相配色" },
  { match: ["canada", "カナダ", "メープル"], ja: "カナダ", story: "楓の紅と針葉樹",
    anchors: [
      { h: 4, s: 68, l: 44, name: "楓の紅" },
      { h: 140, s: 34, l: 26, name: "針葉樹の深緑" },
      { h: 204, s: 42, l: 46, name: "湖の青" },
      { h: 200, s: 14, l: 94, name: "雪の白" },
    ], toneBias: ["dp", "p"], technique: "対照色相配色" },
  { match: ["china", "中国", "チャイナ"], ja: "中国", story: "中国紅と青花",
    anchors: [
      { h: 356, s: 76, l: 44, name: "中国紅" },
      { h: 46, s: 72, l: 54, name: "皇帝の黄" },
      { h: 220, s: 58, l: 36, name: "青花の藍" },
      { h: 158, s: 40, l: 40, name: "翡翠" },
    ], toneBias: ["v", "dp"], technique: "対照色相配色" },
  // ===== 素材・質感 =====
  // ビーズの加工(ラメ・ツヤケシ)と直結する言葉。
  // 布や金属の手ざわりを、色とツヤの指定に翻訳する。
  { match: ["linen", "リネン", "亜麻布"], ja: "リネン", story: "洗いざらしの手ざわり",
    anchors: [
      { h: 42, s: 30, l: 88, name: "生成りの亜麻" }, { h: 40, s: 22, l: 70, name: "使いこんだ麻" },
      { h: 36, s: 16, l: 48, name: "織り目の影" }, { h: 44, s: 20, l: 94, name: "陽にさらした白" },
    ], toneBias: ["ltg", "p"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["denim", "デニム", "ジーンズ"], ja: "デニム", story: "藍が落ちてゆく段階",
    anchors: [
      { h: 218, s: 42, l: 30, name: "生デニムの藍" }, { h: 212, s: 34, l: 54, name: "色落ちの青" },
      { h: 206, s: 24, l: 76, name: "アタリの白茶" }, { h: 40, s: 46, l: 62, name: "ステッチの黄" },
    ], toneBias: ["dp", "sf"], matte: true, technique: "トーンのグラデーション" },
  { match: ["corduroy", "コーデュロイ", "コール天"], ja: "コーデュロイ", story: "畝のある起毛",
    anchors: [
      { h: 26, s: 42, l: 38, name: "畝の茶" }, { h: 30, s: 30, l: 58, name: "毛足の明るみ" },
      { h: 60, s: 20, l: 32, name: "谷の影" }, { h: 38, s: 34, l: 76, name: "毛羽の淡さ" },
    ], toneBias: ["d", "dk"], matte: true, technique: "同一色相配色" },
  { match: ["velvet", "ベルベット", "ビロード", "天鵞絨"], ja: "ベルベット", story: "光を吸う毛並み",
    anchors: [
      { h: 340, s: 46, l: 24, name: "ビロードの臙脂" }, { h: 344, s: 40, l: 44, name: "毛並みの照り" },
      { h: 280, s: 30, l: 20, name: "沈む紫の影" }, { h: 44, s: 52, l: 52, name: "縁の金" },
    ], toneBias: ["dk", "dp"], sparkle: true, technique: "同一色相配色" },
  { match: ["silk", "シルク", "絹"], ja: "シルク", story: "見る角度で変わる艶",
    anchors: [
      { h: 44, s: 34, l: 88, name: "生成りの絹" }, { h: 36, s: 44, l: 72, name: "光の当たる面" },
      { h: 216, s: 16, l: 62, name: "翻った影" }, { h: 340, s: 24, l: 82, name: "玉虫の紅" },
    ], toneBias: ["p", "lt"], sparkle: true, technique: "フォ・カマイユ配色" },
  { match: ["tweed", "ツイード"], ja: "ツイード", story: "何色も混ぜて一色に見せる",
    anchors: [
      { h: 30, s: 20, l: 42, name: "杢の茶" }, { h: 140, s: 18, l: 38, name: "混ざる緑" },
      { h: 220, s: 16, l: 44, name: "混ざる青" }, { h: 42, s: 30, l: 78, name: "白の粒" },
    ], toneBias: ["d", "g"], matte: true, technique: "トーナル配色" },
  { match: ["lace", "レース"], ja: "レース", story: "透きとおる網目",
    anchors: [
      { h: 42, s: 22, l: 95, name: "レースの白" }, { h: 38, s: 28, l: 84, name: "生成りの糸" },
      { h: 220, s: 10, l: 72, name: "透ける影" }, { h: 44, s: 34, l: 90, name: "縁のかがり" },
    ], toneBias: ["p", "ltg"], technique: "カマイユ配色" },
  { match: ["cashmere", "カシミア", "カシミヤ"], ja: "カシミア", story: "空気を含んだ柔らかさ",
    anchors: [
      { h: 30, s: 22, l: 78, name: "杏色の毛" }, { h: 24, s: 18, l: 58, name: "落ち着いた駱駝" },
      { h: 200, s: 8, l: 84, name: "淡い霜" }, { h: 20, s: 14, l: 36, name: "襟の影" },
    ], toneBias: ["ltg", "sf"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["suede", "スエード"], ja: "スエード", story: "毛羽立った革",
    anchors: [
      { h: 28, s: 34, l: 44, name: "スエードの褐" }, { h: 34, s: 26, l: 64, name: "撫でた明るみ" },
      { h: 20, s: 22, l: 26, name: "沈んだ縁" }, { h: 40, s: 22, l: 80, name: "起毛の白け" },
    ], toneBias: ["d", "dk"], matte: true, technique: "同一色相配色" },
  { match: ["pearl finish", "パール", "真珠"], ja: "パール", story: "内側から滲む虹",
    anchors: [
      { h: 40, s: 24, l: 93, name: "真珠の白" }, { h: 330, s: 22, l: 86, name: "干渉の紅" },
      { h: 190, s: 24, l: 84, name: "干渉の青" }, { h: 46, s: 30, l: 76, name: "巻きの照り" },
    ], toneBias: ["p", "lt"], sparkle: true, technique: "フォ・カマイユ配色" },
  { match: ["metallic", "メタリック", "金属"], ja: "メタリック", story: "面で光を返す",
    anchors: [
      { h: 44, s: 56, l: 58, name: "金の照り" }, { h: 210, s: 8, l: 74, name: "銀の面" },
      { h: 24, s: 10, l: 26, name: "陰の鈍色" }, { h: 40, s: 22, l: 92, name: "ハイライト" },
    ], toneBias: ["b", "dk"], sparkle: true, technique: "セパレーション" },
  { match: ["matte", "マット", "つや消し", "ツヤケシ"], ja: "マット", story: "光を返さない肌",
    anchors: [
      { h: 36, s: 14, l: 76, name: "白亜" }, { h: 30, s: 12, l: 52, name: "灰みの砂" },
      { h: 210, s: 8, l: 34, name: "鈍い炭" }, { h: 44, s: 18, l: 88, name: "粉のような白" },
    ], toneBias: ["ltg", "g"], matte: true, technique: "トーナル配色" },
  { match: ["tortoiseshell", "べっ甲", "鼈甲"], ja: "べっ甲", story: "琥珀と焦茶のまだら",
    anchors: [
      { h: 36, s: 74, l: 52, name: "べっ甲の飴色" }, { h: 24, s: 52, l: 28, name: "斑の焦茶" },
      { h: 44, s: 60, l: 70, name: "透ける明るみ" }, { h: 20, s: 34, l: 16, name: "濃い縁" },
    ], toneBias: ["d", "dk"], sparkle: true, technique: "同一色相配色" },
  { match: ["marble", "大理石", "マーブル"], ja: "大理石", story: "石に走る筋",
    anchors: [
      { h: 40, s: 10, l: 94, name: "石の白" }, { h: 210, s: 10, l: 64, name: "灰の筋" },
      { h: 30, s: 14, l: 40, name: "深い筋" }, { h: 150, s: 12, l: 78, name: "緑がかった斑" },
    ], toneBias: ["p", "ltg"], technique: "セパレーション" },
  { match: ["brass", "真鍮", "しんちゅう"], ja: "真鍮", story: "使うほど深くなる金",
    anchors: [
      { h: 44, s: 58, l: 56, name: "磨いた真鍮" }, { h: 38, s: 42, l: 38, name: "くすんだ地" },
      { h: 60, s: 20, l: 24, name: "経年の陰" }, { h: 48, s: 64, l: 74, name: "当たりの照り" },
    ], toneBias: ["d", "s"], sparkle: true, technique: "同一色相配色" },
  { match: ["rust", "錆", "さび"], ja: "錆", story: "時間が作る色",
    anchors: [
      { h: 18, s: 52, l: 42, name: "赤錆" }, { h: 32, s: 38, l: 58, name: "浮いた粉" },
      { h: 200, s: 12, l: 36, name: "残る鉄" }, { h: 40, s: 24, l: 76, name: "剥げた地" },
    ], toneBias: ["d", "dk"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["woodgrain", "木目", "きめ"], ja: "木目", story: "年輪の濃淡",
    anchors: [
      { h: 32, s: 34, l: 62, name: "白木の膚" }, { h: 26, s: 40, l: 38, name: "年輪の濃い筋" },
      { h: 36, s: 28, l: 78, name: "削りたての白" }, { h: 20, s: 26, l: 24, name: "節の黒" },
    ], toneBias: ["sf", "d"], matte: true, technique: "同一色相配色" },

  // ===== 宝石・誕生石 =====
  // 誕生石は1月から12月まで。贈りものの配色として使えるように。
  { match: ["garnet", "ガーネット", "柘榴石"], ja: "ガーネット", story: "一月の石、柘榴の実",
    anchors: [
      { h: 348, s: 62, l: 28, name: "ガーネットの深紅" }, { h: 354, s: 58, l: 46, name: "透ける紅" },
      { h: 340, s: 30, l: 16, name: "石の芯" }, { h: 8, s: 40, l: 70, name: "縁の照り" },
    ], toneBias: ["dp", "dk"], sparkle: true, technique: "同一色相配色" },
  { match: ["amethyst", "アメジスト", "紫水晶"], ja: "アメジスト", story: "二月の石、紫の結晶",
    anchors: [
      { h: 278, s: 44, l: 46, name: "アメジストの紫" }, { h: 286, s: 32, l: 72, name: "淡い紫の層" },
      { h: 264, s: 40, l: 26, name: "濃い芯" }, { h: 300, s: 18, l: 90, name: "結晶の白" },
    ], toneBias: ["dp", "p"], sparkle: true, technique: "トーンのグラデーション" },
  { match: ["aquamarine", "アクアマリン", "藍玉"], ja: "アクアマリン", story: "三月の石、海の水",
    anchors: [
      { h: 186, s: 46, l: 70, name: "アクアマリンの碧" }, { h: 194, s: 38, l: 86, name: "薄氷の水色" },
      { h: 200, s: 44, l: 48, name: "深みの青" }, { h: 40, s: 14, l: 95, name: "光の白" },
    ], toneBias: ["lt", "p"], sparkle: true, technique: "トーン・オン・トーン配色" },
  { match: ["diamond", "ダイヤモンド", "ダイヤ", "金剛石"], ja: "ダイヤモンド", story: "四月の石、無色の輝き",
    anchors: [
      { h: 210, s: 10, l: 96, name: "無色の白" }, { h: 200, s: 22, l: 82, name: "青い閃光" },
      { h: 44, s: 26, l: 88, name: "黄の閃光" }, { h: 220, s: 14, l: 46, name: "カットの陰" },
    ], toneBias: ["p", "ltg"], sparkle: true, technique: "セパレーション" },
  { match: ["emerald", "エメラルド", "翠玉"], ja: "エメラルド", story: "五月の石、深い緑",
    anchors: [
      { h: 158, s: 62, l: 32, name: "エメラルドの緑" }, { h: 150, s: 44, l: 54, name: "透ける翠" },
      { h: 168, s: 48, l: 18, name: "石の奥" }, { h: 140, s: 24, l: 84, name: "縁の淡緑" },
    ], toneBias: ["dp", "v"], sparkle: true, technique: "同一色相配色" },
  { match: ["moonstone", "ムーンストーン", "月長石"], ja: "ムーンストーン", story: "六月の石、月のかげろう",
    anchors: [
      { h: 40, s: 12, l: 92, name: "乳白の地" }, { h: 206, s: 34, l: 78, name: "浮かぶ青い光" },
      { h: 44, s: 18, l: 74, name: "淡い金の翳り" }, { h: 220, s: 14, l: 56, name: "沈む影" },
    ], toneBias: ["p", "ltg"], sparkle: true, technique: "フォ・カマイユ配色" },
  { match: ["ruby", "ルビー", "紅玉"], ja: "ルビー", story: "七月の石、燃える紅",
    anchors: [
      { h: 352, s: 76, l: 38, name: "ルビーの紅" }, { h: 358, s: 60, l: 56, name: "透ける火" },
      { h: 340, s: 44, l: 18, name: "石の影" }, { h: 6, s: 40, l: 82, name: "縁の光" },
    ], toneBias: ["v", "dp"], sparkle: true, technique: "同一色相配色" },
  { match: ["peridot", "ペリドット", "橄欖石"], ja: "ペリドット", story: "八月の石、若い黄緑",
    anchors: [
      { h: 76, s: 54, l: 50, name: "ペリドットの黄緑" }, { h: 84, s: 40, l: 72, name: "透ける若草" },
      { h: 66, s: 44, l: 30, name: "深みの緑" }, { h: 54, s: 30, l: 88, name: "光の抜け" },
    ], toneBias: ["b", "lt"], sparkle: true, technique: "同一色相配色" },
  { match: ["sapphire", "サファイア", "蒼玉"], ja: "サファイア", story: "九月の石、夜の青",
    anchors: [
      { h: 220, s: 66, l: 32, name: "サファイアの青" }, { h: 212, s: 48, l: 54, name: "透ける碧" },
      { h: 232, s: 50, l: 16, name: "石の芯" }, { h: 200, s: 24, l: 84, name: "縁の光" },
    ], toneBias: ["dp", "dk"], sparkle: true, technique: "同一色相配色" },
  { match: ["opal", "オパール", "蛋白石"], ja: "オパール", story: "十月の石、遊色の虹",
    anchors: [
      { h: 42, s: 26, l: 90, name: "乳白の地" }, { h: 176, s: 48, l: 64, name: "遊色の青緑" },
      { h: 326, s: 40, l: 72, name: "遊色の紅" }, { h: 48, s: 62, l: 66, name: "遊色の金" },
    ], toneBias: ["p", "b"], sparkle: true, technique: "リピテーション配色" },
  { match: ["topaz", "トパーズ", "黄玉"], ja: "トパーズ", story: "十一月の石、蜜の黄",
    anchors: [
      { h: 40, s: 76, l: 56, name: "トパーズの黄" }, { h: 32, s: 60, l: 74, name: "透ける蜜" },
      { h: 28, s: 52, l: 34, name: "深みの琥珀" }, { h: 48, s: 34, l: 90, name: "光の抜け" },
    ], toneBias: ["b", "s"], sparkle: true, technique: "同一色相配色" },
  { match: ["lapis", "lapis lazuli", "ラピスラズリ"], ja: "ラピスラズリ", story: "十二月の石、金の粒を抱く青",
    anchors: [
      { h: 224, s: 62, l: 34, name: "瑠璃の青" }, { h: 44, s: 68, l: 58, name: "黄鉄鉱の金" },
      { h: 218, s: 44, l: 18, name: "石の深み" }, { h: 40, s: 16, l: 88, name: "方解石の白" },
    ], toneBias: ["dp", "v"], sparkle: true, technique: "セパレーション" },
  { match: ["onyx", "オニキス", "縞瑪瑙"], ja: "オニキス", story: "黒と白の縞",
    anchors: [
      { h: 30, s: 8, l: 10, name: "オニキスの黒" }, { h: 40, s: 10, l: 92, name: "縞の白" },
      { h: 210, s: 6, l: 44, name: "境の灰" }, { h: 30, s: 12, l: 24, name: "艶の返り" },
    ], toneBias: ["dkg", "p"], sparkle: true, technique: "セパレーション" },
  { match: ["crystal", "水晶", "クリスタル"], ja: "水晶", story: "透きとおる六角柱",
    anchors: [
      { h: 200, s: 8, l: 94, name: "水晶の無色" }, { h: 210, s: 18, l: 78, name: "面の反射" },
      { h: 44, s: 10, l: 86, name: "温かい抜け" }, { h: 220, s: 12, l: 52, name: "内包の影" },
    ], toneBias: ["p", "ltg"], sparkle: true, technique: "カマイユ配色" },
  { match: ["tourmaline", "トルマリン", "電気石"], ja: "トルマリン", story: "一本の石に二色",
    anchors: [
      { h: 336, s: 56, l: 58, name: "ピンクトルマリン" }, { h: 116, s: 44, l: 42, name: "グリーントルマリン" },
      { h: 40, s: 18, l: 90, name: "境の透明" }, { h: 320, s: 34, l: 28, name: "深みの紅紫" },
    ], toneBias: ["v", "dp"], sparkle: true, technique: "補色配色" },

  // ===== 星座 =====
  // 十二星座。誕生石と組み合わせて贈りものの配色に。
  { match: ["aries", "牡羊座", "おひつじ座"], ja: "牡羊座", story: "口火を切る赤",
    anchors: [
      { h: 4, s: 74, l: 48, name: "衝動の赤" }, { h: 22, s: 78, l: 58, name: "跳ねる橙" },
      { h: 44, s: 20, l: 92, name: "白の余白" }, { h: 350, s: 46, l: 26, name: "沈める深紅" },
    ], toneBias: ["v", "b"], technique: "ドミナントカラー配色" },
  { match: ["taurus", "牡牛座", "おうし座"], ja: "牡牛座", story: "土に根を張る緑",
    anchors: [
      { h: 112, s: 32, l: 40, name: "牧草の緑" }, { h: 32, s: 34, l: 46, name: "肥えた土" },
      { h: 336, s: 34, l: 76, name: "花のうす紅" }, { h: 44, s: 26, l: 86, name: "乳の白" },
    ], toneBias: ["sf", "d"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["gemini", "双子座", "ふたご座"], ja: "双子座", story: "移り気な二色",
    anchors: [
      { h: 50, s: 78, l: 64, name: "軽やかな黄" }, { h: 196, s: 56, l: 66, name: "風の水色" },
      { h: 40, s: 18, l: 94, name: "白の間" }, { h: 280, s: 30, l: 62, name: "気まぐれの藤" },
    ], toneBias: ["b", "lt"], technique: "セパレーション" },
  { match: ["cancer", "蟹座", "かに座"], ja: "蟹座", story: "月に守られた銀",
    anchors: [
      { h: 210, s: 16, l: 86, name: "月の銀白" }, { h: 200, s: 32, l: 60, name: "潮の青" },
      { h: 40, s: 26, l: 90, name: "貝の内側" }, { h: 222, s: 26, l: 38, name: "夜の深み" },
    ], toneBias: ["p", "ltg"], sparkle: true, technique: "トーン・オン・トーン配色" },
  { match: ["leo", "獅子座", "しし座"], ja: "獅子座", story: "陽そのものの金",
    anchors: [
      { h: 44, s: 82, l: 56, name: "太陽の金" }, { h: 28, s: 76, l: 50, name: "鬣の橙" },
      { h: 352, s: 62, l: 42, name: "威の紅" }, { h: 44, s: 30, l: 92, name: "光の白" },
    ], toneBias: ["v", "s"], sparkle: true, technique: "ドミナントカラー配色" },
  { match: ["virgo", "乙女座", "おとめ座"], ja: "乙女座", story: "整えられた生成り",
    anchors: [
      { h: 40, s: 24, l: 88, name: "麦の生成り" }, { h: 96, s: 24, l: 52, name: "端正な緑" },
      { h: 30, s: 20, l: 62, name: "落ち着いた砂" }, { h: 210, s: 10, l: 40, name: "整った灰" },
    ], toneBias: ["ltg", "sf"], matte: true, technique: "トーナル配色" },
  { match: ["libra", "天秤座", "てんびん座"], ja: "天秤座", story: "釣り合いのとれた淡さ",
    anchors: [
      { h: 336, s: 40, l: 80, name: "均衡のうす紅" }, { h: 196, s: 34, l: 78, name: "均衡の水色" },
      { h: 44, s: 20, l: 93, name: "白の支点" }, { h: 268, s: 24, l: 60, name: "中間の藤" },
    ], toneBias: ["p", "lt"], technique: "対照色相配色" },
  { match: ["scorpio", "蠍座", "さそり座"], ja: "蠍座", story: "沈めた深紅",
    anchors: [
      { h: 344, s: 54, l: 24, name: "秘めた深紅" }, { h: 268, s: 34, l: 30, name: "夜の紫" },
      { h: 356, s: 62, l: 46, name: "毒の赤" }, { h: 30, s: 10, l: 12, name: "闇の黒" },
    ], toneBias: ["dk", "dp"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["sagittarius", "射手座", "いて座"], ja: "射手座", story: "遠くへ向かう青紫",
    anchors: [
      { h: 262, s: 42, l: 46, name: "遠矢の青紫" }, { h: 208, s: 52, l: 58, name: "旅の空" },
      { h: 40, s: 62, l: 62, name: "地平の金" }, { h: 44, s: 22, l: 90, name: "抜けの白" },
    ], toneBias: ["b", "dp"], technique: "対照色相配色" },
  { match: ["capricorn", "山羊座", "やぎ座"], ja: "山羊座", story: "積み上げた岩の色",
    anchors: [
      { h: 28, s: 20, l: 30, name: "岩の焦茶" }, { h: 210, s: 8, l: 52, name: "石の灰" },
      { h: 140, s: 16, l: 34, name: "苔の緑" }, { h: 40, s: 22, l: 82, name: "頂の白" },
    ], toneBias: ["dk", "g"], matte: true, technique: "トーナル配色" },
  { match: ["aquarius", "水瓶座", "みずがめ座"], ja: "水瓶座", story: "先を行く電気の青",
    anchors: [
      { h: 190, s: 62, l: 60, name: "電気の水色" }, { h: 226, s: 48, l: 44, name: "群青" },
      { h: 168, s: 40, l: 76, name: "淡い翠" }, { h: 40, s: 16, l: 94, name: "空白の白" },
    ], toneBias: ["b", "lt"], sparkle: true, technique: "類似色相配色" },
  { match: ["pisces", "魚座", "うお座"], ja: "魚座", story: "境目のない青緑",
    anchors: [
      { h: 176, s: 38, l: 66, name: "溶ける青緑" }, { h: 284, s: 28, l: 74, name: "滲む藤" },
      { h: 206, s: 36, l: 50, name: "深みの青" }, { h: 42, s: 20, l: 92, name: "泡の白" },
    ], toneBias: ["p", "sf"], sparkle: true, technique: "トーン・オン・トーン配色" },
  // ===== 花 =====
  // ビーズ作品の定番。花そのものと、添える葉・茎まで含めて色にする。
  { match: ["lily", "百合", "ゆり", "リリー"], ja: "百合", story: "香りの強い白",
    anchors: [
      { h: 44, s: 24, l: 95, name: "百合の白" }, { h: 46, s: 62, l: 66, name: "花粉の黄" },
      { h: 108, s: 34, l: 38, name: "太い茎の緑" }, { h: 340, s: 26, l: 84, name: "喉のうす紅" },
    ], toneBias: ["p", "v"], technique: "セパレーション" },
  { match: ["orchid", "蘭", "ラン", "オーキッド"], ja: "蘭", story: "整いすぎた花のかたち",
    anchors: [
      { h: 302, s: 38, l: 66, name: "蘭の紅紫" }, { h: 44, s: 22, l: 94, name: "花弁の白" },
      { h: 46, s: 58, l: 62, name: "唇弁の黄" }, { h: 130, s: 28, l: 30, name: "厚い葉" },
    ], toneBias: ["sf", "p"], technique: "対照色相配色" },
  { match: ["carnation", "カーネーション"], ja: "カーネーション", story: "縁のぎざぎざ",
    anchors: [
      { h: 348, s: 58, l: 62, name: "カーネーションの紅" }, { h: 344, s: 40, l: 82, name: "淡い覆輪" },
      { h: 150, s: 20, l: 56, name: "白緑の葉" }, { h: 42, s: 24, l: 92, name: "白い品種" },
    ], toneBias: ["b", "lt"], technique: "トーン・オン・トーン配色" },
  { match: ["gerbera", "ガーベラ"], ja: "ガーベラ", story: "まっすぐ開いた円",
    anchors: [
      { h: 22, s: 82, l: 60, name: "ガーベラの橙" }, { h: 340, s: 68, l: 66, name: "濃桃の品種" },
      { h: 48, s: 78, l: 62, name: "黄の品種" }, { h: 100, s: 34, l: 36, name: "細い茎" },
    ], toneBias: ["v", "b"], technique: "リピテーション配色" },
  { match: ["dahlia", "ダリア"], ja: "ダリア", story: "幾重にも重なる花弁",
    anchors: [
      { h: 336, s: 56, l: 46, name: "ダリアの紅紫" }, { h: 352, s: 46, l: 70, name: "外へゆく淡さ" },
      { h: 300, s: 34, l: 28, name: "芯の深み" }, { h: 116, s: 30, l: 32, name: "濃い葉" },
    ], toneBias: ["dp", "sf"], technique: "トーンのグラデーション" },
  { match: ["peony", "芍薬", "しゃくやく"], ja: "芍薬", story: "ほどけるように咲く",
    anchors: [
      { h: 344, s: 48, l: 80, name: "芍薬のうす紅" }, { h: 350, s: 56, l: 58, name: "芯へ向かう紅" },
      { h: 44, s: 26, l: 93, name: "白い品種" }, { h: 120, s: 26, l: 34, name: "青みの葉" },
    ], toneBias: ["p", "sf"], technique: "トーン・オン・トーン配色" },
  { match: ["marguerite", "マーガレット"], ja: "マーガレット", story: "白と黄の単純さ",
    anchors: [
      { h: 44, s: 20, l: 95, name: "花弁の白" }, { h: 48, s: 80, l: 60, name: "中心の黄" },
      { h: 96, s: 32, l: 46, name: "細い葉" }, { h: 200, s: 24, l: 84, name: "空の抜け" },
    ], toneBias: ["p", "v"], technique: "セパレーション" },
  { match: ["baby's breath", "かすみ草", "カスミソウ"], ja: "かすみ草", story: "白い粒の霞",
    anchors: [
      { h: 42, s: 18, l: 96, name: "粒の白" }, { h: 90, s: 18, l: 66, name: "細い茎の緑" },
      { h: 220, s: 10, l: 84, name: "重なりの影" }, { h: 40, s: 24, l: 88, name: "乾いた生成り" },
    ], toneBias: ["p", "ltg"], matte: true, technique: "カマイユ配色" },
  { match: ["mimosa flower", "ミモザ"], ja: "ミモザ", story: "春を告げる黄の粒",
    anchors: [
      { h: 48, s: 84, l: 64, name: "ミモザの黄" }, { h: 52, s: 60, l: 80, name: "ほどけた淡黄" },
      { h: 96, s: 16, l: 56, name: "銀葉アカシア" }, { h: 200, s: 30, l: 82, name: "春の空" },
    ], toneBias: ["b", "lt"], technique: "ドミナントカラー配色" },
  { match: ["anemone", "アネモネ"], ja: "アネモネ", story: "黒い芯と濃い花弁",
    anchors: [
      { h: 276, s: 44, l: 46, name: "アネモネの紫" }, { h: 30, s: 10, l: 14, name: "黒い芯" },
      { h: 352, s: 62, l: 52, name: "赤の品種" }, { h: 44, s: 22, l: 92, name: "白の品種" },
    ], toneBias: ["v", "dk"], technique: "セパレーション" },
  { match: ["ranunculus", "ラナンキュラス"], ja: "ラナンキュラス", story: "薄紙を重ねたよう",
    anchors: [
      { h: 32, s: 62, l: 74, name: "杏色の花弁" }, { h: 44, s: 56, l: 86, name: "外側の淡黄" },
      { h: 348, s: 40, l: 68, name: "紅の品種" }, { h: 110, s: 28, l: 40, name: "茎の緑" },
    ], toneBias: ["lt", "p"], technique: "トーンのグラデーション" },
  { match: ["clematis", "クレマチス", "鉄線"], ja: "クレマチス", story: "つるに咲く星形",
    anchors: [
      { h: 268, s: 40, l: 52, name: "クレマチスの紫" }, { h: 280, s: 26, l: 80, name: "淡い覆輪" },
      { h: 46, s: 58, l: 66, name: "しべの黄" }, { h: 120, s: 30, l: 30, name: "つるの緑" },
    ], toneBias: ["dp", "p"], technique: "トーン・オン・トーン配色" },

  // ===== 二十四節気 =====
  // 暦がとらえた季節の刻み。日本の色彩文化そのもの。
  { match: ["keichitsu", "啓蟄"], ja: "啓蟄", story: "土がゆるみ、虫が出てくる",
    anchors: [
      { h: 32, s: 30, l: 40, name: "ゆるむ土" }, { h: 86, s: 42, l: 54, name: "萌えはじめ" },
      { h: 200, s: 26, l: 78, name: "ぬるむ空" }, { h: 44, s: 24, l: 86, name: "薄日" },
    ], toneBias: ["sf", "lt"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["seimei", "清明"], ja: "清明", story: "すべてが清らかに明るい",
    anchors: [
      { h: 92, s: 50, l: 58, name: "洗われた若葉" }, { h: 198, s: 46, l: 76, name: "澄んだ空" },
      { h: 344, s: 34, l: 86, name: "遅桜" }, { h: 44, s: 22, l: 94, name: "光の白" },
    ], toneBias: ["lt", "b"], technique: "ナチュラルハーモニー" },
  { match: ["shoman", "小満"], ja: "小満", story: "草木が満ちてくる",
    anchors: [
      { h: 104, s: 48, l: 44, name: "満ちる緑" }, { h: 80, s: 52, l: 62, name: "伸びる黄緑" },
      { h: 46, s: 50, l: 74, name: "麦の色づき" }, { h: 200, s: 40, l: 70, name: "初夏の空" },
    ], toneBias: ["b", "s"], technique: "類似色相配色" },
  { match: ["boshu", "芒種"], ja: "芒種", story: "穂の出る穀物を蒔くころ",
    anchors: [
      { h: 74, s: 44, l: 48, name: "苗の緑" }, { h: 196, s: 20, l: 66, name: "田の水鏡" },
      { h: 44, s: 40, l: 66, name: "芒の淡黄" }, { h: 214, s: 14, l: 46, name: "梅雨の入り" },
    ], toneBias: ["sf", "d"], matte: true },
  { match: ["shosho hot", "小暑"], ja: "小暑", story: "暑さが本気になる手前",
    anchors: [
      { h: 48, s: 72, l: 66, name: "強まる陽" }, { h: 130, s: 44, l: 40, name: "濃くなる葉" },
      { h: 198, s: 52, l: 72, name: "入道雲の下" }, { h: 42, s: 20, l: 94, name: "白い光" },
    ], toneBias: ["b", "v"], technique: "対照色相配色" },
  { match: ["taisho heat", "大暑"], ja: "大暑", story: "一年でいちばん暑い",
    anchors: [
      { h: 46, s: 86, l: 58, name: "灼ける陽" }, { h: 14, s: 68, l: 52, name: "陽炎の赤" },
      { h: 150, s: 40, l: 28, name: "濃い木陰" }, { h: 200, s: 40, l: 88, name: "白む空" },
    ], toneBias: ["v", "s"], technique: "対照トーン配色" },
  { match: ["shosho calm", "処暑"], ja: "処暑", story: "暑さがおさまる",
    anchors: [
      { h: 40, s: 52, l: 66, name: "やわらぐ陽" }, { h: 108, s: 30, l: 42, name: "疲れた緑" },
      { h: 24, s: 46, l: 74, name: "夕の淡橙" }, { h: 210, s: 24, l: 62, name: "涼しさの兆し" },
    ], toneBias: ["sf", "ltg"], matte: true, technique: "トーナル配色" },
  { match: ["kanro", "寒露"], ja: "寒露", story: "露が冷たくなる",
    anchors: [
      { h: 200, s: 20, l: 76, name: "冷えた露" }, { h: 38, s: 52, l: 54, name: "色づく葉" },
      { h: 268, s: 22, l: 50, name: "深まる影" }, { h: 44, s: 30, l: 86, name: "澄んだ朝" },
    ], toneBias: ["ltg", "d"], matte: true, technique: "トーナル配色" },
  { match: ["soko", "霜降"], ja: "霜降", story: "はじめて霜が降りる",
    anchors: [
      { h: 200, s: 12, l: 88, name: "霜の白" }, { h: 26, s: 46, l: 44, name: "枯れゆく褐" },
      { h: 14, s: 56, l: 48, name: "最後の紅葉" }, { h: 214, s: 14, l: 40, name: "冷えた土" },
    ], toneBias: ["ltg", "d"], matte: true, technique: "対照トーン配色" },
  { match: ["shokan", "小寒"], ja: "小寒", story: "寒の入り",
    anchors: [
      { h: 210, s: 18, l: 84, name: "薄氷" }, { h: 220, s: 22, l: 44, name: "澄んだ寒気" },
      { h: 30, s: 20, l: 30, name: "裸木" }, { h: 42, s: 16, l: 94, name: "冬の光" },
    ], toneBias: ["p", "dkg"], matte: true, technique: "カマイユ配色" },
  { match: ["daikan", "大寒"], ja: "大寒", story: "一年でいちばん寒い",
    anchors: [
      { h: 214, s: 26, l: 34, name: "凍てつく藍" }, { h: 200, s: 16, l: 92, name: "凍った白" },
      { h: 220, s: 12, l: 62, name: "鈍い雲" }, { h: 350, s: 40, l: 44, name: "寒紅梅" },
    ], toneBias: ["dkg", "p"], matte: true, technique: "対照トーン配色" },

  // ===== 和の文様 =====
  // 繰り返しの文様は、配色技法の「リピテーション」そのもの。
  { match: ["asanoha", "麻の葉"], ja: "麻の葉", story: "六角に組んだ幾何",
    anchors: [
      { h: 216, s: 44, l: 32, name: "藍の線" }, { h: 44, s: 26, l: 90, name: "地の生成り" },
      { h: 6, s: 56, l: 48, name: "差しの朱" }, { h: 150, s: 24, l: 44, name: "青竹の緑" },
    ], toneBias: ["dp", "p"], matte: true, technique: "リピテーション配色" },
  { match: ["kikko", "亀甲"], ja: "亀甲", story: "六角を継いだ長寿の文",
    anchors: [
      { h: 42, s: 30, l: 88, name: "地の白茶" }, { h: 30, s: 26, l: 34, name: "格子の焦茶" },
      { h: 44, s: 56, l: 58, name: "金の縁" }, { h: 140, s: 22, l: 38, name: "松の緑" },
    ], toneBias: ["ltg", "dk"], matte: true, technique: "リピテーション配色" },
  { match: ["uroko", "鱗文", "鱗"], ja: "鱗", story: "三角の繰り返し",
    anchors: [
      { h: 30, s: 10, l: 18, name: "墨の三角" }, { h: 42, s: 24, l: 92, name: "地の白" },
      { h: 4, s: 54, l: 46, name: "朱の三角" }, { h: 210, s: 8, l: 58, name: "銀鼠" },
    ], toneBias: ["dkg", "p"], matte: true, technique: "セパレーション" },
  { match: ["ajiro", "網代"], ja: "網代", story: "編み目の斜め",
    anchors: [
      { h: 36, s: 34, l: 66, name: "竹の膚" }, { h: 30, s: 30, l: 42, name: "編みの影" },
      { h: 44, s: 26, l: 86, name: "白竹" }, { h: 24, s: 24, l: 26, name: "煤竹" },
    ], toneBias: ["sf", "d"], matte: true, technique: "同一色相配色" },
  { match: ["sayagata", "紗綾形"], ja: "紗綾形", story: "卍を崩して繋げた地文",
    anchors: [
      { h: 42, s: 24, l: 92, name: "地の白綾" }, { h: 40, s: 26, l: 78, name: "織りの陰" },
      { h: 300, s: 22, l: 42, name: "紫の織り" }, { h: 44, s: 50, l: 62, name: "金糸" },
    ], toneBias: ["p", "ltg"], sparkle: true, technique: "カマイユ配色" },
  { match: ["kanoko", "鹿の子絞り", "鹿の子文"], ja: "鹿の子", story: "絞りの粒が並ぶ",
    anchors: [
      { h: 350, s: 52, l: 46, name: "絞りの紅" }, { h: 44, s: 28, l: 92, name: "括りの白" },
      { h: 340, s: 34, l: 68, name: "滲みのうす紅" }, { h: 30, s: 16, l: 24, name: "墨の縁" },
    ], toneBias: ["dp", "p"], matte: true, technique: "リピテーション配色" },
  { match: ["jade", "翡翠", "ひすい"], ja: "翡翠", story: "半透明にひそむ緑",
    anchors: [
      { h: 152, s: 34, l: 52, name: "翡翠の緑" },
      { h: 146, s: 22, l: 76, name: "白翡翠の透け" },
      { h: 160, s: 40, l: 30, name: "深みの碧" },
      { h: 40, s: 20, l: 90, name: "磨きの照り" },
    ], toneBias: ["sf", "dp"], sparkle: true, technique: "トーン・オン・トーン配色" },
  // ===== 世界の都市 =====
  // 分類では「都市」で一括りになってしまう街に、固有の色を与える。
  { match: ["osaka", "大阪", "道頓堀"], ja: "大阪", story: "看板とネオンの過密",
    anchors: [
      { h: 26, s: 84, l: 54, name: "看板のネオン橙" }, { h: 214, s: 58, l: 40, name: "水路のコバルト" },
      { h: 356, s: 70, l: 48, name: "看板の赤" }, { h: 210, s: 8, l: 76, name: "水面のクローム" },
    ], toneBias: ["v", "dk"], sparkle: true, technique: "対照色相配色" },
  { match: ["singapore", "シンガポール", "マーライオン"], ja: "シンガポール", story: "熱帯の緑と硝子の塔",
    anchors: [
      { h: 152, s: 46, l: 38, name: "熱帯の濃緑" }, { h: 196, s: 44, l: 74, name: "硝子の反射" },
      { h: 42, s: 22, l: 94, name: "白い列柱" }, { h: 340, s: 52, l: 62, name: "ショップハウスの桃" },
    ], toneBias: ["b", "dp"], technique: "対照色相配色" },
  { match: ["ho chi minh", "ホーチミン", "サイゴン"], ja: "ホーチミン", story: "バイクの奔流と黄の壁",
    anchors: [
      { h: 44, s: 62, l: 66, name: "コロニアルの黄壁" }, { h: 8, s: 60, l: 44, name: "屋根の赤褐" },
      { h: 140, s: 34, l: 34, name: "街路樹の緑" }, { h: 30, s: 12, l: 26, name: "排気の陰" },
    ], toneBias: ["s", "d"], matte: true },
  { match: ["mumbai", "ムンバイ", "ボンベイ"], ja: "ムンバイ", story: "サリーの色が行き交う",
    anchors: [
      { h: 336, s: 68, l: 52, name: "サリーの紅紫" }, { h: 32, s: 82, l: 56, name: "サフランの橙" },
      { h: 176, s: 44, l: 40, name: "孔雀の青緑" }, { h: 40, s: 26, l: 84, name: "石造りの白茶" },
    ], toneBias: ["v", "s"], sparkle: true, technique: "リピテーション配色" },
  { match: ["jaipur", "ジャイプール", "ピンクシティ"], ja: "ジャイプール", story: "街ごと薔薇色に塗られた",
    anchors: [
      { h: 12, s: 52, l: 62, name: "ピンクシティの壁" }, { h: 20, s: 44, l: 40, name: "彫りの影" },
      { h: 44, s: 66, l: 58, name: "装飾の金" }, { h: 200, s: 34, l: 78, name: "乾いた空" },
    ], toneBias: ["sf", "s"], matte: true, technique: "ドミナントカラー配色" },
  { match: ["delhi", "デリー", "ニューデリー"], ja: "デリー", story: "赤砂岩と白大理石",
    anchors: [
      { h: 10, s: 48, l: 44, name: "赤砂岩" }, { h: 40, s: 14, l: 90, name: "白大理石" },
      { h: 44, s: 60, l: 56, name: "尖塔の金" }, { h: 130, s: 26, l: 32, name: "庭園の緑" },
    ], toneBias: ["dp", "p"], matte: true, technique: "セパレーション" },
  { match: ["dubai", "ドバイ"], ja: "ドバイ", story: "砂漠に立つ硝子と金",
    anchors: [
      { h: 40, s: 54, l: 72, name: "砂の金" }, { h: 46, s: 70, l: 56, name: "装飾の金" },
      { h: 200, s: 48, l: 64, name: "硝子の空色" }, { h: 220, s: 30, l: 22, name: "夜の紺" },
    ], toneBias: ["b", "dk"], sparkle: true, technique: "セパレーション" },
  { match: ["berlin", "ベルリン"], ja: "ベルリン", story: "コンクリートと落書き",
    anchors: [
      { h: 210, s: 6, l: 58, name: "コンクリートの灰" }, { h: 356, s: 66, l: 48, name: "落書きの赤" },
      { h: 168, s: 48, l: 46, name: "落書きの青緑" }, { h: 30, s: 10, l: 18, name: "夜の黒" },
    ], toneBias: ["d", "v"], matte: true, technique: "セパレーション" },
  { match: ["cairo", "カイロ"], ja: "カイロ", story: "砂に埋もれた黄土の街",
    anchors: [
      { h: 38, s: 42, l: 64, name: "砂まじりの黄土" }, { h: 26, s: 34, l: 38, name: "日陰の褐" },
      { h: 186, s: 46, l: 48, name: "モスクのターコイズ" }, { h: 44, s: 58, l: 60, name: "細工の金" },
    ], toneBias: ["d", "sf"], matte: true },
  { match: ["cape town", "ケープタウン"], ja: "ケープタウン", story: "テーブルマウンテンと大西洋",
    anchors: [
      { h: 208, s: 52, l: 42, name: "大西洋の青" }, { h: 30, s: 26, l: 46, name: "山肌の褐" },
      { h: 46, s: 68, l: 66, name: "ボカープの家" }, { h: 150, s: 32, l: 40, name: "フィンボスの緑" },
    ], toneBias: ["b", "dp"], technique: "対照色相配色" },
  { match: ["nairobi", "ナイロビ"], ja: "ナイロビ", story: "高原の街とアカシア",
    anchors: [
      { h: 96, s: 32, l: 40, name: "高原の緑" }, { h: 22, s: 44, l: 40, name: "赤い土" },
      { h: 44, s: 54, l: 62, name: "乾いた草" }, { h: 200, s: 42, l: 74, name: "高地の空" },
    ], toneBias: ["sf", "d"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["los angeles", "ロサンゼルス", "ロス"], ja: "ロサンゼルス", story: "椰子とパステルの陽射し",
    anchors: [
      { h: 26, s: 72, l: 72, name: "夕陽のピーチ" }, { h: 190, s: 46, l: 72, name: "プールの水色" },
      { h: 96, s: 26, l: 46, name: "椰子の緑" }, { h: 40, s: 30, l: 90, name: "漆喰の白" },
    ], toneBias: ["lt", "b"], technique: "トーン・オン・トーン配色" },
  { match: ["new orleans", "ニューオーリンズ"], ja: "ニューオーリンズ", story: "鉄柵と真鍮の音楽",
    anchors: [
      { h: 274, s: 40, l: 40, name: "祭りの紫" }, { h: 46, s: 70, l: 56, name: "真鍮の金" },
      { h: 140, s: 42, l: 34, name: "深い緑" }, { h: 30, s: 8, l: 20, name: "錬鉄の黒" },
    ], toneBias: ["dp", "v"], sparkle: true, technique: "セパレーション" },
  { match: ["miami", "マイアミ"], ja: "マイアミ", story: "アールデコのパステル",
    anchors: [
      { h: 336, s: 62, l: 76, name: "アールデコの桃" }, { h: 180, s: 52, l: 70, name: "ミントの水色" },
      { h: 48, s: 74, l: 74, name: "淡いバター" }, { h: 200, s: 56, l: 48, name: "海の青" },
    ], toneBias: ["lt", "p"], technique: "リピテーション配色" },
  { match: ["buenos aires", "ブエノスアイレス"], ja: "ブエノスアイレス", story: "ボカの原色とタンゴ",
    anchors: [
      { h: 200, s: 62, l: 52, name: "ボカの青" }, { h: 48, s: 82, l: 58, name: "ボカの黄" },
      { h: 354, s: 62, l: 42, name: "タンゴの紅" }, { h: 30, s: 10, l: 18, name: "夜の黒" },
    ], toneBias: ["v", "dk"], technique: "リピテーション配色" },
  { match: ["lima", "リマ"], ja: "リマ", story: "灰色の空と土の壁",
    anchors: [
      { h: 210, s: 8, l: 66, name: "曇りの灰" }, { h: 28, s: 38, l: 50, name: "アドベの土壁" },
      { h: 200, s: 40, l: 44, name: "太平洋の青" }, { h: 12, s: 56, l: 46, name: "織物の茜" },
    ], toneBias: ["ltg", "d"], matte: true, technique: "トーナル配色" },
  { match: ["hong kong", "香港", "ホンコン"], ja: "香港", story: "看板が空を覆う",
    anchors: [
      { h: 356, s: 72, l: 46, name: "看板の紅" }, { h: 46, s: 76, l: 58, name: "看板の金" },
      { h: 168, s: 52, l: 40, name: "翡翠の緑" }, { h: 218, s: 34, l: 20, name: "夜の谷間" },
    ], toneBias: ["v", "dk"], sparkle: true, technique: "セパレーション" },
  { match: ["taipei", "台北"], ja: "台北", story: "夜市の灯と廟の煙",
    anchors: [
      { h: 40, s: 74, l: 60, name: "夜市の裸電球" }, { h: 4, s: 66, l: 44, name: "廟の朱" },
      { h: 120, s: 26, l: 30, name: "山の緑" }, { h: 30, s: 10, l: 22, name: "湿った夜" },
    ], toneBias: ["s", "dk"], technique: "対照色相配色" },
  { match: ["hanoi", "ハノイ"], ja: "ハノイ", story: "苔むした黄の壁",
    anchors: [
      { h: 44, s: 52, l: 62, name: "古い黄壁" }, { h: 100, s: 24, l: 36, name: "壁の苔" },
      { h: 6, s: 56, l: 42, name: "祠の朱" }, { h: 200, s: 12, l: 74, name: "湖の靄" },
    ], toneBias: ["d", "sf"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["rome", "ローマ"], ja: "ローマ", story: "赤黄土と石畳",
    anchors: [
      { h: 24, s: 46, l: 52, name: "ローマの黄土" }, { h: 12, s: 44, l: 40, name: "煉瓦の赤" },
      { h: 40, s: 16, l: 84, name: "大理石の白" }, { h: 120, s: 22, l: 28, name: "糸杉の影" },
    ], toneBias: ["d", "dp"], matte: true, technique: "ドミナントカラー配色" },
  { match: ["milan", "ミラノ"], ja: "ミラノ", story: "灰と黒の端正",
    anchors: [
      { h: 210, s: 6, l: 62, name: "都会の灰" }, { h: 30, s: 8, l: 16, name: "モードの黒" },
      { h: 40, s: 20, l: 90, name: "大聖堂の白" }, { h: 344, s: 44, l: 38, name: "差しの臙脂" },
    ], toneBias: ["dkg", "ltg"], matte: true, technique: "対照トーン配色" },
  { match: ["florence", "フィレンツェ"], ja: "フィレンツェ", story: "テラコッタの屋根が続く",
    anchors: [
      { h: 18, s: 48, l: 46, name: "屋根のテラコッタ" }, { h: 40, s: 22, l: 78, name: "漆喰の生成り" },
      { h: 150, s: 26, l: 32, name: "大聖堂の緑大理石" }, { h: 44, s: 56, l: 58, name: "細工の金" },
    ], toneBias: ["d", "sf"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["barcelona", "バルセロナ", "ガウディ"], ja: "バルセロナ", story: "砕いたタイルの曲線",
    anchors: [
      { h: 190, s: 56, l: 56, name: "タイルの青緑" }, { h: 44, s: 76, l: 60, name: "タイルの黄" },
      { h: 348, s: 58, l: 54, name: "タイルの紅" }, { h: 40, s: 24, l: 88, name: "目地の白" },
    ], toneBias: ["v", "b"], technique: "リピテーション配色" },
  { match: ["copenhagen", "コペンハーゲン", "ニューハウン"], ja: "コペンハーゲン", story: "運河沿いの色違いの家",
    anchors: [
      { h: 12, s: 58, l: 48, name: "運河の家の赤" }, { h: 44, s: 66, l: 62, name: "運河の家の黄" },
      { h: 206, s: 42, l: 44, name: "運河の水" }, { h: 40, s: 20, l: 90, name: "白い窓枠" },
    ], toneBias: ["s", "b"], technique: "リピテーション配色" },
  { match: ["stockholm", "ストックホルム", "ガムラスタン"], ja: "ストックホルム", story: "黄土色の旧市街と水",
    anchors: [
      { h: 36, s: 50, l: 58, name: "旧市街の黄土" }, { h: 14, s: 44, l: 42, name: "煉瓦の赤" },
      { h: 206, s: 26, l: 56, name: "冷たい水面" }, { h: 40, s: 18, l: 88, name: "北の白" },
    ], toneBias: ["sf", "ltg"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["athens", "アテネ"], ja: "アテネ", story: "白い石と乾いた空",
    anchors: [
      { h: 42, s: 16, l: 92, name: "大理石の白" }, { h: 202, s: 58, l: 56, name: "エーゲの青" },
      { h: 40, s: 30, l: 66, name: "乾いた石の黄" }, { h: 96, s: 20, l: 44, name: "オリーブの緑" },
    ], toneBias: ["p", "b"], technique: "セパレーション" },
  { match: ["havana", "ハバナ"], ja: "ハバナ", story: "褪せたパステルと旧車",
    anchors: [
      { h: 180, s: 44, l: 62, name: "旧車のミント" }, { h: 30, s: 52, l: 70, name: "褪せた杏の壁" },
      { h: 348, s: 52, l: 52, name: "旧車の紅" }, { h: 44, s: 26, l: 88, name: "剥げた白" },
    ], toneBias: ["lt", "sf"], matte: true, technique: "リピテーション配色" },
  { match: ["rio", "リオデジャネイロ", "リオ"], ja: "リオデジャネイロ", story: "山と海と歩道の波形",
    anchors: [
      { h: 140, s: 52, l: 34, name: "山の濃緑" }, { h: 196, s: 56, l: 56, name: "湾の青" },
      { h: 44, s: 76, l: 62, name: "陽の黄" }, { h: 30, s: 12, l: 22, name: "歩道の黒石" },
    ], toneBias: ["v", "dp"], technique: "対照色相配色" },
  { match: ["sydney", "シドニー"], ja: "シドニー", story: "帆の白と港の青",
    anchors: [
      { h: 42, s: 16, l: 94, name: "帆の白" }, { h: 204, s: 58, l: 48, name: "港の青" },
      { h: 120, s: 16, l: 52, name: "ユーカリの銀緑" }, { h: 26, s: 48, l: 62, name: "砂の色" },
    ], toneBias: ["b", "p"], technique: "セパレーション" },
  { match: ["melbourne", "メルボルン"], ja: "メルボルン", story: "路地の壁画と珈琲",
    anchors: [
      { h: 30, s: 10, l: 22, name: "路地の煤" }, { h: 340, s: 62, l: 54, name: "壁画の紅" },
      { h: 180, s: 48, l: 48, name: "壁画の青緑" }, { h: 28, s: 38, l: 34, name: "深煎りの珈琲" },
    ], toneBias: ["dk", "v"], matte: true, technique: "セパレーション" },
  // ===== 気分・印象 =====
  // PCCSのトーンが持つイメージ語と地続きの言葉。
  // 講座で扱う「トーンの感情効果」を、そのまま入力にできるように。
  { match: ["calm", "穏やか", "おだやか"], ja: "穏やか", story: "波立たない時間",
    anchors: [
      { h: 168, s: 22, l: 74, name: "凪の淡緑" }, { h: 200, s: 20, l: 80, name: "薄い水色" },
      { h: 40, s: 22, l: 88, name: "生成りの白" }, { h: 120, s: 16, l: 58, name: "遠い草の緑" },
    ], toneBias: ["ltg", "p"], matte: true, technique: "トーナル配色" },
  { match: ["romantic", "ロマンチック", "ロマンティック"], ja: "ロマンチック", story: "甘さを隠さない",
    anchors: [
      { h: 344, s: 52, l: 82, name: "うす紅" }, { h: 288, s: 32, l: 80, name: "藤のかすみ" },
      { h: 44, s: 40, l: 92, name: "クリーム" }, { h: 350, s: 46, l: 62, name: "深まる薔薇" },
    ], toneBias: ["p", "lt"], sparkle: true, technique: "ドミナントトーン配色" },
  { match: ["happy", "ハッピー", "しあわせ"], ja: "ハッピー", story: "跳ねている色",
    anchors: [
      { h: 48, s: 84, l: 66, name: "弾む黄" }, { h: 12, s: 78, l: 64, name: "陽気な橙" },
      { h: 190, s: 60, l: 68, name: "軽い水色" }, { h: 330, s: 62, l: 74, name: "浮かれた桃" },
    ], toneBias: ["b", "v"], technique: "リピテーション配色" },
  { match: ["mysterious", "ミステリアス", "神秘的"], ja: "ミステリアス", story: "底が見えない",
    anchors: [
      { h: 268, s: 40, l: 30, name: "深い紫" }, { h: 218, s: 46, l: 22, name: "夜の藍" },
      { h: 160, s: 34, l: 34, name: "沈んだ青緑" }, { h: 44, s: 44, l: 60, name: "ひとすじの金" },
    ], toneBias: ["dk", "dp"], sparkle: true, technique: "ドミナントトーン配色" },
  { match: ["powerful", "力強い", "パワフル"], ja: "力強い", story: "押し出しの強さ",
    anchors: [
      { h: 356, s: 78, l: 46, name: "押し出す赤" }, { h: 30, s: 10, l: 14, name: "揺るがない黒" },
      { h: 44, s: 82, l: 56, name: "打ち鳴らす黄" }, { h: 214, s: 62, l: 38, name: "支える青" },
    ], toneBias: ["v", "dk"], technique: "対照トーン配色" },
  { match: ["elegant", "エレガント", "上品"], ja: "エレガント", story: "声を張らない美しさ",
    anchors: [
      { h: 300, s: 18, l: 76, name: "淡い藤鼠" }, { h: 40, s: 20, l: 90, name: "象牙" },
      { h: 340, s: 22, l: 62, name: "灰みの薔薇" }, { h: 250, s: 20, l: 42, name: "沈めた青紫" },
    ], toneBias: ["ltg", "p"], sparkle: true, technique: "トーン・オン・トーン配色" },
  { match: ["luxury", "ラグジュアリー", "豪奢"], ja: "ラグジュアリー", story: "惜しまない厚み",
    anchors: [
      { h: 44, s: 62, l: 52, name: "重い金" }, { h: 30, s: 14, l: 12, name: "漆黒" },
      { h: 340, s: 44, l: 24, name: "深いボルドー" }, { h: 160, s: 40, l: 24, name: "濃い翠" },
    ], toneBias: ["dk", "dp"], sparkle: true, technique: "ドミナントトーン配色" },
  { match: ["playful", "遊び心", "あそび心"], ja: "遊び心", story: "少し外してみる",
    anchors: [
      { h: 176, s: 58, l: 58, name: "はずみの青緑" }, { h: 38, s: 80, l: 62, name: "はずみの橙" },
      { h: 316, s: 52, l: 68, name: "はずみの紅紫" }, { h: 44, s: 24, l: 92, name: "間の白" },
    ], toneBias: ["b", "v"], technique: "セパレーション" },
  { match: ["serene", "静謐", "せいひつ"], ja: "静謐", story: "満たされた静けさ",
    anchors: [
      { h: 200, s: 14, l: 86, name: "澄んだ白" }, { h: 190, s: 20, l: 62, name: "薄い水の色" },
      { h: 120, s: 12, l: 46, name: "沈んだ緑" }, { h: 220, s: 16, l: 30, name: "奥の藍" },
    ], toneBias: ["p", "g"], matte: true, technique: "トーンのグラデーション" },
  { match: ["bold", "大胆", "だいたん"], ja: "大胆", story: "ためらいの跡がない",
    anchors: [
      { h: 350, s: 80, l: 50, name: "断ち切る赤" }, { h: 190, s: 74, l: 46, name: "抜ける青" },
      { h: 48, s: 88, l: 58, name: "叫ぶ黄" }, { h: 30, s: 10, l: 12, name: "受ける黒" },
    ], toneBias: ["v", "dk"], technique: "対照色相配色" },
  { match: ["refined", "洗練", "せんれん"], ja: "洗練", story: "削って残ったもの",
    anchors: [
      { h: 210, s: 6, l: 82, name: "灰白" }, { h: 30, s: 8, l: 20, name: "締める黒" },
      { h: 40, s: 14, l: 62, name: "中間の砂" }, { h: 200, s: 12, l: 44, name: "冷えた影" },
    ], toneBias: ["ltg", "dkg"], matte: true, technique: "トーンのグラデーション" },
  { match: ["warm", "温かい", "あたたかい"], ja: "温かい", story: "手のひらの側の色",
    anchors: [
      { h: 28, s: 56, l: 72, name: "灯りの杏" }, { h: 42, s: 52, l: 84, name: "ミルクの黄" },
      { h: 16, s: 44, l: 52, name: "焼けた土" }, { h: 40, s: 30, l: 92, name: "生成り" },
    ], toneBias: ["lt", "sf"], matte: true, technique: "ドミナントカラー配色" },
  { match: ["cool", "クール", "涼しげ"], ja: "クール", story: "体温を下げる側",
    anchors: [
      { h: 200, s: 44, l: 62, name: "冷たい水色" }, { h: 220, s: 40, l: 38, name: "硬い藍" },
      { h: 180, s: 26, l: 78, name: "薄氷" }, { h: 210, s: 8, l: 50, name: "鋼の灰" },
    ], toneBias: ["lt", "dp"], technique: "類似色相配色" },
  { match: ["cozy", "居心地のよい", "居心地", "ぬくもりの部屋"], ja: "居心地のよい", story: "帰ってきたときの色",
    anchors: [
      { h: 26, s: 34, l: 58, name: "使い込んだ木" }, { h: 40, s: 34, l: 84, name: "毛布の生成り" },
      { h: 14, s: 40, l: 40, name: "煉瓦の暖炉" }, { h: 100, s: 18, l: 44, name: "鉢植えの緑" },
    ], toneBias: ["sf", "d"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["rebellious", "反骨", "はんこつ"], ja: "反骨", story: "従わない色",
    anchors: [
      { h: 30, s: 10, l: 12, name: "黒" }, { h: 354, s: 76, l: 48, name: "叛旗の赤" },
      { h: 74, s: 72, l: 56, name: "毒の黄緑" }, { h: 210, s: 6, l: 74, name: "鋲のクローム" },
    ], toneBias: ["dk", "v"], technique: "セパレーション" },
  { match: ["spiritual", "スピリチュアル", "霊性"], ja: "スピリチュアル", story: "こことは違う場所へ",
    anchors: [
      { h: 272, s: 36, l: 56, name: "紫の光" }, { h: 44, s: 48, l: 76, name: "淡い金" },
      { h: 200, s: 24, l: 88, name: "白い靄" }, { h: 232, s: 34, l: 30, name: "深い夜" },
    ], toneBias: ["p", "dp"], sparkle: true, technique: "トーン・オン・トーン配色" },
  { match: ["earthy", "アーシー", "土の匂い"], ja: "アーシー", story: "土から離れない色",
    anchors: [
      { h: 28, s: 34, l: 42, name: "湿った土" }, { h: 60, s: 22, l: 44, name: "枯れた草" },
      { h: 20, s: 40, l: 62, name: "赤土" }, { h: 40, s: 20, l: 78, name: "乾いた砂" },
    ], toneBias: ["d", "sf"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["feminine", "フェミニン"], ja: "フェミニン", story: "やわらかさを選ぶ",
    anchors: [
      { h: 344, s: 46, l: 84, name: "淡い薔薇" }, { h: 30, s: 40, l: 88, name: "肌の生成り" },
      { h: 300, s: 26, l: 78, name: "うすい藤" }, { h: 356, s: 38, l: 60, name: "芯の紅" },
    ], toneBias: ["p", "lt"], technique: "ドミナントトーン配色" },
  { match: ["masculine", "マスキュリン"], ja: "マスキュリン", story: "硬さを選ぶ",
    anchors: [
      { h: 220, s: 30, l: 26, name: "濃紺" }, { h: 30, s: 8, l: 18, name: "炭" },
      { h: 26, s: 26, l: 40, name: "革の褐" }, { h: 210, s: 8, l: 60, name: "鋼の灰" },
    ], toneBias: ["dkg", "dk"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["cute", "かわいい", "カワイイ"], ja: "かわいい", story: "ためらいなく甘い",
    anchors: [
      { h: 338, s: 68, l: 80, name: "砂糖菓子の桃" }, { h: 190, s: 56, l: 80, name: "水色のリボン" },
      { h: 50, s: 74, l: 82, name: "クリームの黄" }, { h: 278, s: 40, l: 80, name: "淡い藤" },
    ], toneBias: ["p", "lt"], sparkle: true, technique: "リピテーション配色" },
  { match: ["mature", "大人っぽい", "大人びた"], ja: "大人っぽい", story: "彩度を落とした余裕",
    anchors: [
      { h: 350, s: 26, l: 34, name: "沈めた臙脂" }, { h: 210, s: 10, l: 46, name: "灰青" },
      { h: 34, s: 20, l: 68, name: "落ち着いた砂" }, { h: 30, s: 10, l: 16, name: "締めの黒" },
    ], toneBias: ["d", "dk"], matte: true, technique: "トーナル配色" },
  { match: ["dramatic", "ドラマチック", "ドラマティック"], ja: "ドラマチック", story: "光と影の落差",
    anchors: [
      { h: 348, s: 66, l: 38, name: "幕の深紅" }, { h: 30, s: 8, l: 10, name: "闇" },
      { h: 46, s: 68, l: 62, name: "当たる光" }, { h: 262, s: 38, l: 30, name: "袖の紫" },
    ], toneBias: ["dk", "v"], sparkle: true, technique: "対照トーン配色" },
  { match: ["peaceful", "平和", "へいわ"], ja: "平和", story: "争いのない淡さ",
    anchors: [
      { h: 200, s: 30, l: 84, name: "空の淡青" }, { h: 40, s: 20, l: 94, name: "旗の白" },
      { h: 116, s: 26, l: 66, name: "若草" }, { h: 46, s: 44, l: 82, name: "陽だまり" },
    ], toneBias: ["p", "lt"], matte: true, technique: "トーナル配色" },
  { match: ["fresh air", "爽やか", "さわやか"], ja: "爽やか", story: "風の通る色",
    anchors: [
      { h: 186, s: 54, l: 68, name: "抜ける水色" }, { h: 92, s: 46, l: 62, name: "若葉の黄緑" },
      { h: 40, s: 18, l: 95, name: "白い光" }, { h: 208, s: 44, l: 50, name: "澄んだ青" },
    ], toneBias: ["b", "lt"], technique: "類似色相配色" },
  { match: ["sweet", "スイート", "甘い"], ja: "スイート", story: "菓子のような色",
    anchors: [
      { h: 348, s: 56, l: 82, name: "苺のクリーム" }, { h: 44, s: 62, l: 86, name: "バニラ" },
      { h: 26, s: 52, l: 76, name: "キャラメルの淡さ" }, { h: 158, s: 36, l: 78, name: "ミント" },
    ], toneBias: ["p", "lt"], technique: "ドミナントトーン配色" },
  { match: ["bittersweet", "ほろ苦い", "ほろにがい"], ja: "ほろ苦い", story: "甘さの奥の苦み",
    anchors: [
      { h: 26, s: 40, l: 30, name: "カカオの褐" }, { h: 40, s: 34, l: 72, name: "ミルクの淡さ" },
      { h: 96, s: 22, l: 38, name: "苦い緑" }, { h: 352, s: 32, l: 46, name: "残る紅" },
    ], toneBias: ["dk", "sf"], matte: true, technique: "対照トーン配色" },
  { match: ["festive", "祝祭的", "祝祭"], ja: "祝祭的", story: "はれの日の色",
    anchors: [
      { h: 356, s: 72, l: 48, name: "祝いの紅" }, { h: 46, s: 74, l: 58, name: "祝いの金" },
      { h: 42, s: 22, l: 94, name: "晴れの白" }, { h: 150, s: 44, l: 36, name: "常磐の緑" },
    ], toneBias: ["v", "p"], sparkle: true, technique: "セパレーション" },
  { match: ["dark romantic", "ダークロマンティック", "ダークロマンチック"], ja: "ダークロマンティック", story: "甘さを闇で締める",
    anchors: [
      { h: 338, s: 40, l: 26, name: "闇の薔薇" }, { h: 30, s: 10, l: 12, name: "黒" },
      { h: 346, s: 34, l: 62, name: "褪せた紅" }, { h: 268, s: 30, l: 32, name: "沈む紫" },
    ], toneBias: ["dk", "dp"], sparkle: true, technique: "ドミナントトーン配色" },
  { match: ["meditative", "瞑想的", "瞑想"], ja: "瞑想的", story: "内へ向かう色",
    anchors: [
      { h: 40, s: 16, l: 80, name: "白砂" }, { h: 100, s: 14, l: 40, name: "苔の陰" },
      { h: 220, s: 14, l: 28, name: "沈んだ藍" }, { h: 34, s: 22, l: 60, name: "麻の膚" },
    ], toneBias: ["g", "ltg"], matte: true, technique: "トーナル配色" },
  { match: ["positive", "前向き", "まえむき"], ja: "前向き", story: "顔を上げた色",
    anchors: [
      { h: 44, s: 78, l: 64, name: "昇る黄" }, { h: 90, s: 48, l: 56, name: "伸びる黄緑" },
      { h: 198, s: 52, l: 72, name: "開けた空" }, { h: 22, s: 66, l: 66, name: "血の通う橙" },
    ], toneBias: ["b", "v"], technique: "ナチュラルハーモニー" },
  { match: ["intellectual", "知的", "ちてき"], ja: "知的", story: "整理された頭の中",
    anchors: [
      { h: 220, s: 42, l: 34, name: "紺" }, { h: 210, s: 10, l: 72, name: "紙の灰白" },
      { h: 30, s: 24, l: 40, name: "革の背表紙" }, { h: 158, s: 26, l: 34, name: "深い緑" },
    ], toneBias: ["dp", "ltg"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["whimsical", "空想的", "空想"], ja: "空想的", story: "現実からずれた色",
    anchors: [
      { h: 282, s: 44, l: 72, name: "空想の藤" }, { h: 176, s: 48, l: 72, name: "空想の青緑" },
      { h: 44, s: 66, l: 78, name: "空想の淡黄" }, { h: 330, s: 46, l: 74, name: "空想の桃" },
    ], toneBias: ["lt", "p"], sparkle: true, technique: "リピテーション配色" },
  // ===== 様式・スタイル =====
  // 「〜コア」の類は流行りものだが、色そのものははっきりしていて
  // 使いどころがある。古びても誤りにはならないので入れておく。
  // 構成主義の黒赤白と、未晒しの生成り。前衛は一色だけ外すところに宿るので、
  // 調和を崩す黄緑を入れてある。
  { match: ["avant-garde", "avantgarde", "アバンギャルド", "前衛"], ja: "アバンギャルド",
    story: "既成を断ち切る黒に、一色だけ外す",
    anchors: [
      { h: 240, s: 8, l: 10, name: "断ち切りの黒" },
      { h: 42, s: 20, l: 85, name: "晒さぬ生成り" },
      { h: 356, s: 76, l: 45, name: "宣言の赤" },
      { h: 74, s: 70, l: 56, name: "外した黄緑" },
    ], toneBias: ["dk", "v"], matte: true, technique: "セパレーション" },
  // Y2Kは水色と桃色のパステルだが、Y3Kはその先。
  // 液状の金属と虚空、油膜の虹。人の肌から離れていく側の未来。
  { match: ["y3k", "ワイスリーケー"], ja: "Y3K", story: "液状の銀と虚空、油膜が虹に割れる",
    anchors: [
      { h: 210, s: 8, l: 76, name: "液状の銀" },
      { h: 255, s: 25, l: 9, name: "虚空の黒" },
      { h: 292, s: 48, l: 52, name: "油膜の紫" },
      { h: 186, s: 82, l: 56, name: "紫外の閃光" },
    ], toneBias: ["p", "v", "dkg"], sparkle: true, technique: "対照トーン配色" },
  { match: ["quiet luxury", "クワイエットラグジュアリー", "静かな贅沢"], ja: "クワイエットラグジュアリー", story: "銘を見せない上等",
    anchors: [
      { h: 36, s: 18, l: 74, name: "上質な生成り" }, { h: 28, s: 16, l: 46, name: "深い駱駝" },
      { h: 30, s: 8, l: 22, name: "締めの炭" }, { h: 40, s: 12, l: 90, name: "絹の白" },
    ], toneBias: ["ltg", "d"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["old money", "オールドマネー"], ja: "オールドマネー", story: "受け継がれた紺と緑",
    anchors: [
      { h: 220, s: 40, l: 26, name: "受け継ぐ紺" }, { h: 150, s: 32, l: 26, name: "深い森" },
      { h: 40, s: 30, l: 84, name: "麻の生成り" }, { h: 350, s: 40, l: 34, name: "臙脂の差し" },
    ], toneBias: ["dk", "dp"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["cottagecore", "コテージコア"], ja: "コテージコア", story: "田舎家の慎ましさ",
    anchors: [
      { h: 40, s: 34, l: 86, name: "リネンの生成り" }, { h: 96, s: 26, l: 54, name: "菜園の緑" },
      { h: 344, s: 38, l: 78, name: "野薔薇のうす紅" }, { h: 30, s: 30, l: 48, name: "焼きたてのパン" },
    ], toneBias: ["p", "sf"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["dark academia", "ダークアカデミア"], ja: "ダークアカデミア", story: "古い書架と革の匂い",
    anchors: [
      { h: 26, s: 34, l: 26, name: "革の焦茶" }, { h: 150, s: 30, l: 22, name: "書架の深緑" },
      { h: 350, s: 40, l: 30, name: "オックスブラッド" }, { h: 40, s: 26, l: 78, name: "羊皮紙" },
    ], toneBias: ["dk", "dp"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["light academia", "ライトアカデミア"], ja: "ライトアカデミア", story: "陽の差す図書室",
    anchors: [
      { h: 40, s: 34, l: 88, name: "白い紙" }, { h: 32, s: 32, l: 68, name: "淡い木の棚" },
      { h: 44, s: 40, l: 78, name: "陽だまりの黄" }, { h: 100, s: 20, l: 52, name: "窓辺の緑" },
    ], toneBias: ["p", "ltg"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["dopamine dressing", "ドーパミンドレッシング"], ja: "ドーパミンドレッシング", story: "着て気分を上げる",
    anchors: [
      { h: 320, s: 76, l: 60, name: "跳ねるマゼンタ" }, { h: 48, s: 88, l: 60, name: "跳ねる黄" },
      { h: 176, s: 66, l: 52, name: "跳ねる青緑" }, { h: 22, s: 82, l: 58, name: "跳ねる橙" },
    ], toneBias: ["v", "b"], technique: "リピテーション配色" },
  { match: ["coastal", "コースタル", "海辺の暮らし"], ja: "コースタル", story: "潮に洗われた淡さ",
    anchors: [
      { h: 200, s: 34, l: 76, name: "潮の水色" }, { h: 40, s: 24, l: 92, name: "白い羽目板" },
      { h: 38, s: 30, l: 78, name: "流木の砂色" }, { h: 210, s: 30, l: 48, name: "沖の青" },
    ], toneBias: ["p", "lt"], matte: true, technique: "トーン・オン・トーン配色" },
  { match: ["boho", "ボーホー", "ボホ"], ja: "ボーホー", story: "重ねて混ぜる自由",
    anchors: [
      { h: 24, s: 46, l: 46, name: "テラコッタ" }, { h: 40, s: 36, l: 78, name: "生成りの綿" },
      { h: 172, s: 34, l: 42, name: "褪せた青緑" }, { h: 340, s: 34, l: 44, name: "沈めた紅紫" },
    ], toneBias: ["d", "sf"], matte: true, technique: "トーナル配色" },
  { match: ["kawaii style", "カワイイ文化"], ja: "カワイイ", story: "甘さを積み上げる",
    anchors: [
      { h: 336, s: 72, l: 78, name: "苺ミルクの桃" }, { h: 192, s: 60, l: 78, name: "空色のリボン" },
      { h: 52, s: 76, l: 80, name: "レモンクリーム" }, { h: 276, s: 44, l: 78, name: "淡い藤" },
    ], toneBias: ["p", "b"], sparkle: true, technique: "リピテーション配色" },
  { match: ["harajuku", "原宿"], ja: "原宿", story: "混ぜるほど正しい",
    anchors: [
      { h: 322, s: 78, l: 62, name: "原色のマゼンタ" }, { h: 172, s: 70, l: 52, name: "原色の青緑" },
      { h: 50, s: 88, l: 62, name: "原色の黄" }, { h: 30, s: 10, l: 14, name: "締めの黒" },
    ], toneBias: ["v", "dk"], technique: "セパレーション" },
  { match: ["shibuya kei", "渋谷系"], ja: "渋谷系", story: "洒落たレコードの棚",
    anchors: [
      { h: 350, s: 46, l: 66, name: "ジャケットの珊瑚" }, { h: 190, s: 44, l: 64, name: "淡い青緑" },
      { h: 44, s: 44, l: 84, name: "生成りの紙" }, { h: 26, s: 30, l: 32, name: "木の棚" },
    ], toneBias: ["sf", "lt"], matte: true, technique: "トーナル配色" },
  { match: ["city pop", "シティポップ"], ja: "シティポップ", story: "夜のドライブとネオン",
    anchors: [
      { h: 336, s: 62, l: 66, name: "ネオンの桃" }, { h: 202, s: 60, l: 56, name: "夜のシアン" },
      { h: 262, s: 44, l: 36, name: "暮れの紫" }, { h: 40, s: 60, l: 70, name: "テールランプの橙" },
    ], toneBias: ["b", "dp"], sparkle: true, technique: "対照色相配色" },
  { match: ["memphis", "メンフィス"], ja: "メンフィス", story: "80年代の幾何と原色",
    anchors: [
      { h: 340, s: 74, l: 62, name: "メンフィスの桃" }, { h: 186, s: 70, l: 54, name: "メンフィスの青緑" },
      { h: 48, s: 86, l: 60, name: "メンフィスの黄" }, { h: 30, s: 10, l: 14, name: "黒の線" },
    ], toneBias: ["v", "b"], technique: "セパレーション" },
  { match: ["art nouveau", "アールヌーヴォー", "アールヌーボー"], ja: "アールヌーヴォー", story: "植物の曲線と硝子",
    anchors: [
      { h: 96, s: 30, l: 44, name: "蔦の緑" }, { h: 36, s: 44, l: 60, name: "褪せた金茶" },
      { h: 286, s: 30, l: 54, name: "硝子の藤" }, { h: 40, s: 26, l: 86, name: "乳白硝子" },
    ], toneBias: ["sf", "d"], sparkle: true, technique: "ナチュラルハーモニー" },
  { match: ["midcentury", "ミッドセンチュリー"], ja: "ミッドセンチュリー", story: "チークとからし色",
    anchors: [
      { h: 40, s: 62, l: 52, name: "からし色" }, { h: 26, s: 40, l: 38, name: "チーク材" },
      { h: 170, s: 34, l: 44, name: "くすんだ青緑" }, { h: 16, s: 54, l: 48, name: "煉瓦の橙" },
    ], toneBias: ["d", "s"], matte: true, technique: "トーナル配色" },
  { match: ["industrial", "インダストリアル"], ja: "インダストリアル", story: "鉄と煉瓦とむき出し",
    anchors: [
      { h: 210, s: 8, l: 42, name: "鉄の灰" }, { h: 14, s: 40, l: 40, name: "煉瓦" },
      { h: 30, s: 8, l: 18, name: "配管の黒" }, { h: 36, s: 22, l: 70, name: "剥き出しの石膏" },
    ], toneBias: ["d", "dkg"], matte: true, technique: "トーナル配色" },
  { match: ["maximalism", "マキシマリズム", "マキシマル"], ja: "マキシマリズム", story: "余白を残さない",
    anchors: [
      { h: 330, s: 62, l: 46, name: "重ねる紅紫" }, { h: 160, s: 52, l: 34, name: "重ねる翠" },
      { h: 44, s: 74, l: 56, name: "重ねる金" }, { h: 262, s: 46, l: 40, name: "重ねる紫" },
    ], toneBias: ["dp", "v"], sparkle: true, technique: "リピテーション配色" },
  { match: ["punk", "パンク"], ja: "パンク", story: "破いて留める",
    anchors: [
      { h: 30, s: 10, l: 12, name: "革の黒" }, { h: 354, s: 78, l: 48, name: "叫びの赤" },
      { h: 76, s: 74, l: 56, name: "毒の黄緑" }, { h: 210, s: 6, l: 76, name: "鋲の銀" },
    ], toneBias: ["dk", "v"], technique: "セパレーション" },
  { match: ["preppy", "プレッピー"], ja: "プレッピー", story: "学校の紋章の色",
    anchors: [
      { h: 220, s: 44, l: 28, name: "ブレザーの紺" }, { h: 150, s: 34, l: 30, name: "芝の深緑" },
      { h: 348, s: 44, l: 36, name: "ネクタイの臙脂" }, { h: 46, s: 52, l: 84, name: "淡い黄のシャツ" },
    ], toneBias: ["dk", "p"], matte: true, technique: "セパレーション" },
  { match: ["street", "ストリート"], ja: "ストリート", story: "アスファルトと蛍光",
    anchors: [
      { h: 210, s: 6, l: 46, name: "アスファルト" }, { h: 84, s: 82, l: 58, name: "蛍光の黄緑" },
      { h: 30, s: 10, l: 14, name: "黒" }, { h: 356, s: 70, l: 50, name: "ロゴの赤" },
    ], toneBias: ["dkg", "v"], matte: true, technique: "対照トーン配色" },
  { match: ["resort", "リゾート"], ja: "リゾート", story: "白い服と海",
    anchors: [
      { h: 42, s: 20, l: 95, name: "白い麻" }, { h: 188, s: 58, l: 62, name: "遠浅の碧" },
      { h: 40, s: 44, l: 78, name: "陽に灼けた砂" }, { h: 130, s: 34, l: 40, name: "椰子の緑" },
    ], toneBias: ["b", "p"], technique: "セパレーション" },
  { match: ["moroccan", "モロッカン"], ja: "モロッカン", story: "タイルと香辛料",
    anchors: [
      { h: 196, s: 52, l: 44, name: "マジョレルの青" }, { h: 24, s: 62, l: 50, name: "香辛料の橙" },
      { h: 44, s: 62, l: 56, name: "真鍮のランプ" }, { h: 340, s: 40, l: 34, name: "絨毯の深紅" },
    ], toneBias: ["dp", "s"], sparkle: true, technique: "対照色相配色" },
  { match: ["wabi sabi", "侘び寂び", "侘寂", "わびさび"], ja: "侘び寂び", story: "欠けたものの美しさ",
    anchors: [
      { h: 36, s: 14, l: 70, name: "枯れた土壁" }, { h: 90, s: 12, l: 40, name: "沈んだ苔" },
      { h: 30, s: 10, l: 24, name: "煤けた黒" }, { h: 40, s: 20, l: 86, name: "褪せた生成り" },
    ], toneBias: ["g", "ltg"], matte: true, technique: "トーナル配色" },
  { match: ["balletcore", "バレエコア"], ja: "バレエコア", story: "稽古着のうす桃",
    anchors: [
      { h: 350, s: 40, l: 86, name: "トウシューズの桃" }, { h: 40, s: 26, l: 92, name: "チュールの白" },
      { h: 28, s: 28, l: 74, name: "タイツの肌色" }, { h: 340, s: 30, l: 58, name: "リボンの紅" },
    ], toneBias: ["p", "ltg"], matte: true, technique: "ドミナントトーン配色" },
  // ===== 美術・美術運動 =====
  // 作家名は「その人の公式色」ではなく、作品に繰り返し現れる色の傾向として扱う。
  { match: ["impressionism", "印象派", "印象主義"], ja: "印象派", story: "輪郭を溶かす戸外の光",
    anchors: [
      { h: 198, s: 42, l: 72, name: "戸外の空色" }, { h: 46, s: 62, l: 74, name: "陽のクロムイエロー" },
      { h: 284, s: 26, l: 66, name: "影のすみれ" }, { h: 118, s: 26, l: 52, name: "草叢の緑" },
    ], toneBias: ["lt", "sf"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["pop art", "ポップアート"], ja: "ポップアート", story: "印刷インキの四原色",
    anchors: [
      { h: 340, s: 82, l: 58, name: "マゼンタの網点" }, { h: 52, s: 88, l: 60, name: "イエローの網点" },
      { h: 200, s: 78, l: 50, name: "シアンの網点" }, { h: 30, s: 8, l: 14, name: "刷りの黒" },
    ], toneBias: ["v", "b"], technique: "セパレーション" },
  { match: ["cubism", "キュビスム", "立体派"], ja: "キュビスム", story: "面に割られた土の色",
    anchors: [
      { h: 34, s: 42, l: 46, name: "黄土" }, { h: 26, s: 26, l: 28, name: "焦茶の面" },
      { h: 40, s: 14, l: 72, name: "灰みの生成り" }, { h: 96, s: 16, l: 42, name: "沈んだ緑灰" },
    ], toneBias: ["d", "g"], matte: true, technique: "トーナル配色" },
  { match: ["surrealism", "シュルレアリスム", "超現実主義"], ja: "シュルレアリスム", story: "写実の中に置かれた異物",
    anchors: [
      { h: 206, s: 48, l: 64, name: "澄みすぎた空" }, { h: 32, s: 44, l: 52, name: "荒野の土" },
      { h: 8, s: 62, l: 46, name: "違和の赤" }, { h: 44, s: 18, l: 88, name: "白昼の光" },
    ], toneBias: ["b", "d"], matte: true, technique: "対照色相配色" },
  { match: ["fauvism", "フォーヴィスム", "野獣派"], ja: "フォーヴィスム", story: "見たままを裏切る原色",
    anchors: [
      { h: 356, s: 82, l: 52, name: "そのままの赤" }, { h: 156, s: 62, l: 44, name: "そのままの緑" },
      { h: 210, s: 74, l: 48, name: "そのままの青" }, { h: 46, s: 86, l: 60, name: "そのままの黄" },
    ], toneBias: ["v", "s"], technique: "対照色相配色" },
  { match: ["abstract expressionism", "抽象表現主義"], ja: "抽象表現主義", story: "画布に叩きつけた身振り",
    anchors: [
      { h: 30, s: 10, l: 14, name: "滴らせた黒" }, { h: 40, s: 26, l: 84, name: "生成りの画布" },
      { h: 4, s: 62, l: 44, name: "打ちつけた赤" }, { h: 44, s: 62, l: 58, name: "はじけた黄土" },
    ], toneBias: ["dk", "v"], matte: true, technique: "セパレーション" },
  { match: ["monet", "モネ", "クロード・モネ"], ja: "モネ", story: "睡蓮の池に映るもの",
    anchors: [
      { h: 176, s: 32, l: 58, name: "水面の青緑" }, { h: 286, s: 30, l: 72, name: "藤棚のうす紫" },
      { h: 340, s: 42, l: 78, name: "睡蓮のうす紅" }, { h: 132, s: 28, l: 40, name: "浮き葉の緑" },
    ], toneBias: ["sf", "lt"], matte: true, technique: "トーン・オン・トーン配色" },
  { match: ["van gogh", "ゴッホ", "ファン・ゴッホ"], ja: "ゴッホ", story: "渦を巻く黄と青",
    anchors: [
      { h: 48, s: 88, l: 58, name: "ひまわりの黄" }, { h: 226, s: 56, l: 34, name: "夜空のウルトラマリン" },
      { h: 36, s: 62, l: 44, name: "麦畑の黄土" }, { h: 168, s: 34, l: 34, name: "糸杉の暗緑" },
    ], toneBias: ["v", "dp"], technique: "補色配色" },

  // ===== 文様 =====
  // 繰り返しの柄は、そのまま配色技法の考え方につながる。
  { match: ["stripe", "ストライプ", "縞模様"], ja: "ストライプ", story: "並んだ線のリズム",
    anchors: [
      { h: 222, s: 44, l: 30, name: "縞の紺" }, { h: 42, s: 20, l: 94, name: "地の白" },
      { h: 356, s: 66, l: 48, name: "差しの赤" }, { h: 200, s: 40, l: 66, name: "細い水色" },
    ], toneBias: ["dp", "p"], technique: "リピテーション配色" },
  { match: ["check", "チェック", "格子柄"], ja: "チェック", story: "交差してできる第三の色",
    anchors: [
      { h: 148, s: 34, l: 28, name: "格子の深緑" }, { h: 348, s: 44, l: 34, name: "格子の臙脂" },
      { h: 40, s: 34, l: 82, name: "地の生成り" }, { h: 30, s: 24, l: 20, name: "重なりの黒" },
    ], toneBias: ["dk", "ltg"], matte: true, technique: "リピテーション配色" },
  { match: ["tartan", "タータン", "タータンチェック"], ja: "タータン", story: "氏族ごとに決まった縞",
    anchors: [
      { h: 150, s: 40, l: 24, name: "タータンの深緑" }, { h: 352, s: 60, l: 36, name: "タータンの赤" },
      { h: 222, s: 40, l: 24, name: "タータンの紺" }, { h: 46, s: 60, l: 60, name: "細い黄の線" },
    ], toneBias: ["dk", "v"], matte: true, technique: "リピテーション配色" },
  { match: ["paisley", "ペイズリー"], ja: "ペイズリー", story: "勾玉のかたちが渦を巻く",
    anchors: [
      { h: 344, s: 48, l: 34, name: "ペイズリーの臙脂" }, { h: 184, s: 44, l: 34, name: "深い青緑" },
      { h: 38, s: 56, l: 50, name: "金茶の縁取り" }, { h: 40, s: 28, l: 84, name: "地の生成り" },
    ], toneBias: ["dp", "d"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["floral pattern", "花柄", "フローラル"], ja: "花柄", story: "花と葉のくり返し",
    anchors: [
      { h: 344, s: 50, l: 70, name: "花の紅" }, { h: 120, s: 30, l: 42, name: "葉の緑" },
      { h: 46, s: 62, l: 72, name: "しべの黄" }, { h: 42, s: 26, l: 90, name: "地の白" },
    ], toneBias: ["lt", "sf"], technique: "ナチュラルハーモニー" },
  { match: ["geometric", "幾何学", "幾何学模様"], ja: "幾何学", story: "図形だけで組み立てる",
    anchors: [
      { h: 30, s: 10, l: 14, name: "輪郭の黒" }, { h: 42, s: 18, l: 94, name: "抜きの白" },
      { h: 214, s: 68, l: 48, name: "面の青" }, { h: 14, s: 74, l: 52, name: "面の赤橙" },
    ], toneBias: ["v", "dk"], technique: "セパレーション" },
  { match: ["tribal", "トライバル", "民族柄"], ja: "トライバル", story: "土と炭で描く記号",
    anchors: [
      { h: 20, s: 44, l: 38, name: "赤土の顔料" }, { h: 30, s: 10, l: 16, name: "炭の黒" },
      { h: 40, s: 28, l: 82, name: "白土" }, { h: 36, s: 46, l: 58, name: "黄土" },
    ], toneBias: ["d", "dk"], matte: true, technique: "セパレーション" },
  { match: ["arabesque", "アラベスク"], ja: "アラベスク", story: "終わりのない蔓の連続",
    anchors: [
      { h: 182, s: 52, l: 42, name: "蔓のターコイズ" }, { h: 220, s: 58, l: 38, name: "地のコバルト" },
      { h: 44, s: 62, l: 58, name: "縁の金" }, { h: 40, s: 22, l: 90, name: "抜きの白" },
    ], toneBias: ["dp", "v"], sparkle: true, technique: "類似色相配色" },
  { match: ["fan pattern", "扇文", "扇面"], ja: "扇文", story: "末広がりの吉祥",
    anchors: [
      { h: 44, s: 58, l: 60, name: "扇の金" }, { h: 6, s: 60, l: 46, name: "扇面の朱" },
      { h: 42, s: 26, l: 90, name: "地の白" }, { h: 218, s: 42, l: 32, name: "要の紺" },
    ], toneBias: ["v", "p"], sparkle: true, technique: "リピテーション配色" },

  // ===== 音楽 =====
  { match: ["disco", "ディスコ"], ja: "ディスコ", story: "ミラーボールの反射",
    anchors: [
      { h: 210, s: 8, l: 78, name: "ミラーボールの銀" }, { h: 326, s: 72, l: 60, name: "照明のマゼンタ" },
      { h: 46, s: 74, l: 58, name: "ラメの金" }, { h: 262, s: 46, l: 32, name: "フロアの紫闇" },
    ], toneBias: ["v", "dk"], sparkle: true, technique: "セパレーション" },
  { match: ["house music", "ハウス", "ハウスミュージック"], ja: "ハウス", story: "暗がりに落ちる原色",
    anchors: [
      { h: 218, s: 72, l: 52, name: "レーザーの青" }, { h: 316, s: 64, l: 52, name: "レーザーの紅紫" },
      { h: 30, s: 8, l: 12, name: "地下の黒" }, { h: 160, s: 52, l: 52, name: "抜ける青緑" },
    ], toneBias: ["v", "dkg"], sparkle: true, technique: "対照色相配色" },
  { match: ["techno", "テクノ"], ja: "テクノ", story: "無機質な反復",
    anchors: [
      { h: 210, s: 6, l: 34, name: "鉄板の灰" }, { h: 30, s: 6, l: 12, name: "黒" },
      { h: 190, s: 78, l: 54, name: "信号の青緑" }, { h: 210, s: 8, l: 74, name: "クローム" },
    ], toneBias: ["dkg", "v"], matte: true, technique: "対照トーン配色" },
  { match: ["hip hop", "ヒップホップ", "ヒップ・ホップ"], ja: "ヒップホップ", story: "金と黒と壁の落書き",
    anchors: [
      { h: 30, s: 8, l: 12, name: "黒" }, { h: 46, s: 68, l: 54, name: "太い金" },
      { h: 214, s: 40, l: 40, name: "デニムの藍" }, { h: 356, s: 68, l: 48, name: "ロゴの赤" },
    ], toneBias: ["dk", "v"], sparkle: true, technique: "セパレーション" },
  { match: ["reggae", "レゲエ"], ja: "レゲエ", story: "常夏と土のリズム",
    anchors: [
      { h: 140, s: 54, l: 34, name: "深い緑" }, { h: 48, s: 80, l: 56, name: "陽の黄" },
      { h: 4, s: 68, l: 46, name: "熱の赤" }, { h: 30, s: 34, l: 30, name: "大地の褐" },
    ], toneBias: ["v", "dp"], matte: true, technique: "リピテーション配色" },
  { match: ["rock music", "ロック", "ロックンロール"], ja: "ロック", story: "革と歪んだ音",
    anchors: [
      { h: 30, s: 8, l: 12, name: "革の黒" }, { h: 354, s: 74, l: 46, name: "叫ぶ赤" },
      { h: 210, s: 6, l: 72, name: "金具の銀" }, { h: 344, s: 42, l: 26, name: "沈む臙脂" },
    ], toneBias: ["dk", "v"], matte: true, technique: "対照トーン配色" },
  { match: ["ambient", "アンビエント"], ja: "アンビエント", story: "輪郭を持たない音",
    anchors: [
      { h: 200, s: 20, l: 84, name: "薄い水色" }, { h: 40, s: 12, l: 88, name: "白の霞" },
      { h: 260, s: 18, l: 66, name: "淡い藤鼠" }, { h: 190, s: 16, l: 52, name: "沈む青灰" },
    ], toneBias: ["p", "ltg"], matte: true, technique: "カマイユ配色" },

  // ===== 文化・工芸 =====
  // ビーズと相性のいい、糸と土と染めの色。
  { match: ["kimono", "着物", "和装"], ja: "着物", story: "重ねて見せる染めと織り",
    anchors: [
      { h: 220, s: 44, l: 30, name: "地の藍" }, { h: 6, s: 62, l: 46, name: "八掛の朱" },
      { h: 288, s: 26, l: 40, name: "京紫" }, { h: 44, s: 58, l: 58, name: "帯の金" },
    ], toneBias: ["dp", "dk"], sparkle: true, technique: "対照色相配色" },
  { match: ["zellige", "ゼリージュ"], ja: "ゼリージュ", story: "手割りタイルの揺らぎ",
    anchors: [
      { h: 178, s: 48, l: 44, name: "ゼリージュの青緑" }, { h: 40, s: 26, l: 88, name: "目地の白" },
      { h: 24, s: 48, l: 48, name: "土のテラコッタ" }, { h: 210, s: 56, l: 36, name: "深いコバルト" },
    ], toneBias: ["dp", "b"], matte: true, technique: "類似色相配色" },
  { match: ["batik", "バティック"], ja: "バティック", story: "蝋が防いだところだけ白く残る",
    anchors: [
      { h: 218, s: 48, l: 28, name: "蝋防染の藍" }, { h: 34, s: 50, l: 44, name: "ソガの茶" },
      { h: 42, s: 34, l: 84, name: "蝋の抜き白" }, { h: 16, s: 46, l: 40, name: "赤茶の縁" },
    ], toneBias: ["dp", "d"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["ikat", "イカット", "絣"], ja: "イカット", story: "括って染めた糸のにじみ",
    anchors: [
      { h: 216, s: 42, l: 32, name: "絣の藍" }, { h: 40, s: 30, l: 86, name: "括りの白" },
      { h: 10, s: 48, l: 44, name: "茜のにじみ" }, { h: 178, s: 34, l: 40, name: "褪せた青緑" },
    ], toneBias: ["dp", "sf"], matte: true, technique: "トーン・オン・トーン配色" },
  { match: ["kilim", "キリム"], ja: "キリム", story: "平織りの幾何と草木染め",
    anchors: [
      { h: 12, s: 50, l: 44, name: "茜の赤" }, { h: 38, s: 52, l: 52, name: "刈安の黄土" },
      { h: 200, s: 34, l: 34, name: "沈んだ藍" }, { h: 40, s: 26, l: 82, name: "羊毛の生成り" },
    ], toneBias: ["d", "dp"], matte: true, technique: "リピテーション配色" },
  { match: ["navajo", "ナバホ"], ja: "ナバホ", story: "砂岩とターコイズ。特定の部族の公式色ではなく、南西部の風土の色として",
    anchors: [
      { h: 180, s: 44, l: 50, name: "ターコイズ" }, { h: 16, s: 52, l: 46, name: "砂岩の赤" },
      { h: 40, s: 34, l: 78, name: "砂の生成り" }, { h: 30, s: 10, l: 16, name: "織りの黒" },
    ], toneBias: ["dp", "sf"], matte: true, technique: "対照色相配色" },
  { match: ["delftware", "デルフト焼", "デルフト"], ja: "デルフト焼", story: "白磁に藍ひといろ",
    anchors: [
      { h: 42, s: 18, l: 94, name: "白磁の地" }, { h: 220, s: 62, l: 40, name: "デルフトの藍" },
      { h: 216, s: 44, l: 66, name: "薄く溶いた藍" }, { h: 224, s: 50, l: 24, name: "濃い筆致" },
    ], toneBias: ["p", "dp"], technique: "同一色相配色" },
  { match: ["talavera", "タラベラ", "タラベラ焼"], ja: "タラベラ焼", story: "白地に黄と青の花",
    anchors: [
      { h: 44, s: 22, l: 92, name: "白地" }, { h: 214, s: 58, l: 44, name: "コバルトの花" },
      { h: 46, s: 76, l: 58, name: "黄の花" }, { h: 12, s: 62, l: 50, name: "縁の橙赤" },
    ], toneBias: ["v", "p"], technique: "セパレーション" },
  // ===== 服の場面 =====
  // 「この服に合わせる色」という引き方のための入口。
  { match: ["casual", "カジュアル", "普段着"], ja: "カジュアル", story: "気を張らない日の色",
    anchors: [
      { h: 214, s: 38, l: 46, name: "デニムの青" }, { h: 40, s: 30, l: 86, name: "白Tの生成り" },
      { h: 32, s: 32, l: 58, name: "履きこんだ革" }, { h: 100, s: 22, l: 48, name: "カーキ" },
    ], toneBias: ["sf", "d"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["formal", "フォーマル", "礼装"], ja: "フォーマル", story: "式のための深い色",
    anchors: [
      { h: 30, s: 10, l: 12, name: "礼服の黒" }, { h: 42, s: 26, l: 92, name: "絹の白" },
      { h: 222, s: 40, l: 24, name: "濃紺" }, { h: 44, s: 50, l: 68, name: "シャンパン" },
    ], toneBias: ["dk", "p"], sparkle: true, technique: "対照トーン配色" },
  { match: ["office", "オフィス", "通勤"], ja: "オフィス", story: "毎日着ても疲れない",
    anchors: [
      { h: 220, s: 34, l: 34, name: "紺のジャケット" }, { h: 36, s: 12, l: 74, name: "石灰の灰" },
      { h: 42, s: 20, l: 92, name: "シャツの白" }, { h: 350, s: 26, l: 46, name: "小物の臙脂" },
    ], toneBias: ["dp", "ltg"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["kids fashion", "キッズ", "子ども服"], ja: "キッズ", story: "汚しても許される明るさ",
    anchors: [
      { h: 196, s: 60, l: 70, name: "はっきりした水色" }, { h: 12, s: 74, l: 68, name: "珊瑚の橙" },
      { h: 50, s: 80, l: 70, name: "黄" }, { h: 150, s: 44, l: 62, name: "若い緑" },
    ], toneBias: ["b", "lt"], technique: "リピテーション配色" },
  { match: ["menswear", "メンズ", "紳士服"], ja: "メンズ", story: "落ち着いた地の色で組む",
    anchors: [
      { h: 222, s: 34, l: 26, name: "紺" }, { h: 210, s: 6, l: 38, name: "チャコール" },
      { h: 32, s: 34, l: 52, name: "キャメル" }, { h: 150, s: 26, l: 26, name: "深緑" },
    ], toneBias: ["dk", "dkg"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["genderless", "ジェンダーレス", "ユニセックス"], ja: "ジェンダーレス", story: "どちらにも寄せない",
    anchors: [
      { h: 40, s: 12, l: 80, name: "生成り" }, { h: 210, s: 8, l: 52, name: "中間の灰" },
      { h: 168, s: 20, l: 48, name: "青みの緑灰" }, { h: 24, s: 16, l: 34, name: "落ち着いた褐" },
    ], toneBias: ["ltg", "g"], matte: true, technique: "トーナル配色" },

  // ===== ブライダル =====
  // 「結婚式」だけでは粗いので、場面ごとに分ける。
  { match: ["garden wedding", "ガーデンウェディング", "ガーデン挙式"], ja: "ガーデンウェディング", story: "木漏れ日の下の誓い",
    anchors: [
      { h: 96, s: 22, l: 58, name: "ユーカリの葉" }, { h: 40, s: 30, l: 93, name: "アイボリー" },
      { h: 348, s: 40, l: 84, name: "ブラッシュ" }, { h: 44, s: 44, l: 74, name: "シャンパン" },
    ], toneBias: ["p", "ltg"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["beach wedding", "ビーチウェディング", "リゾート婚"], ja: "ビーチウェディング", story: "波音のする式",
    anchors: [
      { h: 182, s: 52, l: 70, name: "遠浅のアクア" }, { h: 42, s: 24, l: 95, name: "白いドレス" },
      { h: 38, s: 44, l: 80, name: "砂の色" }, { h: 206, s: 48, l: 52, name: "沖の青" },
    ], toneBias: ["lt", "p"], technique: "トーン・オン・トーン配色" },
  { match: ["japanese wedding", "和婚", "神前式", "白無垢"], ja: "和婚", story: "白無垢と朱と金",
    anchors: [
      { h: 42, s: 14, l: 96, name: "白無垢の白" }, { h: 6, s: 70, l: 46, name: "掛下の朱" },
      { h: 46, s: 58, l: 58, name: "金襴の金" }, { h: 140, s: 30, l: 26, name: "常磐の緑" },
    ], toneBias: ["p", "v"], sparkle: true, technique: "セパレーション" },
  { match: ["winter wedding", "冬の結婚式", "冬婚"], ja: "冬の結婚式", story: "澄んだ空気の中で",
    anchors: [
      { h: 42, s: 18, l: 95, name: "雪の白" }, { h: 210, s: 26, l: 76, name: "冬空の淡青" },
      { h: 344, s: 30, l: 40, name: "深いボルドー" }, { h: 210, s: 10, l: 72, name: "銀" },
    ], toneBias: ["p", "dk"], sparkle: true, technique: "対照トーン配色" },
  { match: ["vintage wedding", "ヴィンテージウェディング", "アンティーク婚"], ja: "ヴィンテージウェディング", story: "少し褪せた白",
    anchors: [
      { h: 42, s: 28, l: 88, name: "褪せた生成り" }, { h: 40, s: 36, l: 66, name: "古いレースの飴色" },
      { h: 344, s: 24, l: 62, name: "褪せた薔薇" }, { h: 44, s: 40, l: 52, name: "古金" },
    ], toneBias: ["ltg", "sf"], matte: true, technique: "ドミナントトーン配色" },

  // ===== 記憶・物語 =====
  { match: ["childhood", "子ども時代", "幼少期"], ja: "子ども時代", story: "背の低いところから見た色",
    anchors: [
      { h: 200, s: 52, l: 72, name: "見上げた空" }, { h: 50, s: 74, l: 70, name: "画用紙の黄" },
      { h: 8, s: 62, l: 66, name: "赤いランドセル" }, { h: 110, s: 38, l: 52, name: "校庭の草" },
    ], toneBias: ["b", "lt"], matte: true, technique: "リピテーション配色" },
  { match: ["family", "家族", "かぞく"], ja: "家族", story: "そこにある温度",
    anchors: [
      { h: 30, s: 34, l: 76, name: "食卓の生成り" }, { h: 24, s: 34, l: 44, name: "使い込んだ木" },
      { h: 350, s: 26, l: 62, name: "褪せた薔薇" }, { h: 210, s: 24, l: 38, name: "父の紺" },
    ], toneBias: ["sf", "d"], matte: true, technique: "トーナル配色" },
  { match: ["home", "わが家", "帰る家", "おうち", "マイホーム"], ja: "家", story: "灯りのついている窓",
    anchors: [
      { h: 36, s: 56, l: 66, name: "窓の灯" }, { h: 26, s: 30, l: 38, name: "柱の木" },
      { h: 40, s: 22, l: 88, name: "壁の白" }, { h: 110, s: 24, l: 42, name: "鉢植えの緑" },
    ], toneBias: ["sf", "ltg"], matte: true, technique: "ドミナントカラー配色" },
  { match: ["travel memory", "旅の記憶", "旅の思い出"], ja: "旅の記憶", story: "戻ってから濃くなる色",
    anchors: [
      { h: 196, s: 34, l: 62, name: "遠い海" }, { h: 36, s: 40, l: 70, name: "切符の紙" },
      { h: 20, s: 40, l: 46, name: "屋根の赤茶" }, { h: 210, s: 14, l: 40, name: "曇りの記憶" },
    ], toneBias: ["ltg", "sf"], matte: true, technique: "トーナル配色" },

  // ===== 時代 =====
  { match: ["georgian", "ジョージアン"], ja: "ジョージアン", story: "18世紀英国の抑えた室内",
    anchors: [
      { h: 98, s: 18, l: 56, name: "サージの緑" }, { h: 40, s: 26, l: 86, name: "石膏の生成り" },
      { h: 222, s: 32, l: 34, name: "抑えた紺" }, { h: 42, s: 42, l: 54, name: "古金の縁" },
    ], toneBias: ["ltg", "d"], matte: true, technique: "トーナル配色" },
  { match: ["belle epoque", "ベルエポック", "ベル・エポック"], ja: "ベルエポック", story: "世紀末パリの華やぎ",
    anchors: [
      { h: 44, s: 46, l: 70, name: "シャンパン" }, { h: 344, s: 30, l: 62, name: "褪せた薔薇" },
      { h: 184, s: 40, l: 34, name: "深いティール" }, { h: 42, s: 46, l: 50, name: "古金" },
    ], toneBias: ["sf", "dp"], sparkle: true, technique: "ドミナントトーン配色" },
  { match: ["summer vacation", "夏休み", "なつやすみ"], ja: "夏休み", story: "終わらないと思っていた日",
    anchors: [
      { h: 198, s: 66, l: 62, name: "プールの水" },
      { h: 48, s: 84, l: 66, name: "照りつける陽" },
      { h: 128, s: 44, l: 40, name: "濃い夏草" },
      { h: 42, s: 26, l: 94, name: "入道雲の白" },
    ], toneBias: ["v", "b"], technique: "対照色相配色" },
  { match: ["end of summer", "夏の終わり", "晩夏"], ja: "夏の終わり", story: "陽が少し傾いた",
    anchors: [
      { h: 32, s: 56, l: 66, name: "傾いた陽の橙" },
      { h: 96, s: 26, l: 44, name: "疲れた夏草" },
      { h: 262, s: 26, l: 56, name: "早い夕闇" },
      { h: 44, s: 34, l: 84, name: "薄れる白" },
    ], toneBias: ["sf", "ltg"], matte: true, technique: "トーナル配色" },
  // ===== 世界の国(補い) =====
  { match: ["italy", "イタリア"], ja: "イタリア", story: "テラコッタと糸杉と地中海",
    anchors: [
      { h: 18, s: 50, l: 48, name: "テラコッタの屋根" }, { h: 126, s: 30, l: 26, name: "糸杉の深緑" },
      { h: 200, s: 54, l: 50, name: "地中海の青" }, { h: 40, s: 26, l: 86, name: "漆喰の生成り" },
    ], toneBias: ["d", "dp"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["america", "usa", "アメリカ", "米国"], ja: "アメリカ", story: "広い空とデニムと星条",
    anchors: [
      { h: 218, s: 52, l: 34, name: "旗の紺" }, { h: 356, s: 68, l: 46, name: "旗の赤" },
      { h: 42, s: 20, l: 94, name: "旗の白" }, { h: 30, s: 40, l: 46, name: "荒野の土" },
    ], toneBias: ["v", "dk"], technique: "セパレーション" },
  { match: ["united kingdom", "britain", "イギリス", "英国"], ja: "イギリス", story: "煉瓦と苔と霧",
    anchors: [
      { h: 12, s: 40, l: 38, name: "煉瓦の赤褐" }, { h: 140, s: 30, l: 30, name: "レーシンググリーン" },
      { h: 210, s: 10, l: 66, name: "霧の灰" }, { h: 220, s: 42, l: 26, name: "オックスフォードの紺" },
    ], toneBias: ["dk", "d"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["philippines", "フィリピン"], ja: "フィリピン", story: "七千の島と椰子",
    anchors: [
      { h: 186, s: 58, l: 62, name: "遠浅の碧" }, { h: 44, s: 22, l: 92, name: "白砂" },
      { h: 130, s: 42, l: 38, name: "椰子の緑" }, { h: 22, s: 74, l: 58, name: "夕陽の橙" },
    ], toneBias: ["b", "lt"], technique: "対照色相配色" },
  { match: ["malaysia", "マレーシア"], ja: "マレーシア", story: "熱帯の緑とバティックの藍",
    anchors: [
      { h: 148, s: 48, l: 34, name: "熱帯の濃緑" }, { h: 218, s: 46, l: 32, name: "バティックの藍" },
      { h: 44, s: 66, l: 58, name: "金の装飾" }, { h: 12, s: 56, l: 50, name: "香辛料の赤茶" },
    ], toneBias: ["dp", "s"], matte: true },
  { match: ["myanmar", "burma", "ミャンマー", "ビルマ"], ja: "ミャンマー", story: "金の仏塔と僧衣の臙脂",
    anchors: [
      { h: 44, s: 76, l: 56, name: "パゴダの金" }, { h: 346, s: 46, l: 38, name: "僧衣の臙脂" },
      { h: 30, s: 40, l: 44, name: "乾いた大地" }, { h: 40, s: 26, l: 86, name: "タナカの白" },
    ], toneBias: ["s", "dp"], matte: true, technique: "対照色相配色" },
  { match: ["cambodia", "カンボジア", "アンコール"], ja: "カンボジア", story: "砂岩の遺跡と樹の根",
    anchors: [
      { h: 30, s: 22, l: 44, name: "砂岩の灰褐" }, { h: 100, s: 30, l: 30, name: "覆う樹の緑" },
      { h: 44, s: 58, l: 60, name: "祠の金" }, { h: 20, s: 40, l: 62, name: "陽の当たる石" },
    ], toneBias: ["d", "dp"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["laos", "ラオス", "ルアンパバーン"], ja: "ラオス", story: "托鉢の橙と川の霞",
    anchors: [
      { h: 28, s: 78, l: 54, name: "托鉢衣の橙" }, { h: 40, s: 20, l: 82, name: "朝靄の白" },
      { h: 100, s: 26, l: 38, name: "山の緑" }, { h: 34, s: 30, l: 52, name: "メコンの土色" },
    ], toneBias: ["s", "ltg"], matte: true },
  { match: ["israel", "イスラエル", "エルサレム"], ja: "イスラエル", story: "石灰岩の街と乾いた青",
    anchors: [
      { h: 40, s: 34, l: 76, name: "エルサレムの石" }, { h: 210, s: 52, l: 52, name: "乾いた空の青" },
      { h: 42, s: 22, l: 92, name: "白い壁" }, { h: 96, s: 22, l: 42, name: "オリーブの緑" },
    ], toneBias: ["ltg", "b"], matte: true },
  { match: ["jordan", "ヨルダン", "ペトラ"], ja: "ヨルダン", story: "薔薇色の岩を彫った街",
    anchors: [
      { h: 12, s: 46, l: 56, name: "ペトラの薔薇岩" }, { h: 28, s: 38, l: 38, name: "峡谷の影" },
      { h: 40, s: 48, l: 74, name: "砂漠の砂" }, { h: 200, s: 30, l: 80, name: "細い空" },
    ], toneBias: ["sf", "d"], matte: true, technique: "同一色相配色" },
  { match: ["saudi arabia", "サウジアラビア"], ja: "サウジアラビア", story: "砂丘と黒衣と金",
    anchors: [
      { h: 36, s: 52, l: 68, name: "砂丘の金" }, { h: 30, s: 8, l: 14, name: "アバヤの黒" },
      { h: 46, s: 64, l: 56, name: "装飾の金" }, { h: 150, s: 42, l: 30, name: "旗の緑" },
    ], toneBias: ["dk", "s"], matte: true, technique: "対照トーン配色" },
  { match: ["uae", "アラブ首長国連邦", "エミレーツ"], ja: "アラブ首長国連邦", story: "砂漠に立つ硝子",
    anchors: [
      { h: 38, s: 48, l: 72, name: "砂の色" }, { h: 196, s: 46, l: 62, name: "硝子の反射" },
      { h: 46, s: 68, l: 56, name: "金の装飾" }, { h: 220, s: 34, l: 24, name: "夜の紺" },
    ], toneBias: ["b", "dk"], sparkle: true, technique: "セパレーション" },
  { match: ["georgia country", "ジョージア", "グルジア"], ja: "ジョージア", story: "葡萄酒と石造りの塔",
    anchors: [
      { h: 344, s: 42, l: 30, name: "葡萄酒の深紅" }, { h: 30, s: 16, l: 52, name: "石塔の灰褐" },
      { h: 96, s: 30, l: 42, name: "葡萄畑の緑" }, { h: 40, s: 24, l: 84, name: "壁の生成り" },
    ], toneBias: ["dp", "d"], matte: true },
  { match: ["armenia", "アルメニア"], ja: "アルメニア", story: "凝灰岩の桃色と杏",
    anchors: [
      { h: 14, s: 34, l: 56, name: "凝灰岩の桃" }, { h: 28, s: 68, l: 62, name: "杏の橙" },
      { h: 30, s: 20, l: 32, name: "石彫りの影" }, { h: 210, s: 30, l: 74, name: "高地の空" },
    ], toneBias: ["sf", "d"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["azerbaijan", "アゼルバイジャン"], ja: "アゼルバイジャン", story: "火の国の絨毯",
    anchors: [
      { h: 186, s: 52, l: 42, name: "絨毯のターコイズ" }, { h: 6, s: 58, l: 42, name: "絨毯の茜" },
      { h: 44, s: 60, l: 56, name: "細工の金" }, { h: 30, s: 22, l: 26, name: "石油の黒" },
    ], toneBias: ["dp", "v"], matte: true, technique: "対照色相配色" },
  { match: ["kyrgyz", "キルギス"], ja: "キルギス", story: "天山の草原とフェルト",
    anchors: [
      { h: 92, s: 34, l: 48, name: "草原の緑" }, { h: 200, s: 20, l: 88, name: "天山の雪" },
      { h: 12, s: 52, l: 44, name: "フェルトの茜" }, { h: 40, s: 30, l: 80, name: "羊毛の生成り" },
    ], toneBias: ["sf", "p"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["ethiopia", "エチオピア"], ja: "エチオピア", story: "高原の珈琲と岩の教会",
    anchors: [
      { h: 26, s: 40, l: 30, name: "焙煎の褐" }, { h: 12, s: 46, l: 42, name: "岩窟の赤土" },
      { h: 46, s: 66, l: 58, name: "旗の黄" }, { h: 40, s: 26, l: 88, name: "白い綿布" },
    ], toneBias: ["dk", "s"], matte: true },
  { match: ["ghana", "ガーナ"], ja: "ガーナ", story: "ケンテ織りの帯",
    anchors: [
      { h: 46, s: 78, l: 56, name: "ケンテの金" }, { h: 356, s: 66, l: 44, name: "ケンテの赤" },
      { h: 148, s: 48, l: 32, name: "ケンテの緑" }, { h: 30, s: 12, l: 16, name: "織りの黒" },
    ], toneBias: ["v", "dk"], technique: "リピテーション配色" },
  { match: ["senegal", "セネガル"], ja: "セネガル", story: "藍染めの布と赤い大地",
    anchors: [
      { h: 220, s: 44, l: 32, name: "藍の布" }, { h: 16, s: 48, l: 44, name: "ラテライトの赤土" },
      { h: 46, s: 66, l: 62, name: "陽の黄" }, { h: 40, s: 26, l: 88, name: "白い衣" },
    ], toneBias: ["dp", "s"], matte: true, technique: "対照色相配色" },
  { match: ["namibia", "ナミビア"], ja: "ナミビア", story: "赤い砂丘と枯木",
    anchors: [
      { h: 16, s: 62, l: 52, name: "ナミブの赤砂" }, { h: 200, s: 46, l: 70, name: "抜ける空" },
      { h: 30, s: 14, l: 20, name: "枯木の黒" }, { h: 40, s: 24, l: 90, name: "塩の白" },
    ], toneBias: ["v", "dk"], matte: true, technique: "対照色相配色" },
  { match: ["zimbabwe", "ジンバブエ"], ja: "ジンバブエ", story: "石積みの遺跡と滑石",
    anchors: [
      { h: 30, s: 14, l: 46, name: "石積みの灰" }, { h: 96, s: 30, l: 36, name: "灌木の緑" },
      { h: 24, s: 42, l: 40, name: "赤土" }, { h: 40, s: 20, l: 78, name: "乾いた草" },
    ], toneBias: ["d", "g"], matte: true, technique: "トーナル配色" },
  { match: ["uganda", "ウガンダ"], ja: "ウガンダ", story: "赤道の緑と樹皮布",
    anchors: [
      { h: 120, s: 44, l: 34, name: "赤道の濃緑" }, { h: 26, s: 44, l: 48, name: "樹皮布の褐" },
      { h: 46, s: 62, l: 60, name: "陽の黄" }, { h: 200, s: 34, l: 66, name: "湖の青" },
    ], toneBias: ["dp", "s"], matte: true },
  { match: ["algeria", "アルジェリア"], ja: "アルジェリア", story: "白い街とサハラの縁",
    anchors: [
      { h: 42, s: 18, l: 92, name: "白い街" }, { h: 200, s: 50, l: 48, name: "地中海の青" },
      { h: 38, s: 48, l: 64, name: "サハラの砂" }, { h: 150, s: 36, l: 34, name: "旗の緑" },
    ], toneBias: ["p", "b"], matte: true, technique: "セパレーション" },
  { match: ["iraq", "イラク", "メソポタミア"], ja: "イラク", story: "青釉の煉瓦と大河",
    anchors: [
      { h: 200, s: 58, l: 44, name: "青釉の煉瓦" }, { h: 34, s: 44, l: 56, name: "日干し煉瓦" },
      { h: 44, s: 60, l: 58, name: "装飾の金" }, { h: 96, s: 24, l: 40, name: "河畔の棗椰子" },
    ], toneBias: ["dp", "sf"], matte: true, technique: "対照色相配色" },
  { match: ["bangladesh", "バングラデシュ"], ja: "バングラデシュ", story: "モスリンとデルタの緑",
    anchors: [
      { h: 140, s: 46, l: 32, name: "デルタの濃緑" }, { h: 356, s: 62, l: 48, name: "旗の赤" },
      { h: 42, s: 26, l: 90, name: "モスリンの白" }, { h: 34, s: 34, l: 52, name: "川の土色" },
    ], toneBias: ["dp", "v"], matte: true },
  { match: ["colombia", "コロンビア"], ja: "コロンビア", story: "珈琲畑とエメラルド",
    anchors: [
      { h: 132, s: 40, l: 36, name: "珈琲畑の緑" }, { h: 158, s: 56, l: 34, name: "エメラルド" },
      { h: 48, s: 78, l: 58, name: "旗の黄" }, { h: 26, s: 40, l: 34, name: "焙煎の褐" },
    ], toneBias: ["dp", "v"], matte: true },
  { match: ["chile", "チリ"], ja: "チリ", story: "細長い国の砂漠と氷河",
    anchors: [
      { h: 30, s: 44, l: 58, name: "アタカマの砂" }, { h: 198, s: 40, l: 78, name: "氷河の淡青" },
      { h: 218, s: 50, l: 40, name: "旗の青" }, { h: 356, s: 62, l: 46, name: "旗の赤" },
    ], toneBias: ["b", "sf"], technique: "対照トーン配色" },
  { match: ["ecuador", "エクアドル"], ja: "エクアドル", story: "赤道の高地と織物",
    anchors: [
      { h: 46, s: 72, l: 58, name: "織物の黄" }, { h: 214, s: 54, l: 42, name: "織物の藍" },
      { h: 356, s: 62, l: 46, name: "織物の赤" }, { h: 100, s: 30, l: 38, name: "高地の緑" },
    ], toneBias: ["v", "dp"], matte: true, technique: "リピテーション配色" },
  { match: ["costa rica", "コスタリカ"], ja: "コスタリカ", story: "雲霧林と極彩色の鳥",
    anchors: [
      { h: 146, s: 46, l: 36, name: "雲霧林の緑" }, { h: 190, s: 20, l: 82, name: "霧の白" },
      { h: 14, s: 78, l: 56, name: "鳥の赤" }, { h: 202, s: 62, l: 50, name: "鳥の青" },
    ], toneBias: ["dp", "v"], technique: "対照色相配色" },
  { match: ["guatemala", "グアテマラ"], ja: "グアテマラ", story: "ウイピルの縞と火山",
    anchors: [
      { h: 336, s: 62, l: 50, name: "ウイピルの紅紫" }, { h: 176, s: 52, l: 42, name: "ウイピルの青緑" },
      { h: 48, s: 76, l: 58, name: "ウイピルの黄" }, { h: 24, s: 16, l: 22, name: "火山の黒砂" },
    ], toneBias: ["v", "dk"], matte: true, technique: "リピテーション配色" },
  { match: ["panama", "パナマ"], ja: "パナマ", story: "運河の水とモラの重ね布",
    anchors: [
      { h: 190, s: 44, l: 52, name: "運河の水" }, { h: 356, s: 68, l: 46, name: "モラの赤" },
      { h: 30, s: 10, l: 16, name: "モラの黒" }, { h: 44, s: 70, l: 60, name: "モラの黄" },
    ], toneBias: ["v", "dk"], matte: true, technique: "セパレーション" },
  { match: ["venezuela", "ベネズエラ"], ja: "ベネズエラ", story: "卓状台地と落ちる水",
    anchors: [
      { h: 28, s: 30, l: 36, name: "テプイの岩" }, { h: 140, s: 44, l: 34, name: "密林の緑" },
      { h: 200, s: 16, l: 86, name: "落水の白" }, { h: 46, s: 70, l: 58, name: "旗の黄" },
    ], toneBias: ["dp", "d"], matte: true },
  { match: ["uruguay", "ウルグアイ"], ja: "ウルグアイ", story: "牧場と空色の旗",
    anchors: [
      { h: 204, s: 50, l: 66, name: "旗の空色" }, { h: 42, s: 22, l: 94, name: "旗の白" },
      { h: 96, s: 32, l: 44, name: "牧場の緑" }, { h: 34, s: 30, l: 46, name: "革の褐" },
    ], toneBias: ["lt", "sf"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["ukraine", "ウクライナ"], ja: "ウクライナ", story: "麦畑と空の二層",
    anchors: [
      { h: 210, s: 58, l: 48, name: "空の青" }, { h: 46, s: 78, l: 58, name: "麦の黄" },
      { h: 42, s: 26, l: 90, name: "刺繍布の白" }, { h: 356, s: 56, l: 42, name: "刺繍の赤" },
    ], toneBias: ["v", "b"], technique: "セパレーション" },
  { match: ["estonia", "エストニア"], ja: "エストニア", story: "森と旧市街の石畳",
    anchors: [
      { h: 130, s: 26, l: 30, name: "針葉樹の森" }, { h: 210, s: 12, l: 62, name: "石畳の灰" },
      { h: 42, s: 24, l: 88, name: "北の白" }, { h: 214, s: 40, l: 36, name: "バルト海の藍" },
    ], toneBias: ["dp", "ltg"], matte: true, technique: "トーナル配色" },
  { match: ["latvia", "ラトビア"], ja: "ラトビア", story: "琥珀と民族の縞",
    anchors: [
      { h: 36, s: 72, l: 54, name: "バルトの琥珀" }, { h: 8, s: 40, l: 34, name: "民族衣装の暗紅" },
      { h: 42, s: 24, l: 90, name: "麻布の白" }, { h: 100, s: 22, l: 36, name: "森の緑" },
    ], toneBias: ["d", "dk"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["lithuania", "リトアニア"], ja: "リトアニア", story: "十字架の丘と亜麻",
    anchors: [
      { h: 40, s: 28, l: 80, name: "亜麻の生成り" }, { h: 30, s: 30, l: 40, name: "木の十字架" },
      { h: 46, s: 66, l: 58, name: "旗の黄" }, { h: 140, s: 36, l: 32, name: "旗の緑" },
    ], toneBias: ["ltg", "d"], matte: true },
  { match: ["slovenia", "スロベニア"], ja: "スロベニア", story: "湖と石灰岩の山",
    anchors: [
      { h: 172, s: 40, l: 52, name: "湖の翠" }, { h: 40, s: 14, l: 86, name: "石灰岩の白" },
      { h: 128, s: 32, l: 30, name: "山の森" }, { h: 14, s: 44, l: 46, name: "屋根の赤" },
    ], toneBias: ["sf", "dp"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["serbia", "セルビア"], ja: "セルビア", story: "修道院の壁画",
    anchors: [
      { h: 218, s: 46, l: 34, name: "壁画の藍" }, { h: 8, s: 52, l: 40, name: "壁画の朱" },
      { h: 44, s: 56, l: 58, name: "光輪の金" }, { h: 38, s: 22, l: 80, name: "漆喰の地" },
    ], toneBias: ["dp", "d"], matte: true },
  { match: ["slovakia", "スロバキア"], ja: "スロバキア", story: "山地の民家と刺繍",
    anchors: [
      { h: 42, s: 24, l: 90, name: "白い民家" }, { h: 214, s: 48, l: 40, name: "刺繍の藍" },
      { h: 356, s: 58, l: 46, name: "刺繍の赤" }, { h: 122, s: 30, l: 32, name: "山地の緑" },
    ], toneBias: ["v", "p"], matte: true, technique: "リピテーション配色" },
  // ===== 日本の焼きもの =====
  // 「分類:焼きもの」では窯ごとの違いが出ない。
  // 有田の白磁と備前の土肌はまったく別の色なので、窯ごとに持つ。
  { match: ["arita", "有田焼", "伊万里焼"], ja: "有田焼", story: "白磁に染付の藍",
    anchors: [
      { h: 200, s: 8, l: 94, name: "白磁の地" }, { h: 218, s: 58, l: 38, name: "染付の呉須" },
      { h: 4, s: 66, l: 48, name: "赤絵の朱" }, { h: 44, s: 58, l: 58, name: "金彩" },
    ], toneBias: ["p", "dp"], technique: "セパレーション" },
  { match: ["kutani", "九谷焼"], ja: "九谷焼", story: "五彩を塗り埋める",
    anchors: [
      { h: 140, s: 52, l: 34, name: "九谷の緑" }, { h: 46, s: 78, l: 54, name: "九谷の黄" },
      { h: 288, s: 34, l: 36, name: "九谷の紫" }, { h: 220, s: 52, l: 30, name: "九谷の紺青" },
    ], toneBias: ["dp", "v"], sparkle: true, technique: "リピテーション配色" },
  { match: ["bizen", "備前焼"], ja: "備前焼", story: "釉をかけない土そのもの",
    anchors: [
      { h: 18, s: 40, l: 40, name: "緋襷の赤褐" }, { h: 26, s: 18, l: 28, name: "焼き締めの土" },
      { h: 40, s: 14, l: 62, name: "灰かぶりの白茶" }, { h: 20, s: 26, l: 16, name: "窯変の黒" },
    ], toneBias: ["d", "dk"], matte: true, technique: "同一色相配色" },
  { match: ["shigaraki", "信楽焼"], ja: "信楽焼", story: "土に長石が跳ねる",
    anchors: [
      { h: 22, s: 42, l: 52, name: "信楽の緋色" }, { h: 40, s: 20, l: 80, name: "長石の白粒" },
      { h: 96, s: 16, l: 44, name: "自然釉のビードロ" }, { h: 28, s: 24, l: 30, name: "焦げの褐" },
    ], toneBias: ["sf", "d"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["oribe", "織部焼", "織部"], ja: "織部", story: "流れる緑釉と鉄絵",
    anchors: [
      { h: 132, s: 44, l: 32, name: "織部の緑釉" }, { h: 40, s: 26, l: 86, name: "白い抜き" },
      { h: 26, s: 34, l: 30, name: "鉄絵の褐" }, { h: 150, s: 30, l: 52, name: "薄がかりの緑" },
    ], toneBias: ["dp", "p"], matte: true, technique: "対照トーン配色" },
  { match: ["shino", "志野焼", "志野"], ja: "志野", story: "厚い長石釉の柚肌",
    anchors: [
      { h: 24, s: 22, l: 90, name: "志野の乳白" }, { h: 12, s: 36, l: 68, name: "火色の薄紅" },
      { h: 26, s: 30, l: 36, name: "鉄絵の鼠志野" }, { h: 40, s: 16, l: 76, name: "柚肌の陰" },
    ], toneBias: ["p", "ltg"], matte: true, technique: "カマイユ配色" },
  { match: ["hagi", "萩焼"], ja: "萩焼", story: "貫入から茶が染みてゆく",
    anchors: [
      { h: 30, s: 20, l: 84, name: "萩の枇杷色" }, { h: 340, s: 14, l: 74, name: "うすい紅の景色" },
      { h: 36, s: 22, l: 58, name: "貫入の染み" }, { h: 40, s: 12, l: 92, name: "白釉の抜け" },
    ], toneBias: ["p", "ltg"], matte: true, technique: "フォ・カマイユ配色" },
  { match: ["karatsu", "唐津焼"], ja: "唐津焼", story: "砂まじりの土と斑",
    anchors: [
      { h: 34, s: 20, l: 56, name: "砂目の土" }, { h: 40, s: 16, l: 82, name: "斑唐津の白" },
      { h: 26, s: 26, l: 32, name: "鉄絵の黒褐" }, { h: 96, s: 12, l: 46, name: "灰釉の緑みの灰" },
    ], toneBias: ["d", "ltg"], matte: true, technique: "トーナル配色" },
  { match: ["mashiko", "益子焼"], ja: "益子焼", story: "厚い釉と柿と黒",
    anchors: [
      { h: 24, s: 56, l: 44, name: "柿釉の赤褐" }, { h: 30, s: 12, l: 18, name: "黒釉" },
      { h: 40, s: 24, l: 86, name: "糠白釉" }, { h: 96, s: 16, l: 42, name: "青磁釉の灰緑" },
    ], toneBias: ["dk", "d"], matte: true, technique: "対照トーン配色" },
  { match: ["seiji", "青磁"], ja: "青磁", story: "翡翠を目指した釉",
    anchors: [
      { h: 158, s: 24, l: 68, name: "青磁の翠" }, { h: 168, s: 20, l: 50, name: "溜まりの濃み" },
      { h: 40, s: 14, l: 90, name: "素地の白" }, { h: 30, s: 16, l: 60, name: "貫入の線" },
    ], toneBias: ["ltg", "sf"], technique: "同一色相配色" },
  { match: ["sometsuke", "染付"], ja: "染付", story: "白磁に呉須ひといろ",
    anchors: [
      { h: 42, s: 12, l: 94, name: "白磁" }, { h: 220, s: 60, l: 36, name: "濃い呉須" },
      { h: 214, s: 44, l: 62, name: "薄く溶いた呉須" }, { h: 224, s: 52, l: 22, name: "描き起こしの線" },
    ], toneBias: ["p", "dp"], technique: "同一色相配色" },
  { match: ["tenmoku", "天目"], ja: "天目", story: "黒釉に浮かぶ星",
    anchors: [
      { h: 24, s: 30, l: 12, name: "天目の黒" }, { h: 36, s: 52, l: 40, name: "禾目の飴色" },
      { h: 200, s: 34, l: 52, name: "曜変の青" }, { h: 44, s: 44, l: 66, name: "縁の金" },
    ], toneBias: ["dk", "dkg"], sparkle: true, technique: "対照トーン配色" },

  // ===== 染めと織り =====
  { match: ["kyo yuzen", "京友禅", "友禅"], ja: "京友禅", story: "糸目で囲って挿す色",
    anchors: [
      { h: 344, s: 46, l: 74, name: "挿し色の紅" }, { h: 44, s: 58, l: 60, name: "金彩" },
      { h: 140, s: 30, l: 40, name: "葉の緑" }, { h: 42, s: 24, l: 92, name: "糸目の白" },
    ], toneBias: ["p", "v"], sparkle: true, technique: "セパレーション" },
  { match: ["kaga yuzen", "加賀友禅"], ja: "加賀友禅", story: "五彩と虫喰いの写実",
    anchors: [
      { h: 344, s: 42, l: 40, name: "臙脂" }, { h: 210, s: 40, l: 34, name: "藍" },
      { h: 48, s: 52, l: 52, name: "黄土" }, { h: 122, s: 26, l: 32, name: "草の緑" },
    ], toneBias: ["dp", "d"], matte: true, technique: "ドミナントトーン配色" },
  { match: ["nishijin", "西陣織", "西陣"], ja: "西陣織", story: "先に染めた糸で紋を織る",
    anchors: [
      { h: 44, s: 60, l: 56, name: "金糸" }, { h: 348, s: 52, l: 34, name: "臙脂の地" },
      { h: 220, s: 46, l: 28, name: "紺の地" }, { h: 40, s: 22, l: 88, name: "銀糸の白" },
    ], toneBias: ["dk", "v"], sparkle: true, technique: "セパレーション" },
  { match: ["bingata", "紅型", "びんがた"], ja: "紅型", story: "南の光で染める型",
    anchors: [
      { h: 48, s: 84, l: 60, name: "紅型の黄" }, { h: 356, s: 68, l: 52, name: "紅型の朱" },
      { h: 176, s: 52, l: 46, name: "紅型の青緑" }, { h: 42, s: 26, l: 90, name: "抜きの白" },
    ], toneBias: ["v", "b"], technique: "リピテーション配色" },
  { match: ["oshima tsumugi", "大島紬"], ja: "大島紬", story: "泥に沈めて黒くする",
    anchors: [
      { h: 26, s: 16, l: 18, name: "泥染めの黒褐" }, { h: 20, s: 26, l: 34, name: "車輪梅の赤褐" },
      { h: 40, s: 22, l: 84, name: "絣の白" }, { h: 30, s: 12, l: 52, name: "織りの霜降り" },
    ], toneBias: ["dkg", "dk"], matte: true, technique: "同一色相配色" },
  { match: ["yuki tsumugi", "結城紬"], ja: "結城紬", story: "真綿から手で紡ぐ",
    anchors: [
      { h: 36, s: 18, l: 74, name: "真綿の生成り" }, { h: 216, s: 30, l: 34, name: "藍の縞" },
      { h: 28, s: 20, l: 44, name: "茶の格子" }, { h: 40, s: 14, l: 88, name: "地の白" },
    ], toneBias: ["ltg", "d"], matte: true, technique: "トーナル配色" },
  { match: ["kurume kasuri", "久留米絣"], ja: "久留米絣", story: "藍地に白い十字",
    anchors: [
      { h: 218, s: 40, l: 26, name: "久留米の藍" }, { h: 42, s: 22, l: 90, name: "括りの白" },
      { h: 214, s: 30, l: 50, name: "褪せた藍" }, { h: 220, s: 24, l: 16, name: "濃紺の地" },
    ], toneBias: ["dp", "p"], matte: true, technique: "同一色相配色" },
  { match: ["hakata ori", "博多織"], ja: "博多織", story: "厚く締まる帯の紋",
    anchors: [
      { h: 348, s: 46, l: 32, name: "献上の臙脂" }, { h: 40, s: 24, l: 86, name: "白の献上柄" },
      { h: 220, s: 40, l: 26, name: "紺の地" }, { h: 44, s: 54, l: 58, name: "金の縁" },
    ], toneBias: ["dk", "p"], matte: true, technique: "リピテーション配色" },
  { match: ["bashofu", "芭蕉布"], ja: "芭蕉布", story: "糸芭蕉の張りのある布",
    anchors: [
      { h: 46, s: 26, l: 76, name: "芭蕉の生成り" }, { h: 24, s: 32, l: 42, name: "車輪梅の茶" },
      { h: 216, s: 34, l: 36, name: "藍の絣" }, { h: 60, s: 16, l: 60, name: "枯草の黄み" },
    ], toneBias: ["ltg", "d"], matte: true, technique: "ナチュラルハーモニー" },
  { match: ["jofu", "上布", "越後上布"], ja: "上布", story: "雪にさらした苧麻",
    anchors: [
      { h: 44, s: 16, l: 92, name: "雪ざらしの白" }, { h: 214, s: 32, l: 40, name: "細い藍の縞" },
      { h: 40, s: 20, l: 76, name: "苧麻の生成り" }, { h: 30, s: 14, l: 56, name: "織り目の影" },
    ], toneBias: ["p", "ltg"], matte: true, technique: "カマイユ配色" },
  { match: ["chirimen", "縮緬", "ちりめん"], ja: "縮緬", story: "しぼの立つ絹",
    anchors: [
      { h: 348, s: 40, l: 68, name: "縮緬の紅" }, { h: 40, s: 28, l: 88, name: "白縮緬" },
      { h: 286, s: 26, l: 52, name: "紫のしぼ" }, { h: 176, s: 26, l: 56, name: "浅葱のしぼ" },
    ], toneBias: ["sf", "lt"], matte: true, technique: "トーン・オン・トーン配色" },
  { match: ["kumihimo", "組紐", "くみひも"], ja: "組紐", story: "何本もの糸を組み上げる",
    anchors: [
      { h: 348, s: 56, l: 46, name: "組みの紅" }, { h: 44, s: 60, l: 58, name: "組みの金" },
      { h: 218, s: 46, l: 32, name: "組みの紺" }, { h: 42, s: 26, l: 90, name: "組みの白" },
    ], toneBias: ["v", "dp"], sparkle: true, technique: "リピテーション配色" },
  { match: ["sashiko", "刺子", "刺し子"], ja: "刺し子", story: "藍地に白い運針",
    anchors: [
      { h: 218, s: 42, l: 28, name: "刺し子の藍" }, { h: 42, s: 22, l: 92, name: "白い糸目" },
      { h: 214, s: 28, l: 48, name: "褪せた藍" }, { h: 40, s: 18, l: 70, name: "布の摩耗" },
    ], toneBias: ["dp", "p"], matte: true, technique: "セパレーション" },
  { match: ["kogin", "こぎん刺し", "こぎん"], ja: "こぎん刺し", story: "麻に木綿で埋める菱",
    anchors: [
      { h: 220, s: 38, l: 26, name: "こぎんの紺" }, { h: 42, s: 24, l: 90, name: "木綿の白" },
      { h: 218, s: 22, l: 54, name: "麻地の青み" }, { h: 30, s: 16, l: 66, name: "生成りの地" },
    ], toneBias: ["dp", "p"], matte: true, technique: "リピテーション配色" },
  { match: ["nishiki", "錦", "金襴"], ja: "錦", story: "金糸を織り込む",
    anchors: [
      { h: 44, s: 62, l: 54, name: "金襴の金" }, { h: 348, s: 54, l: 34, name: "錦の臙脂" },
      { h: 218, s: 48, l: 28, name: "錦の紺" }, { h: 140, s: 34, l: 30, name: "錦の緑" },
    ], toneBias: ["dk", "v"], sparkle: true, technique: "リピテーション配色" },
  { match: ["edo komon", "江戸小紋"], ja: "江戸小紋", story: "遠目には無地に見える",
    anchors: [
      { h: 30, s: 8, l: 40, name: "鮫小紋の鼠" }, { h: 42, s: 22, l: 88, name: "抜きの白点" },
      { h: 220, s: 24, l: 30, name: "紺鼠" }, { h: 24, s: 16, l: 56, name: "灰みの茶" },
    ], toneBias: ["g", "dkg"], matte: true, technique: "カマイユ配色" },
  // ===== 漆 =====
  { match: ["wajima", "輪島塗"], ja: "輪島塗", story: "何度も研いで重ねた黒",
    anchors: [
      { h: 20, s: 24, l: 9, name: "輪島の黒" }, { h: 6, s: 70, l: 40, name: "本朱" },
      { h: 44, s: 62, l: 54, name: "沈金の金" }, { h: 30, s: 20, l: 62, name: "研ぎ出しの照り" },
    ], toneBias: ["dk", "v"], sparkle: true, technique: "セパレーション" },
  { match: ["raden", "螺鈿", "らでん"], ja: "螺鈿", story: "貝が角度で色を変える",
    anchors: [
      { h: 20, s: 20, l: 10, name: "漆の黒地" }, { h: 186, s: 34, l: 78, name: "貝の青みの照り" },
      { h: 320, s: 26, l: 78, name: "貝の紅みの照り" }, { h: 46, s: 40, l: 84, name: "貝の金みの照り" },
    ], toneBias: ["dk", "p"], sparkle: true, technique: "対照トーン配色" },
  { match: ["chinkin", "沈金"], ja: "沈金", story: "彫った溝に金を沈める",
    anchors: [
      { h: 20, s: 22, l: 10, name: "黒漆" }, { h: 46, s: 66, l: 56, name: "沈めた金" },
      { h: 40, s: 34, l: 72, name: "線の光" }, { h: 24, s: 16, l: 24, name: "彫りの陰" },
    ], toneBias: ["dk", "dkg"], sparkle: true, technique: "対照トーン配色" },
  { match: ["negoro", "根来", "根来塗"], ja: "根来", story: "朱が擦れて黒が覗く",
    anchors: [
      { h: 8, s: 62, l: 44, name: "根来の朱" }, { h: 20, s: 26, l: 16, name: "下地の黒" },
      { h: 14, s: 40, l: 62, name: "擦れた朱の淡み" }, { h: 30, s: 20, l: 34, name: "境の褐" },
    ], toneBias: ["d", "dk"], matte: true, technique: "同一色相配色" },
  { match: ["tsugaru nuri", "津軽塗"], ja: "津軽塗", story: "研ぎ出すと斑が現れる",
    anchors: [
      { h: 20, s: 22, l: 14, name: "地の黒" }, { h: 6, s: 58, l: 42, name: "斑の朱" },
      { h: 46, s: 52, l: 58, name: "斑の黄" }, { h: 140, s: 26, l: 34, name: "斑の緑" },
    ], toneBias: ["dk", "d"], sparkle: true, technique: "リピテーション配色" },
  { match: ["aizu nuri", "会津塗"], ja: "会津塗", story: "朱に金の絵柄",
    anchors: [
      { h: 6, s: 66, l: 44, name: "会津の朱" }, { h: 44, s: 58, l: 56, name: "金の絵" },
      { h: 20, s: 22, l: 12, name: "黒の縁" }, { h: 30, s: 28, l: 70, name: "木地の照り" },
    ], toneBias: ["v", "dk"], sparkle: true, technique: "セパレーション" },

  // ===== 金工・硝子 =====
  { match: ["nambu tekki", "南部鉄器", "南部鉄"], ja: "南部鉄器", story: "鋳肌の黒とあられ",
    anchors: [
      { h: 210, s: 6, l: 18, name: "鋳肌の黒" }, { h: 24, s: 20, l: 34, name: "錆止めの褐" },
      { h: 210, s: 4, l: 52, name: "あられの陰影" }, { h: 30, s: 10, l: 66, name: "湯気の白" },
    ], toneBias: ["dkg", "dk"], matte: true, technique: "トーンのグラデーション" },
  { match: ["tsuiki", "鎚起銅器", "鎚起"], ja: "鎚起銅器", story: "叩いて締めた銅の肌",
    anchors: [
      { h: 18, s: 48, l: 42, name: "銅の赤" }, { h: 30, s: 34, l: 24, name: "煮色の暗褐" },
      { h: 160, s: 26, l: 44, name: "緑青のきざし" }, { h: 36, s: 40, l: 68, name: "鎚目の照り" },
    ], toneBias: ["d", "dk"], sparkle: true, technique: "同一色相配色" },
  { match: ["zogan", "象嵌", "ぞうがん"], ja: "象嵌", story: "地金に別の金属を嵌める",
    anchors: [
      { h: 30, s: 8, l: 16, name: "黒く焼いた地金" }, { h: 46, s: 62, l: 56, name: "嵌めた金" },
      { h: 210, s: 6, l: 76, name: "嵌めた銀" }, { h: 20, s: 34, l: 40, name: "赤銅の陰" },
    ], toneBias: ["dk", "v"], sparkle: true, technique: "セパレーション" },
  { match: ["shippo", "七宝", "七宝焼"], ja: "七宝", story: "金属に硝子を焼きつける",
    anchors: [
      { h: 196, s: 62, l: 44, name: "七宝の青" }, { h: 348, s: 56, l: 50, name: "七宝の紅" },
      { h: 44, s: 62, l: 58, name: "銀線の金" }, { h: 40, s: 20, l: 92, name: "白の釉" },
    ], toneBias: ["v", "dp"], sparkle: true, technique: "セパレーション" },
  { match: ["edo kiriko", "江戸切子"], ja: "江戸切子", story: "被せ硝子を削って白を出す",
    anchors: [
      { h: 220, s: 62, l: 34, name: "被せの瑠璃" }, { h: 200, s: 14, l: 94, name: "削り出した透明" },
      { h: 348, s: 56, l: 42, name: "被せの銅赤" }, { h: 210, s: 30, l: 70, name: "カットの反射" },
    ], toneBias: ["dp", "p"], sparkle: true, technique: "対照トーン配色" },
  { match: ["satsuma kiriko", "薩摩切子"], ja: "薩摩切子", story: "厚い被せがぼかしになる",
    anchors: [
      { h: 218, s: 56, l: 36, name: "薩摩の藍" }, { h: 212, s: 40, l: 66, name: "ぼかしの中間" },
      { h: 200, s: 12, l: 93, name: "透明の地" }, { h: 288, s: 34, l: 40, name: "被せの紫" },
    ], toneBias: ["dp", "lt"], sparkle: true, technique: "トーンのグラデーション" },
  { match: ["ryukyu glass", "琉球ガラス", "琉球硝子"], ja: "琉球ガラス", story: "気泡を抱いた厚い硝子",
    anchors: [
      { h: 186, s: 54, l: 60, name: "海の青緑" }, { h: 46, s: 76, l: 62, name: "陽の黄" },
      { h: 6, s: 66, l: 56, name: "泡盛びんの赤" }, { h: 200, s: 20, l: 88, name: "気泡の白" },
    ], toneBias: ["b", "v"], sparkle: true, technique: "リピテーション配色" },
  { match: ["tonbodama", "とんぼ玉", "蜻蛉玉"], ja: "とんぼ玉", story: "熔けた硝子に模様を巻く",
    anchors: [
      { h: 218, s: 56, l: 34, name: "地の瑠璃" }, { h: 46, s: 72, l: 60, name: "巻いた黄" },
      { h: 42, s: 22, l: 92, name: "白の縞" }, { h: 4, s: 62, l: 48, name: "点した赤" },
    ], toneBias: ["v", "dp"], sparkle: true, technique: "セパレーション" },

  // ===== 木・紙・郷土 =====
  { match: ["yosegi", "寄木細工"], ja: "寄木細工", story: "木の色だけで模様を組む",
    anchors: [
      { h: 40, s: 24, l: 84, name: "水木の白" }, { h: 26, s: 34, l: 34, name: "神代杉の黒褐" },
      { h: 36, s: 46, l: 60, name: "櫨の黄" }, { h: 14, s: 30, l: 46, name: "桜の赤み" },
    ], toneBias: ["sf", "d"], matte: true, technique: "リピテーション配色" },
  { match: ["magewappa", "曲げわっぱ"], ja: "曲げわっぱ", story: "杉を曲げて桜皮で綴じる",
    anchors: [
      { h: 38, s: 32, l: 80, name: "秋田杉の白木" }, { h: 30, s: 26, l: 56, name: "年輪の筋" },
      { h: 12, s: 34, l: 38, name: "桜皮の赤褐" }, { h: 42, s: 20, l: 92, name: "削りたての白" },
    ], toneBias: ["p", "ltg"], matte: true, technique: "同一色相配色" },
  { match: ["kiri tansu", "桐箪笥", "桐たんす"], ja: "桐箪笥", story: "白い桐に金具ひとつ",
    anchors: [
      { h: 44, s: 18, l: 82, name: "桐の白" }, { h: 40, s: 14, l: 62, name: "柾目の陰" },
      { h: 30, s: 8, l: 22, name: "鉄の金具" }, { h: 36, s: 30, l: 70, name: "経年の飴色" },
    ], toneBias: ["ltg", "p"], matte: true, technique: "カマイユ配色" },
  { match: ["takezaiku", "竹細工", "竹編み"], ja: "竹細工", story: "青竹が飴色に変わるまで",
    anchors: [
      { h: 76, s: 34, l: 58, name: "青竹" }, { h: 38, s: 44, l: 62, name: "晒し竹の黄" },
      { h: 28, s: 34, l: 36, name: "煤竹の褐" }, { h: 40, s: 22, l: 86, name: "白竹" },
    ], toneBias: ["sf", "d"], matte: true, technique: "トーンのグラデーション" },
  { match: ["kokeshi", "こけし"], ja: "こけし", story: "白木に赤と黒だけ",
    anchors: [
      { h: 40, s: 24, l: 88, name: "白木の胴" }, { h: 356, s: 66, l: 50, name: "描彩の赤" },
      { h: 30, s: 12, l: 16, name: "髪の黒" }, { h: 46, s: 60, l: 60, name: "菊の黄" },
    ], toneBias: ["p", "v"], matte: true, technique: "セパレーション" },
  { match: ["hariko", "張子", "張り子"], ja: "張子", story: "紙を貼って胡粉を塗る",
    anchors: [
      { h: 42, s: 20, l: 92, name: "胡粉の白" }, { h: 356, s: 68, l: 48, name: "張子の赤" },
      { h: 30, s: 12, l: 16, name: "描き線の墨" }, { h: 140, s: 40, l: 36, name: "彩色の緑" },
    ], toneBias: ["v", "p"], matte: true, technique: "セパレーション" },
  { match: ["daruma", "だるま", "達磨"], ja: "だるま", story: "赤い姿と金の眉",
    anchors: [
      { h: 358, s: 74, l: 46, name: "だるまの朱赤" }, { h: 44, s: 60, l: 58, name: "金の縁取り" },
      { h: 30, s: 10, l: 14, name: "描き入れの墨" }, { h: 40, s: 22, l: 90, name: "顔の胡粉" },
    ], toneBias: ["v", "dk"], matte: true, technique: "セパレーション" },
  { match: ["mizuhiki", "水引"], ja: "水引", story: "こよりに色を掛けて結ぶ",
    anchors: [
      { h: 356, s: 68, l: 48, name: "祝いの紅" }, { h: 42, s: 22, l: 94, name: "祝いの白" },
      { h: 46, s: 62, l: 58, name: "金の水引" }, { h: 210, s: 6, l: 74, name: "銀の水引" },
    ], toneBias: ["v", "p"], sparkle: true, technique: "セパレーション" },
  { match: ["origami", "折り紙", "おりがみ"], ja: "折り紙", story: "一枚の紙の裏と表",
    anchors: [
      { h: 356, s: 70, l: 56, name: "折り紙の赤" }, { h: 210, s: 62, l: 52, name: "折り紙の青" },
      { h: 48, s: 80, l: 62, name: "折り紙の黄" }, { h: 42, s: 22, l: 94, name: "裏の白" },
    ], toneBias: ["v", "b"], matte: true, technique: "リピテーション配色" },
  { match: ["karakami", "唐紙"], ja: "唐紙", story: "雲母が角度で光る",
    anchors: [
      { h: 44, s: 22, l: 88, name: "紙の生成り" }, { h: 40, s: 18, l: 74, name: "雲母の刷り" },
      { h: 30, s: 16, l: 52, name: "版木の陰" }, { h: 216, s: 18, l: 66, name: "藍の刷り" },
    ], toneBias: ["p", "ltg"], sparkle: true, technique: "フォ・カマイユ配色" },

  // ===== 日本の名所(分類では取り違えやすいので直接持つ) =====
  { match: ["sakurajima", "桜島"], ja: "桜島", story: "噴煙を上げつづける島",
    anchors: [
      { h: 24, s: 10, l: 20, name: "溶岩の黒" }, { h: 210, s: 8, l: 64, name: "噴煙の灰" },
      { h: 200, s: 44, l: 46, name: "錦江湾の青" }, { h: 46, s: 56, l: 62, name: "夕陽の照り" },
    ], toneBias: ["dkg", "dp"], matte: true, technique: "対照トーン配色" },
  { match: ["aso", "阿蘇"], ja: "阿蘇", story: "草千里とカルデラ",
    anchors: [
      { h: 92, s: 40, l: 48, name: "草千里の緑" }, { h: 24, s: 14, l: 24, name: "火口の黒" },
      { h: 46, s: 52, l: 66, name: "枯草の金" }, { h: 190, s: 30, l: 60, name: "湯だまりの碧" },
    ], toneBias: ["sf", "dk"], matte: true, technique: "対照色相配色" },
  { match: ["kumano", "熊野"], ja: "熊野", story: "杉木立の参詣道",
    anchors: [
      { h: 130, s: 30, l: 24, name: "杉木立の深緑" }, { h: 8, s: 66, l: 44, name: "社殿の朱" },
      { h: 30, s: 16, l: 46, name: "石段の苔むし" }, { h: 200, s: 14, l: 78, name: "山の靄" },
    ], toneBias: ["dp", "dk"], matte: true },
  { match: ["nachi", "那智"], ja: "那智", story: "朱の塔と一筋の滝",
    anchors: [
      { h: 6, s: 70, l: 46, name: "三重塔の朱" }, { h: 190, s: 16, l: 90, name: "滝の白" },
      { h: 140, s: 34, l: 26, name: "原生林の緑" }, { h: 30, s: 12, l: 40, name: "濡れた岩" },
    ], toneBias: ["v", "dp"], matte: true, technique: "対照色相配色" },
];

// 表から取り込んだ項目(tools/import-entries.py)も、手で書いた辞書と同じに扱う
function allEntries() {
  return typeof IMPORTED_ENTRIES !== "undefined"
    ? DICTIONARY.concat(IMPORTED_ENTRIES) : DICTIONARY;
}

// テーマ文字列を辞書エントリの列に解決する
function lookupTheme(input) {
  const raw = input.trim();
  const lower = raw.toLowerCase().replace(/[_\-]+/g, " ");
  // カタカナで書かれても引けるように、かなを寄せてから比べる
  const kana = typeof kanaNorm === "function" ? kanaNorm(raw) : raw;
  const hits = [];
  for (const entry of allEntries()) {
    for (const m of entry.match) {
      const isAscii = /^[a-z0-9 ]+$/.test(m);
      const found = isAscii
        ? new RegExp(`(^|[^a-z0-9])${m.replace(/ /g, "\\s*")}([^a-z0-9]|$)`).test(lower)
        : (raw.includes(m) ||
           (typeof kanaNorm === "function" && kana.includes(kanaNorm(m))));
      if (found) { hits.push({ entry, token: m }); break; }
    }
  }
  // 「夜」⊂「真夜中」のような包含ヒットは長い方だけ残す。
  // 表記が違っても入れ子とみなす。「クジャクチョウ」は
  // 「くじゃく」(孔雀)と「ちょう」(蝶)を含むが、まとめて落としたい。
  const norm = t => (typeof kanaNorm === "function" ? kanaNorm(t) : t).toLowerCase();
  const filtered = hits.filter(h =>
    !hits.some(o => o !== h && o.token.length > h.token.length &&
      (o.token.includes(h.token) || norm(o.token).includes(norm(h.token)))));
  return filtered.map(h => h.entry);
}

// 入力に含まれる色語・修飾語を拾う。色語はパレットの主役になる
function lookupColorWords(input) {
  const raw = input.trim();
  const lower = raw.toLowerCase().replace(/[_\-]+/g, " ");
  const hit = (list) => list.filter(e => e.match.some(m => /^[a-z ]+$/.test(m)
    ? new RegExp(`(^|[^a-z0-9])${m.replace(/ /g, "\\s*")}([^a-z0-9]|$)`).test(lower)
    : raw.includes(m)));

  // 「青緑」が「青」「緑」も拾ってしまうので、長い語のヒットを優先する
  const colors = hit(COLOR_WORDS);
  const kept = colors.filter(c => !colors.some(o => o !== c &&
    o.match.some(om => c.match.some(cm => om.length > cm.length && om.includes(cm)))));
  // 「紫禁城」の「紫」、「青丹」の「青」のように、
  // 物語辞書や伝統色名の長い語の内部に埋もれた色字は色語として拾わない
  const themeHits = [
    ...allEntries().flatMap(e => e.match.filter(m => raw.includes(m))),
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
