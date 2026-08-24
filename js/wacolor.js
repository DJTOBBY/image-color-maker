/* 日本の伝統色辞書
   - 入力語として「蘇芳」「瑠璃」などを受け付ける
   - 生成した色に最も近い伝統色名を逆引きして資料に添える
*/

const WACOLORS = [
  // 桜・紅・赤系
  { name: "桜色", kana: "さくらいろ", hex: "#fef4f4" },
  { name: "薄紅", kana: "うすべに", hex: "#f0908d" },
  { name: "鴇色", kana: "ときいろ", hex: "#f4b3c2" },
  { name: "撫子色", kana: "なでしこいろ", hex: "#eebbcb" },
  { name: "紅梅色", kana: "こうばいいろ", hex: "#f2a0a1" },
  { name: "桃色", kana: "ももいろ", hex: "#f09199" },
  { name: "薔薇色", kana: "ばらいろ", hex: "#e9546b" },
  { name: "今様色", kana: "いまよういろ", hex: "#d0576b" },
  { name: "紅色", kana: "べにいろ", hex: "#d7003a" },
  { name: "真紅", kana: "しんく", hex: "#a22041" },
  { name: "茜色", kana: "あかねいろ", hex: "#b7282e" },
  { name: "緋色", kana: "ひいろ", hex: "#d3381c" },
  { name: "朱色", kana: "しゅいろ", hex: "#eb6101" },
  { name: "蘇芳", kana: "すおう", hex: "#9e3d3f" },
  { name: "臙脂", kana: "えんじ", hex: "#b94047" },
  { name: "小豆色", kana: "あずきいろ", hex: "#96514d" },
  { name: "海老茶", kana: "えびちゃ", hex: "#773c30" },
  { name: "弁柄色", kana: "べんがらいろ", hex: "#8f2e14" },
  // 茶・金系
  { name: "栗色", kana: "くりいろ", hex: "#762f07" },
  { name: "焦茶", kana: "こげちゃ", hex: "#6f4b3e" },
  { name: "煤竹色", kana: "すすたけいろ", hex: "#6f514c" },
  { name: "琥珀色", kana: "こはくいろ", hex: "#bf783a" },
  { name: "飴色", kana: "あめいろ", hex: "#deb068" },
  { name: "黄土色", kana: "おうどいろ", hex: "#c39143" },
  { name: "土色", kana: "つちいろ", hex: "#bc763c" },
  { name: "柿色", kana: "かきいろ", hex: "#ed6d3d" },
  { name: "橙色", kana: "だいだいいろ", hex: "#ee7800" },
  { name: "柑子色", kana: "こうじいろ", hex: "#f6ad49" },
  { name: "杏色", kana: "あんずいろ", hex: "#f7b977" },
  { name: "山吹色", kana: "やまぶきいろ", hex: "#f8b500" },
  { name: "金色", kana: "こんじき", hex: "#e6b422" },
  { name: "芥子色", kana: "からしいろ", hex: "#d0af4c" },
  { name: "利休茶", kana: "りきゅうちゃ", hex: "#a59564" },
  { name: "亜麻色", kana: "あまいろ", hex: "#d6c6af" },
  // 黄系
  { name: "黄色", kana: "きいろ", hex: "#ffd900" },
  { name: "菜の花色", kana: "なのはないろ", hex: "#ffec47" },
  { name: "鳥の子色", kana: "とりのこいろ", hex: "#fff1cf" },
  { name: "生成り色", kana: "きなりいろ", hex: "#fbfaf5" },
  { name: "象牙色", kana: "ぞうげいろ", hex: "#f8f4e6" },
  // 緑系
  { name: "鶯色", kana: "うぐいすいろ", hex: "#928c36" },
  { name: "抹茶色", kana: "まっちゃいろ", hex: "#c5c56a" },
  { name: "若草色", kana: "わかくさいろ", hex: "#c3d825" },
  { name: "萌黄", kana: "もえぎ", hex: "#aacf53" },
  { name: "若葉色", kana: "わかばいろ", hex: "#b9d08b" },
  { name: "苔色", kana: "こけいろ", hex: "#69821b" },
  { name: "草色", kana: "くさいろ", hex: "#7b8d42" },
  { name: "松葉色", kana: "まつばいろ", hex: "#839b5c" },
  { name: "常磐色", kana: "ときわいろ", hex: "#007b43" },
  { name: "緑", kana: "みどり", hex: "#3eb370" },
  { name: "深緑", kana: "ふかみどり", hex: "#00552e" },
  { name: "千歳緑", kana: "ちとせみどり", hex: "#316745" },
  { name: "青竹色", kana: "あおたけいろ", hex: "#7ebeab" },
  { name: "若竹色", kana: "わかたけいろ", hex: "#68be8d" },
  { name: "緑青色", kana: "ろくしょういろ", hex: "#47885e" },
  { name: "青磁色", kana: "せいじいろ", hex: "#7ebea5" },
  { name: "白緑", kana: "びゃくろく", hex: "#d6e9ca" },
  // 青系
  { name: "瓶覗", kana: "かめのぞき", hex: "#a2d7dd" },
  { name: "水色", kana: "みずいろ", hex: "#bce2e8" },
  { name: "空色", kana: "そらいろ", hex: "#a0d8ef" },
  { name: "勿忘草色", kana: "わすれなぐさいろ", hex: "#89c3eb" },
  { name: "浅葱色", kana: "あさぎいろ", hex: "#00a3af" },
  { name: "新橋色", kana: "しんばしいろ", hex: "#59b9c6" },
  { name: "納戸色", kana: "なんどいろ", hex: "#008899" },
  { name: "青碧", kana: "せいへき", hex: "#478384" },
  { name: "天色", kana: "あまいろ", hex: "#2ca9e1" },
  { name: "露草色", kana: "つゆくさいろ", hex: "#38a1db" },
  { name: "青", kana: "あお", hex: "#0095d9" },
  { name: "瑠璃色", kana: "るりいろ", hex: "#1e50a2" },
  { name: "瑠璃紺", kana: "るりこん", hex: "#19448e" },
  { name: "紺碧", kana: "こんぺき", hex: "#007bbb" },
  { name: "群青色", kana: "ぐんじょういろ", hex: "#4c6cb3" },
  { name: "藍色", kana: "あいいろ", hex: "#165e83" },
  { name: "紺色", kana: "こんいろ", hex: "#223a70" },
  { name: "濃紺", kana: "のうこん", hex: "#0f2350" },
  { name: "鉄紺", kana: "てつこん", hex: "#17184b" },
  { name: "藍鼠", kana: "あいねず", hex: "#6c848d" },
  { name: "錆浅葱", kana: "さびあさぎ", hex: "#5c9291" },
  // 紫系
  { name: "藤色", kana: "ふじいろ", hex: "#bbbcde" },
  { name: "菖蒲色", kana: "あやめいろ", hex: "#674196" },
  { name: "菫色", kana: "すみれいろ", hex: "#7058a3" },
  { name: "桔梗色", kana: "ききょういろ", hex: "#5654a2" },
  { name: "江戸紫", kana: "えどむらさき", hex: "#745399" },
  { name: "古代紫", kana: "こだいむらさき", hex: "#895b8a" },
  { name: "紫", kana: "むらさき", hex: "#884898" },
  { name: "茄子紺", kana: "なすこん", hex: "#824880" },
  { name: "葡萄色", kana: "えびいろ", hex: "#522f60" },
  { name: "牡丹色", kana: "ぼたんいろ", hex: "#e7609e" },
  { name: "躑躅色", kana: "つつじいろ", hex: "#e95295" },
  { name: "梅紫", kana: "うめむらさき", hex: "#aa4c8f" },
  // 白・鼠・黒系
  { name: "白", kana: "しろ", hex: "#ffffff" },
  { name: "胡粉色", kana: "ごふんいろ", hex: "#fffffc" },
  { name: "月白", kana: "げっぱく", hex: "#eaf4fc" },
  { name: "灰桜", kana: "はいざくら", hex: "#e8d3d1" },
  { name: "白鼠", kana: "しろねず", hex: "#dcdddd" },
  { name: "銀鼠", kana: "ぎんねず", hex: "#afafb0" },
  { name: "鼠色", kana: "ねずみいろ", hex: "#949495" },
  { name: "利休鼠", kana: "りきゅうねずみ", hex: "#888e7e" },
  { name: "青鈍", kana: "あおにび", hex: "#6b7b6e" },
  { name: "墨", kana: "すみ", hex: "#595857" },
  { name: "黒", kana: "くろ", hex: "#2b2b2b" },
  { name: "漆黒", kana: "しっこく", hex: "#0d0015" },
];

// 襲の色目(平安の季節配色)。テーマ語としてヒットすると配色ごと使われる
const KASANE = [
  { match: ["白梅", "梅"], ja: "梅がさね", season: "春", story: "襲の色目・梅 — 表は白、裏に紅",
    colors: ["#fef4f4", "#9e3d3f", "#f2a0a1"] },
  { match: ["山吹"], ja: "山吹がさね", season: "春", story: "襲の色目・山吹 — 表は朽葉、裏に黄",
    colors: ["#f8b500", "#bc763c", "#fff1cf"] },
  { match: ["藤"], ja: "藤がさね", season: "春", story: "襲の色目・藤 — 表は薄紫、裏に青",
    colors: ["#bbbcde", "#674196", "#a0d8ef"] },
  { match: ["菖蒲", "あやめ"], ja: "菖蒲がさね", season: "夏", story: "襲の色目・菖蒲 — 表は青、裏に紅梅",
    colors: ["#5654a2", "#f2a0a1", "#316745"] },
  { match: ["紅葉", "もみじ"], ja: "紅葉がさね", season: "秋", story: "襲の色目・紅葉 — 表は紅、裏に濃い蘇芳",
    colors: ["#d3381c", "#9e3d3f", "#f8b500", "#69821b"] },
  { match: ["菊"], ja: "菊がさね", season: "秋", story: "襲の色目・菊 — 表は白、裏に蘇芳",
    colors: ["#fffffc", "#9e3d3f", "#928c36"] },
  { match: ["雪の下"], ja: "雪の下がさね", season: "冬", story: "襲の色目・雪の下 — 表は白、裏に紅梅",
    colors: ["#ffffff", "#f2a0a1", "#316745"] },
  { match: ["松重", "松"], ja: "松がさね", season: "冬", story: "襲の色目・松 — 常磐の緑に蘇芳",
    colors: ["#007b43", "#00552e", "#9e3d3f"] },
];

const WaColor = (() => {
  let labCache = null;
  function ensureLab() {
    if (!labCache) labCache = WACOLORS.map(w => ({ ...w, lab: hexToLab(w.hex) }));
    return labCache;
  }
  // 最も近い伝統色を返す(遠すぎる場合はnull)
  function nearest(hex, maxDist = 26) {
    const lab = hexToLab(hex);
    let best = null, bestD = Infinity;
    for (const w of ensureLab()) {
      const d = labDist(lab, w.lab);
      if (d < bestD) { bestD = d; best = w; }
    }
    return bestD <= maxDist ? best : null;
  }

  // テーマ語として伝統色・襲の色目を解決し、辞書エントリ形式で返す
  function lookup(input) {
    const entries = [];
    for (const k of KASANE) {
      if (k.match.some(m => input.includes(m))) {
        entries.push({
          ja: k.ja, story: k.story,
          anchors: k.colors.map((hex, i) => {
            const [h, s, l] = rgbToHsl(...hexToRgb(hex));
            const role = ["表", "裏", "間", "添え"][i] || `其の${i + 1}`;
            return { h, s, l, name: `${k.ja}の${role}` };
          }),
          toneBias: ["sf", "dp"], matte: true, technique: "カマイユ配色",
        });
        break; // 襲はひとつで十分
      }
    }
    for (const w of WACOLORS) {
      if (w.name !== "白" && w.name !== "黒" && w.name !== "青" && w.name !== "紫" && w.name !== "緑"
          && input.includes(w.name)) {
        const [h, s, l] = rgbToHsl(...hexToRgb(w.hex));
        entries.push({
          ja: w.name, story: `伝統色「${w.name}(${w.kana})」の記憶`,
          anchors: [{ h, s, l, name: w.name }],
          toneBias: ["dp", "sf"],
        });
      }
    }
    return entries;
  }

  return { nearest, lookup, WACOLORS, KASANE };
})();
