/* 作品事例の登録と表示。
   data/works.json(共有・全員に見える)に加えて、
   ブラウザに保存した自分の作品(localStorage)も扱う。
   写真は縮小してからdataURLで保存するので、サーバーもアップロードも要らない。 */

const MyWorks = (() => {
  const KEY = "csp-works";
  const MAX_EDGE = 900;     // 長辺をこの大きさに縮める
  const QUALITY = 0.82;
  const LIMIT_MB = 4.5;     // localStorageの現実的な上限

  function all() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch (_) { return []; }
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function usedMB() {
    return (localStorage.getItem(KEY) || "").length / 1024 / 1024;
  }

  // 写真を縮小してdataURLにする(そのまま保存すると容量を食い尽くすため)
  function shrink(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const cv = document.createElement("canvas");
        cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(cv.toDataURL("image/jpeg", QUALITY));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("画像を読み込めませんでした")); };
      img.src = url;
    });
  }

  async function add({ file, title, note, theme, colors, beads }) {
    const image = await shrink(file);
    const list = all();
    const work = {
      id: Date.now().toString(36),
      title: title || theme || "無題の作品",
      note: note || "",
      theme: theme || "",
      // テーマの言葉をそのままキーワードにする(「京都 秋」→ ["京都","秋"])
      keywords: (theme || "").split(/[\s　]+/).filter(Boolean),
      colors: colors || [],
      beads: beads || [],
      image,
      savedAt: new Date().toISOString(),
    };
    list.unshift(work);
    save(list);
    if (usedMB() > LIMIT_MB) {
      // 入りきらないときは古いものから外す
      while (usedMB() > LIMIT_MB && list.length > 1) { list.pop(); save(list); }
    }
    return work;
  }

  function remove(id) {
    save(all().filter(w => w.id !== id));
  }

  // テーマに紐づく作品(自分の保存分)
  function forTheme(input) {
    const lower = input.toLowerCase();
    return all().filter(w =>
      (w.theme && w.theme.toLowerCase() === lower) ||
      (w.keywords || []).some(k => k && lower.includes(String(k).toLowerCase())));
  }

  return { all, add, remove, forTheme, usedMB };
})();
