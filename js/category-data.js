/* 分類ごとの色(自動生成 — tools/build-categories.py で再生成)
   元データ: data/categories.json / data/category-words.txt
   CATEGORIES: 分類そのものの色。suffix は日本の地名の語尾。
   CATEGORY_MAP: 語尾に出ない言葉の対応表。Wikipediaの一行説明から作成。
   説明文の出典: ウィキペディア日本語版 (CC BY-SA 4.0) — 本文は含めず分類名のみを利用 */
const CATEGORIES = [
  {
    "key": "capital",
    "ja": "都市",
    "suffix": [
      "市街",
      "旧市街"
    ],
    "story": "石畳と灯り — 街の色を継いで",
    "anchors": [
      {
        "h": 30,
        "s": 8,
        "l": 52,
        "name": "石畳の灰"
      },
      {
        "h": 36,
        "s": 62,
        "l": 58,
        "name": "窓の灯"
      },
      {
        "h": 214,
        "s": 30,
        "l": 28,
        "name": "夜の空"
      },
      {
        "h": 20,
        "s": 32,
        "l": 68,
        "name": "壁の煉瓦"
      }
    ],
    "toneBias": [
      "d",
      "dk"
    ]
  },
  {
    "key": "onsen",
    "ja": "温泉",
    "suffix": [
      "温泉"
    ],
    "story": "湯けむりと乳白の湯 — 温泉地の色を継いで",
    "anchors": [
      {
        "h": 40,
        "s": 12,
        "l": 88,
        "name": "乳白の湯"
      },
      {
        "h": 45,
        "s": 55,
        "l": 62,
        "name": "湯の花の黄"
      },
      {
        "h": 20,
        "s": 20,
        "l": 30,
        "name": "濡れた岩"
      },
      {
        "h": 200,
        "s": 10,
        "l": 78,
        "name": "立ちのぼる湯気"
      }
    ],
    "toneBias": [
      "ltg",
      "sf"
    ],
    "matte": true
  },
  {
    "key": "volcano",
    "ja": "火山",
    "suffix": [
      "火山"
    ],
    "story": "溶岩の黒と硫黄の黄 — 火山の色を継いで",
    "anchors": [
      {
        "h": 20,
        "s": 8,
        "l": 16,
        "name": "溶岩の黒"
      },
      {
        "h": 50,
        "s": 78,
        "l": 55,
        "name": "硫黄の黄"
      },
      {
        "h": 12,
        "s": 55,
        "l": 38,
        "name": "焼けた赤褐"
      },
      {
        "h": 210,
        "s": 8,
        "l": 62,
        "name": "噴煙の灰"
      }
    ],
    "toneBias": [
      "dk",
      "dp"
    ],
    "matte": true
  },
  {
    "key": "island",
    "ja": "島",
    "suffix": [
      "島",
      "諸島",
      "列島"
    ],
    "story": "海に囲まれた土地 — 島の色を継いで",
    "anchors": [
      {
        "h": 192,
        "s": 62,
        "l": 58,
        "name": "浅瀬の碧"
      },
      {
        "h": 214,
        "s": 58,
        "l": 36,
        "name": "沖の藍"
      },
      {
        "h": 42,
        "s": 30,
        "l": 88,
        "name": "白砂"
      },
      {
        "h": 130,
        "s": 38,
        "l": 32,
        "name": "島影の濃緑"
      }
    ],
    "toneBias": [
      "b",
      "dp"
    ],
    "technique": "色相のグラデーション"
  },
  {
    "key": "lake",
    "ja": "湖",
    "suffix": [
      "湖",
      "沼",
      "池",
      "湖畔"
    ],
    "story": "動かない水の面 — 湖の色を継いで",
    "anchors": [
      {
        "h": 205,
        "s": 40,
        "l": 38,
        "name": "湖心の藍"
      },
      {
        "h": 178,
        "s": 30,
        "l": 55,
        "name": "水面の碧"
      },
      {
        "h": 110,
        "s": 30,
        "l": 34,
        "name": "岸辺の緑"
      },
      {
        "h": 210,
        "s": 10,
        "l": 82,
        "name": "朝靄の白"
      }
    ],
    "toneBias": [
      "sf",
      "g"
    ],
    "matte": true,
    "technique": "トーンオントーン配色"
  },
  {
    "key": "waterfall",
    "ja": "滝",
    "suffix": [
      "滝",
      "の滝",
      "瀑"
    ],
    "story": "落ちる水の白 — 滝の色を継いで",
    "anchors": [
      {
        "h": 195,
        "s": 14,
        "l": 92,
        "name": "飛沫の白"
      },
      {
        "h": 186,
        "s": 45,
        "l": 36,
        "name": "滝壺の碧"
      },
      {
        "h": 100,
        "s": 32,
        "l": 30,
        "name": "濡れた苔"
      },
      {
        "h": 30,
        "s": 8,
        "l": 42,
        "name": "岩の鈍色"
      }
    ],
    "toneBias": [
      "p",
      "dp"
    ]
  },
  {
    "key": "river",
    "ja": "川",
    "suffix": [
      "川",
      "河",
      "渓流"
    ],
    "story": "流れてゆく水 — 川の色を継いで",
    "anchors": [
      {
        "h": 196,
        "s": 42,
        "l": 66,
        "name": "浅瀬の水色"
      },
      {
        "h": 208,
        "s": 32,
        "l": 42,
        "name": "淵の藍"
      },
      {
        "h": 40,
        "s": 12,
        "l": 66,
        "name": "河原の砂利"
      },
      {
        "h": 95,
        "s": 36,
        "l": 44,
        "name": "岸の若草"
      }
    ],
    "toneBias": [
      "lt",
      "sf"
    ]
  },
  {
    "key": "valley",
    "ja": "渓谷",
    "suffix": [
      "渓谷",
      "峡谷",
      "峡",
      "渓"
    ],
    "story": "削られた岩と渓流 — 渓谷の色を継いで",
    "anchors": [
      {
        "h": 28,
        "s": 18,
        "l": 40,
        "name": "岩肌の褐"
      },
      {
        "h": 182,
        "s": 40,
        "l": 40,
        "name": "渓流の碧"
      },
      {
        "h": 14,
        "s": 62,
        "l": 44,
        "name": "崖の紅葉"
      },
      {
        "h": 90,
        "s": 26,
        "l": 28,
        "name": "杉の深緑"
      }
    ],
    "toneBias": [
      "dp",
      "d"
    ],
    "matte": true
  },
  {
    "key": "cave",
    "ja": "洞窟",
    "suffix": [
      "洞窟",
      "鍾乳洞",
      "洞"
    ],
    "story": "光の届かない場所 — 洞窟の色を継いで",
    "anchors": [
      {
        "h": 240,
        "s": 12,
        "l": 12,
        "name": "闇の黒"
      },
      {
        "h": 40,
        "s": 20,
        "l": 82,
        "name": "石灰の生成り"
      },
      {
        "h": 190,
        "s": 45,
        "l": 45,
        "name": "地下水の青"
      },
      {
        "h": 30,
        "s": 25,
        "l": 45,
        "name": "岩の陰"
      }
    ],
    "toneBias": [
      "dkg",
      "dk"
    ],
    "matte": true
  },
  {
    "key": "cape",
    "ja": "岬",
    "suffix": [
      "岬",
      "半島",
      "崎",
      "碕"
    ],
    "story": "海へ突き出した先端 — 岬の色を継いで",
    "anchors": [
      {
        "h": 210,
        "s": 52,
        "l": 42,
        "name": "荒磯の青"
      },
      {
        "h": 210,
        "s": 6,
        "l": 58,
        "name": "岩の灰"
      },
      {
        "h": 95,
        "s": 30,
        "l": 42,
        "name": "風の草"
      },
      {
        "h": 200,
        "s": 14,
        "l": 90,
        "name": "波頭の白"
      }
    ],
    "toneBias": [
      "sf",
      "dp"
    ]
  },
  {
    "key": "beach",
    "ja": "浜",
    "suffix": [
      "浜",
      "海岸",
      "海浜",
      "砂浜",
      "浦",
      "松原"
    ],
    "story": "波が寄せる砂の際 — 浜の色を継いで",
    "anchors": [
      {
        "h": 40,
        "s": 34,
        "l": 84,
        "name": "砂の生成り"
      },
      {
        "h": 188,
        "s": 52,
        "l": 62,
        "name": "寄せる波の碧"
      },
      {
        "h": 214,
        "s": 48,
        "l": 44,
        "name": "沖の青"
      },
      {
        "h": 30,
        "s": 18,
        "l": 58,
        "name": "流木の灰茶"
      }
    ],
    "toneBias": [
      "lt",
      "b"
    ]
  },
  {
    "key": "dune",
    "ja": "砂丘",
    "suffix": [
      "砂丘",
      "砂漠"
    ],
    "story": "風がつくる起伏 — 砂の色を継いで",
    "anchors": [
      {
        "h": 38,
        "s": 52,
        "l": 68,
        "name": "陽の砂"
      },
      {
        "h": 28,
        "s": 30,
        "l": 46,
        "name": "斜面の影"
      },
      {
        "h": 265,
        "s": 18,
        "l": 52,
        "name": "くぼみの紫影"
      },
      {
        "h": 45,
        "s": 20,
        "l": 90,
        "name": "空の白"
      }
    ],
    "toneBias": [
      "sf",
      "lt"
    ],
    "matte": true,
    "technique": "ドミナントカラー配色"
  },
  {
    "key": "highland",
    "ja": "高原",
    "suffix": [
      "高原",
      "牧場",
      "草原",
      "平原",
      "平野"
    ],
    "story": "風が渡る草の海 — 高原の色を継いで",
    "anchors": [
      {
        "h": 88,
        "s": 42,
        "l": 52,
        "name": "草の黄緑"
      },
      {
        "h": 200,
        "s": 48,
        "l": 72,
        "name": "高い空の水色"
      },
      {
        "h": 46,
        "s": 45,
        "l": 62,
        "name": "枯草の金"
      },
      {
        "h": 140,
        "s": 26,
        "l": 34,
        "name": "遠い林"
      }
    ],
    "toneBias": [
      "b",
      "lt"
    ],
    "technique": "ナチュラルハーモニー"
  },
  {
    "key": "marsh",
    "ja": "湿原",
    "suffix": [
      "湿原",
      "湿地"
    ],
    "story": "水を含んだ草の原 — 湿原の色を継いで",
    "anchors": [
      {
        "h": 48,
        "s": 38,
        "l": 58,
        "name": "枯草の金"
      },
      {
        "h": 195,
        "s": 14,
        "l": 62,
        "name": "水の鈍色"
      },
      {
        "h": 105,
        "s": 24,
        "l": 38,
        "name": "沈んだ緑"
      },
      {
        "h": 30,
        "s": 16,
        "l": 30,
        "name": "泥炭の褐"
      }
    ],
    "toneBias": [
      "ltg",
      "d"
    ],
    "matte": true,
    "technique": "トーナル配色"
  },
  {
    "key": "ice",
    "ja": "氷",
    "suffix": [
      "氷河",
      "流氷",
      "氷原"
    ],
    "story": "凍った水の青 — 氷の色を継いで",
    "anchors": [
      {
        "h": 196,
        "s": 30,
        "l": 88,
        "name": "氷の青白"
      },
      {
        "h": 205,
        "s": 45,
        "l": 62,
        "name": "割れ目の碧"
      },
      {
        "h": 220,
        "s": 22,
        "l": 40,
        "name": "影の藍"
      },
      {
        "h": 0,
        "s": 0,
        "l": 97,
        "name": "雪の白"
      }
    ],
    "toneBias": [
      "p",
      "lt"
    ],
    "technique": "トーングラデーション"
  },
  {
    "key": "mountain",
    "ja": "山",
    "suffix": [
      "山",
      "岳",
      "峰",
      "峠",
      "嶺",
      "山地",
      "高地",
      "連峰",
      "山脈"
    ],
    "story": "重なる稜線 — 山の色を継いで",
    "anchors": [
      {
        "h": 218,
        "s": 28,
        "l": 46,
        "name": "遠山の青"
      },
      {
        "h": 138,
        "s": 30,
        "l": 36,
        "name": "山肌の緑"
      },
      {
        "h": 216,
        "s": 12,
        "l": 86,
        "name": "霞の白"
      },
      {
        "h": 28,
        "s": 20,
        "l": 32,
        "name": "岩の褐"
      }
    ],
    "toneBias": [
      "g",
      "sf"
    ],
    "matte": true
  },
  {
    "key": "forest",
    "ja": "森",
    "suffix": [
      "樹海",
      "原生林",
      "森林",
      "林"
    ],
    "story": "木々に閉ざされた場所 — 森の色を継いで",
    "anchors": [
      {
        "h": 128,
        "s": 40,
        "l": 26,
        "name": "深緑"
      },
      {
        "h": 88,
        "s": 46,
        "l": 54,
        "name": "木漏れ日の黄緑"
      },
      {
        "h": 28,
        "s": 36,
        "l": 30,
        "name": "幹の焦茶"
      },
      {
        "h": 150,
        "s": 24,
        "l": 44,
        "name": "苔の緑"
      }
    ],
    "toneBias": [
      "dp",
      "d"
    ],
    "matte": true,
    "technique": "ナチュラルハーモニー"
  },
  {
    "key": "port",
    "ja": "港",
    "suffix": [
      "港",
      "港町",
      "埠頭"
    ],
    "story": "船と潮と錆 — 港の色を継いで",
    "anchors": [
      {
        "h": 206,
        "s": 42,
        "l": 44,
        "name": "潮の青"
      },
      {
        "h": 16,
        "s": 48,
        "l": 42,
        "name": "錆の赤茶"
      },
      {
        "h": 40,
        "s": 14,
        "l": 88,
        "name": "白い倉庫"
      },
      {
        "h": 46,
        "s": 60,
        "l": 58,
        "name": "灯りの黄"
      }
    ],
    "toneBias": [
      "dp",
      "sf"
    ]
  },
  {
    "key": "castle",
    "ja": "城",
    "suffix": [
      "城",
      "城跡",
      "城址"
    ],
    "story": "石垣と白壁 — 城の色を継いで",
    "anchors": [
      {
        "h": 40,
        "s": 10,
        "l": 90,
        "name": "白漆喰"
      },
      {
        "h": 210,
        "s": 8,
        "l": 44,
        "name": "石垣の灰"
      },
      {
        "h": 220,
        "s": 10,
        "l": 20,
        "name": "瓦の墨"
      },
      {
        "h": 120,
        "s": 30,
        "l": 28,
        "name": "松の緑"
      }
    ],
    "toneBias": [
      "ltg",
      "dkg"
    ],
    "matte": true,
    "technique": "セパレーション配色"
  },
  {
    "key": "shrine",
    "ja": "神社",
    "suffix": [
      "神社",
      "神宮",
      "大社",
      "鳥居"
    ],
    "story": "朱の鳥居と杜 — 神社の色を継いで",
    "anchors": [
      {
        "h": 8,
        "s": 72,
        "l": 46,
        "name": "鳥居の朱"
      },
      {
        "h": 118,
        "s": 30,
        "l": 26,
        "name": "杜の深緑"
      },
      {
        "h": 38,
        "s": 26,
        "l": 82,
        "name": "白木の膚"
      },
      {
        "h": 210,
        "s": 6,
        "l": 66,
        "name": "玉砂利の灰"
      }
    ],
    "toneBias": [
      "v",
      "dp"
    ],
    "technique": "対照色相配色"
  },
  {
    "key": "temple",
    "ja": "寺",
    "suffix": [
      "寺",
      "院",
      "大仏",
      "伽藍"
    ],
    "story": "瓦と金と苔 — 寺の色を継いで",
    "anchors": [
      {
        "h": 216,
        "s": 8,
        "l": 24,
        "name": "瓦の墨"
      },
      {
        "h": 44,
        "s": 62,
        "l": 52,
        "name": "金の荘厳"
      },
      {
        "h": 10,
        "s": 55,
        "l": 40,
        "name": "朱の柱"
      },
      {
        "h": 106,
        "s": 28,
        "l": 36,
        "name": "庭の苔"
      }
    ],
    "toneBias": [
      "dk",
      "dp"
    ],
    "matte": true
  },
  {
    "key": "garden",
    "ja": "庭園",
    "suffix": [
      "庭園",
      "公園",
      "庭"
    ],
    "story": "苔と白砂と松 — 庭の色を継いで",
    "anchors": [
      {
        "h": 108,
        "s": 32,
        "l": 34,
        "name": "苔の緑"
      },
      {
        "h": 42,
        "s": 16,
        "l": 88,
        "name": "白砂"
      },
      {
        "h": 130,
        "s": 26,
        "l": 24,
        "name": "松の濃緑"
      },
      {
        "h": 25,
        "s": 12,
        "l": 50,
        "name": "沓脱石の灰"
      }
    ],
    "toneBias": [
      "dp",
      "ltg"
    ],
    "matte": true,
    "technique": "トーンオントーン配色"
  },
  {
    "key": "cloud",
    "ja": "雲",
    "suffix": [
      "雲"
    ],
    "story": "空に浮かぶかたち — 雲の色を継いで",
    "anchors": [
      {
        "h": 45,
        "s": 12,
        "l": 96,
        "name": "雲の白"
      },
      {
        "h": 220,
        "s": 18,
        "l": 72,
        "name": "雲の影"
      },
      {
        "h": 205,
        "s": 58,
        "l": 62,
        "name": "抜けた空の青"
      },
      {
        "h": 30,
        "s": 30,
        "l": 84,
        "name": "陽のあたる縁"
      }
    ],
    "toneBias": [
      "p",
      "lt"
    ],
    "technique": "トーングラデーション"
  },
  {
    "key": "storm",
    "ja": "嵐",
    "suffix": [
      "台風",
      "嵐"
    ],
    "story": "荒れる空と雨 — 嵐の色を継いで",
    "anchors": [
      {
        "h": 215,
        "s": 10,
        "l": 34,
        "name": "鉛色の空"
      },
      {
        "h": 150,
        "s": 12,
        "l": 46,
        "name": "荒れた海の緑灰"
      },
      {
        "h": 200,
        "s": 8,
        "l": 74,
        "name": "雨脚の銀"
      },
      {
        "h": 230,
        "s": 14,
        "l": 18,
        "name": "雲の底"
      }
    ],
    "toneBias": [
      "d",
      "dkg"
    ],
    "matte": true,
    "technique": "トーナル配色"
  },
  {
    "key": "snow",
    "ja": "雪",
    "suffix": [
      "雪原",
      "樹氷"
    ],
    "story": "降り積もった白 — 雪の色を継いで",
    "anchors": [
      {
        "h": 0,
        "s": 0,
        "l": 98,
        "name": "新雪の白"
      },
      {
        "h": 212,
        "s": 26,
        "l": 78,
        "name": "雪の青影"
      },
      {
        "h": 215,
        "s": 10,
        "l": 56,
        "name": "曇り空の鈍色"
      },
      {
        "h": 25,
        "s": 14,
        "l": 34,
        "name": "枝の黒"
      }
    ],
    "toneBias": [
      "p",
      "ltg"
    ],
    "technique": "カマイユ配色"
  },
  {
    "key": "mist",
    "ja": "霧",
    "suffix": [
      "霧",
      "靄"
    ],
    "story": "輪郭が溶ける — 霧の色を継いで",
    "anchors": [
      {
        "h": 40,
        "s": 6,
        "l": 86,
        "name": "乳灰"
      },
      {
        "h": 200,
        "s": 16,
        "l": 74,
        "name": "滲む水色"
      },
      {
        "h": 120,
        "s": 12,
        "l": 58,
        "name": "遠ざかる緑"
      },
      {
        "h": 220,
        "s": 8,
        "l": 46,
        "name": "奥の陰"
      }
    ],
    "toneBias": [
      "ltg",
      "p"
    ],
    "matte": true,
    "technique": "フォカマイユ配色"
  },
  {
    "key": "ceramic",
    "ja": "焼きもの",
    "suffix": [
      "焼",
      "窯",
      "陶器"
    ],
    "story": "土と釉薬 — 焼きものの色を継いで",
    "anchors": [
      {
        "h": 26,
        "s": 30,
        "l": 44,
        "name": "土の褐"
      },
      {
        "h": 200,
        "s": 34,
        "l": 52,
        "name": "釉薬の青"
      },
      {
        "h": 40,
        "s": 14,
        "l": 84,
        "name": "貫入の生成り"
      },
      {
        "h": 210,
        "s": 6,
        "l": 34,
        "name": "窯変の鉄"
      }
    ],
    "toneBias": [
      "d",
      "sf"
    ],
    "matte": true
  },
  {
    "key": "paper",
    "ja": "紙",
    "suffix": [
      "和紙"
    ],
    "story": "楮のけば立ち — 紙の色を継いで",
    "anchors": [
      {
        "h": 44,
        "s": 26,
        "l": 90,
        "name": "生成りの白"
      },
      {
        "h": 38,
        "s": 18,
        "l": 76,
        "name": "楮の膚"
      },
      {
        "h": 30,
        "s": 10,
        "l": 22,
        "name": "墨"
      },
      {
        "h": 48,
        "s": 34,
        "l": 66,
        "name": "経年の飴色"
      }
    ],
    "toneBias": [
      "p",
      "ltg"
    ],
    "matte": true,
    "technique": "ドミナントトーン配色"
  },
  {
    "key": "textile",
    "ja": "染織",
    "suffix": [
      "織",
      "染",
      "紬",
      "絣",
      "織物",
      "染物"
    ],
    "story": "藍と茜と生成り — 染織の色を継いで",
    "anchors": [
      {
        "h": 218,
        "s": 44,
        "l": 30,
        "name": "藍"
      },
      {
        "h": 4,
        "s": 58,
        "l": 44,
        "name": "茜"
      },
      {
        "h": 44,
        "s": 30,
        "l": 86,
        "name": "生成り"
      },
      {
        "h": 48,
        "s": 46,
        "l": 58,
        "name": "刈安の黄"
      }
    ],
    "toneBias": [
      "dp",
      "sf"
    ],
    "matte": true
  },
  {
    "key": "lacquer",
    "ja": "漆",
    "suffix": [
      "漆器",
      "蒔絵",
      "漆"
    ],
    "story": "漆黒に朱と金 — 漆の色を継いで",
    "anchors": [
      {
        "h": 20,
        "s": 20,
        "l": 10,
        "name": "漆黒"
      },
      {
        "h": 6,
        "s": 72,
        "l": 42,
        "name": "根来の朱"
      },
      {
        "h": 44,
        "s": 64,
        "l": 54,
        "name": "蒔絵の金"
      },
      {
        "h": 30,
        "s": 30,
        "l": 70,
        "name": "螺鈿の照り"
      }
    ],
    "toneBias": [
      "dk",
      "v"
    ],
    "technique": "セパレーション配色"
  },
  {
    "key": "glass",
    "ja": "硝子",
    "suffix": [
      "硝子",
      "ガラス",
      "モザイク"
    ],
    "story": "光を通す色 — 硝子の色を継いで",
    "anchors": [
      {
        "h": 196,
        "s": 55,
        "l": 70,
        "name": "透ける水色"
      },
      {
        "h": 268,
        "s": 42,
        "l": 48,
        "name": "紫の硝子"
      },
      {
        "h": 46,
        "s": 70,
        "l": 60,
        "name": "琥珀"
      },
      {
        "h": 150,
        "s": 40,
        "l": 46,
        "name": "緑硝子"
      }
    ],
    "toneBias": [
      "b",
      "lt"
    ],
    "technique": "対照色相配色"
  }
];

const CATEGORY_MAP = {
  "アイスランド": "island",
  "アタカマ": "dune",
  "アッシジ": "capital",
  "アテネ": "capital",
  "アナトリア": "island",
  "アムステルダム": "capital",
  "アンデス": "mountain",
  "イエローストーン": "garden",
  "イスタンブール": "capital",
  "イビサ": "island",
  "ウィーン": "capital",
  "ウユニ": "highland",
  "ウラジオストク": "capital",
  "オアハカ": "capital",
  "オスロ": "capital",
  "カムチャツカ": "island",
  "ガラパゴス": "island",
  "キューバ": "island",
  "クスコ": "capital",
  "クレタ": "island",
  "グアム": "island",
  "グラナダ": "capital",
  "ケルン": "capital",
  "コペンハーゲン": "capital",
  "コルシカ": "island",
  "コロンボ": "capital",
  "ゴビ": "dune",
  "サイパン": "island",
  "サハラ": "dune",
  "サルデーニャ": "island",
  "サンクトペテルブルク": "capital",
  "サントリーニ": "island",
  "ザルツブルク": "capital",
  "ザンジバル": "island",
  "シチリア": "island",
  "シドニー": "capital",
  "シャウエン": "capital",
  "ステンドグラス": "glass",
  "ストックホルム": "capital",
  "セビリア": "capital",
  "セブ": "capital",
  "セレンゲティ": "garden",
  "タヒチ": "island",
  "タリン": "capital",
  "チベット": "highland",
  "ナポリ": "capital",
  "ナミブ": "dune",
  "ニュージーランド": "island",
  "ニース": "capital",
  "ハイデルベルク": "capital",
  "ハノイ": "capital",
  "ハバナ": "capital",
  "バイカル": "lake",
  "バルセロナ": "capital",
  "バンクーバー": "island",
  "パラオ": "island",
  "パリ": "capital",
  "ヒマラヤ": "mountain",
  "ピレネー": "mountain",
  "フィジー": "island",
  "フィヨルド": "ice",
  "フィレンツェ": "capital",
  "ブダペスト": "capital",
  "プラハ": "capital",
  "ヘルシンキ": "capital",
  "ベルゲン": "capital",
  "ペトラ": "valley",
  "ホイアン": "port",
  "ボラボラ": "island",
  "ボルドー": "capital",
  "ポルト": "capital",
  "マウイ": "island",
  "マカオ": "capital",
  "マダガスカル": "island",
  "マドリード": "capital",
  "マヨルカ": "island",
  "マラケシュ": "capital",
  "ミコノス": "island",
  "ミラノ": "capital",
  "メルボルン": "capital",
  "モスクワ": "capital",
  "モンゴル": "highland",
  "モーリシャス": "island",
  "ヤンゴン": "capital",
  "ユカタン": "island",
  "ヨセミテ": "garden",
  "ラップランド": "island",
  "リオデジャネイロ": "capital",
  "リスボン": "capital",
  "ロッキー": "mountain",
  "ロンドン": "capital",
  "ローマ": "capital",
  "ヴィクトリア": "lake",
  "ヴェネツィア": "capital",
  "七宝": "glass",
  "七滝": "waterfall",
  "下関": "capital",
  "久米": "island",
  "九重": "volcano",
  "乳頭": "mountain",
  "五島": "capital",
  "京都": "capital",
  "仙台": "castle",
  "伊万里": "capital",
  "伊予": "capital",
  "伊勢": "capital",
  "伊豆": "island",
  "会津": "island",
  "佐渡": "island",
  "備前": "capital",
  "八ヶ岳": "mountain",
  "八幡平": "volcano",
  "八重山": "mountain",
  "六甲": "mountain",
  "出羽": "mountain",
  "出雲": "island",
  "函館": "capital",
  "別府": "capital",
  "剣山": "island",
  "北京": "capital",
  "北海道": "island",
  "十和田": "lake",
  "千葉": "capital",
  "南アルプス": "island",
  "南部": "mountain",
  "博多": "capital",
  "博多織": "textile",
  "友禅": "textile",
  "台北": "capital",
  "名古屋": "capital",
  "和紙": "paper",
  "土佐": "capital",
  "壱岐": "island",
  "大山": "capital",
  "大島紬": "island",
  "奄美": "island",
  "妙高": "capital",
  "姫路": "castle",
  "安芸": "capital",
  "宮古": "capital",
  "宮城": "castle",
  "富山": "mountain",
  "富良野": "capital",
  "対馬": "island",
  "小笠原": "island",
  "尾道": "island",
  "屋久": "island",
  "山形": "capital",
  "岩木": "volcano",
  "川越": "river",
  "帯広": "capital",
  "弘前": "capital",
  "彦根": "capital",
  "志野": "mountain",
  "恐山": "volcano",
  "慶良間": "island",
  "指宿": "capital",
  "播磨": "capital",
  "日光": "island",
  "日向": "capital",
  "早池峰": "mountain",
  "旭川": "capital",
  "月山": "volcano",
  "有田": "capital",
  "東京": "capital",
  "松山": "capital",
  "松本": "castle",
  "松江": "capital",
  "根室": "capital",
  "桜島": "island",
  "横浜": "capital",
  "死海": "lake",
  "比叡": "capital",
  "水戸": "capital",
  "浅間": "volcano",
  "淡路": "island",
  "済州": "island",
  "熊野": "mountain",
  "熱海": "capital",
  "猪苗代": "capital",
  "田沢": "lake",
  "由布院": "onsen",
  "甲府": "capital",
  "甲斐": "capital",
  "登別": "capital",
  "白川郷": "river",
  "白磁": "ceramic",
  "白神": "mountain",
  "益子": "ceramic",
  "盛岡": "castle",
  "知内": "capital",
  "知床": "island",
  "石見": "island",
  "石鎚": "mountain",
  "磐梯": "capital",
  "礼文": "island",
  "祖母": "mountain",
  "神戸": "capital",
  "秋保": "onsen",
  "稚内": "capital",
  "立山": "mountain",
  "竹富": "capital",
  "箱根": "volcano",
  "紀伊": "island",
  "結城紬": "castle",
  "絣": "textile",
  "網走": "capital",
  "織部": "mountain",
  "美濃": "capital",
  "美瑛": "capital",
  "若狭": "capital",
  "茨城": "capital",
  "草津": "capital",
  "華厳": "river",
  "蔵王": "onsen",
  "薩摩": "island",
  "蝦夷": "island",
  "袋田": "onsen",
  "西表": "island",
  "西陣": "capital",
  "讃岐": "island",
  "赤城": "mountain",
  "越後": "island",
  "道後": "onsen",
  "那智": "mountain",
  "那覇": "capital",
  "金沢": "capital",
  "金継ぎ": "ceramic",
  "釧路": "capital",
  "銀山": "mountain",
  "鎌倉": "river",
  "開聞": "island",
  "阿波": "capital",
  "阿蘇": "volcano",
  "陶器": "ceramic",
  "隠岐": "island",
  "雲仙": "onsen",
  "雲南": "capital",
  "霧島": "island",
  "青ヶ島": "island",
  "青磁": "ceramic",
  "飛騨": "capital",
  "高山": "capital",
  "高松": "capital",
  "高野": "capital",
  "鳴子": "castle",
  "鹿児島": "island",
  "黒川": "onsen"
};
