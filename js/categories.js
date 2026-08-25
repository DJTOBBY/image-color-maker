/* 言葉の「分類」から色を継ぐしくみ。

   辞書に一語ずつ色を書いていくとキリがない。けれど
   「宮古島」を知らなくても、名前の末尾から島だとは分かる。
   島の色を継がせれば、辞書に無い土地にもふさわしい色が出せる。

   当て方は2通り:
     1. 語尾   — 日本の地名は地形が名前に出る(宮古島・中禅寺湖・華厳の滝)
     2. 対応表 — 語尾に出ない言葉(バリ・トスカーナ)。
                 tools/build-categories.py がビルド時に作る

   辞書に書かれた言葉が優先で、これは当たらなかったときだけ使う。
   手で書いた色のほうが、分類から継いだ色より必ず良いため。 */

// 「沢山」「一山」のように、地形の字で終わるのに土地ではない言葉。
// 語尾からの推測が効いてしまうため、ここで除いておく。
const NOT_A_PLACE = new Set(["沢山", "一山", "本山", "鉱山", "登山", "下山", "築山", "氷山",
  "半島国", "群島", "列島", "半分", "全山", "銀山", "金山", "坑道"]);

// 分類から辞書エントリを組み立てる
function categoryEntry(cat, word) {
  return {
    ja: word,
    story: cat.story,
    anchors: cat.anchors.map(a => ({ ...a })),
    toneBias: [...(cat.toneBias || [])],
    matte: !!cat.matte,
    sparkle: !!cat.sparkle,
    technique: cat.technique || null,
    fromCategory: cat.ja,
  };
}

function lookupCategory(input) {
  if (typeof CATEGORIES === "undefined") return null;
  const raw = (input || "").trim();
  if (!raw) return null;

  // 対応表を先に見る。ビルド時に説明文で裏を取っているので、
  // 語尾から推し量るより確かなため(「松山」は山ではなく市)。
  const key = typeof CATEGORY_MAP !== "undefined" ? CATEGORY_MAP[raw] : null;
  if (key) {
    const c = CATEGORIES.find(c => c.key === key);
    if (c) return categoryEntry(c, raw);
  }

  // 地形の字で終わるが土地ではない言葉。語尾からの推測をここで止める。
  if (NOT_A_PLACE.has(raw)) return null;

  // 語尾で判定する。「火山」と「山」のように重なる語尾は長いほうを採る。
  let best = null;
  for (const c of CATEGORIES) {
    for (const s of (c.suffix || [])) {
      // 分類名そのものの入力(「滝」「漆」)も拾う。
      // 辞書に載っている言葉はここへ来る前に解決済みなので、取り違えは起きない。
      if (!raw.endsWith(s)) continue;
      if (!best || s.length > best.s.length) best = { c, s };
    }
  }
  return best ? categoryEntry(best.c, raw) : null;
}
