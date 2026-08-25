/* 画面制御と資料シートの描画 */

const EXAMPLE_POOL = [
  "TOKYO NIGHT", "SETOUCHI SEA", "KYOTO AUTUMN",
  "DESERT SUNSET", "FOREST FOLKLORE", "NEW ENGLAND",
  "雨の紫陽花", "花火の夜", "純喫茶クリームソーダ",
  "大正ロマン", "STAINED GLASS", "人魚の午後",
  "金沢 雪", "HAWAII SUNSET", "魔法の図書館",
  "JAZZ MIDNIGHT", "クリスマスの朝", "Y2K TOKYO",
  "2016 SPRING", "紅葉がさね", "エーゲ海の夏",
];
// 定番2つ+ランダム4つで毎回すこし変える
const EXAMPLES = [
  ...EXAMPLE_POOL.slice(0, 2),
  ...EXAMPLE_POOL.slice(2).sort(() => Math.random() - 0.5).slice(0, 4),
];

const $ = sel => document.querySelector(sel);
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------- ワークシートSVG ----------
// PCCS 12色相環(使用色相に丸印)
function hueCircleSVG(usedHueNos) {
  const size = 260, cx = size / 2, cy = size / 2, r = 92;
  let out = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="PCCS色相環">`;
  PCCS.HUES.forEach((hue, i) => {
    const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(ang) * r, y = cy + Math.sin(ang) * r;
    const hex = hslToHex(hue.deg, 78, 50);
    const used = usedHueNos.includes(hue.no);
    out += `<rect x="${x - 13}" y="${y - 13}" width="26" height="26" rx="3" fill="${hex}"/>`;
    if (used) out += `<circle cx="${x}" cy="${y}" r="21" fill="none" stroke="#c0392b" stroke-width="2.5"/>`;
    const lx = cx + Math.cos(ang) * (r + 32), ly = cy + Math.sin(ang) * (r + 32);
    out += `<text x="${lx}" y="${ly + 3}" text-anchor="middle" font-size="9" fill="#6f6a62">${hue.no}:${hue.sym}</text>`;
  });
  out += `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10" fill="#6f6a62" letter-spacing="2">色相環</text></svg>`;
  return out;
}

// PCCSトーン図(使用トーンに丸印)
function toneMapSVG(usedToneKeys, mainHueDeg) {
  const POS = {
    p: [120, 52], lt: [196, 74], b: [272, 100],
    ltg: [112, 128], sf: [190, 146], s: [272, 168], v: [344, 168],
    g: [106, 208], d: [184, 218], dp: [268, 236],
    dkg: [112, 286], dk: [192, 292],
  };
  const NEUTRAL_POS = { W: [40, 46], ltGy: [40, 108], mGy: [40, 170], dkGy: [40, 232], Bk: [40, 294] };
  const NEUTRAL_HEX = { W: "#f5f5f5", ltGy: "#c9c9c9", mGy: "#8f8f8f", dkGy: "#4c4c4c", Bk: "#161616" };
  const hue = mainHueDeg ?? 218;
  let out = `<svg width="400" height="340" viewBox="0 0 400 340" role="img" aria-label="PCCSトーン図">`;
  for (const [key, [x, y]] of Object.entries(NEUTRAL_POS)) {
    out += `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" fill="${NEUTRAL_HEX[key]}" stroke="#ddd"/>`;
    if (usedToneKeys.includes(key)) out += `<circle cx="${x}" cy="${y}" r="19" fill="none" stroke="#c0392b" stroke-width="2.5"/>`;
    out += `<text x="${x}" y="${y + 24}" text-anchor="middle" font-size="8" fill="#6f6a62">${key}</text>`;
  }
  for (const [key, [x, y]] of Object.entries(POS)) {
    const t = PCCS.TONES[key];
    out += `<circle cx="${x}" cy="${y}" r="15" fill="${hslToHex(hue, t.cs, t.cl)}"/>`;
    if (usedToneKeys.includes(key)) out += `<circle cx="${x}" cy="${y}" r="22" fill="none" stroke="#c0392b" stroke-width="2.5"/>`;
    out += `<text x="${x}" y="${y + 29}" text-anchor="middle" font-size="9" fill="#6f6a62">${key}</text>`;
  }
  out += `<text x="230" y="330" text-anchor="middle" font-size="10" fill="#6f6a62" letter-spacing="2">トーン(明度×彩度)</text></svg>`;
  return out;
}

// フッターに置いたTOHO BEADSロゴを、資料(PDF)にも同じ形で入れる
function tohoLogoSVG() {
  const src = document.querySelector(".site-footer .toho-logo");
  if (!src) return "";
  const svg = src.cloneNode(true);
  svg.classList.add("sheet-logo");
  return svg.outerHTML;
}

// ---------- シート描画 ----------
function renderSheet(palette, matches) {
  const { colors } = palette;
  const usedHues = [...new Set(colors.filter(c => !c.pccs.neutral).map(c => c.pccs.hueNo))];
  const usedTones = [...new Set(colors.map(c => c.pccs.toneKey))];
  const mainColor = colors.find(c => !c.pccs.neutral);
  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });

  const band = colors.map(c =>
    `<div class="swatch${c.locked ? " is-locked" : ""}" style="background:${c.hex}"></div>`).join("");
  const caption = colors.map(c => `
    <div class="cap">
      <button type="button" class="lock-btn no-print${c.locked ? " is-locked" : ""}"
        data-hex="${esc(c.hex)}" data-name="${esc(c.name)}"
        aria-pressed="${c.locked ? "true" : "false"}"
        title="${c.locked ? "この色の固定をやめる" : "この色を残して他を作り直す"}">${LOCK_ICON(c.locked)}</button>
      <b>${esc(c.name)}</b>${c.hex.toUpperCase()}<br>${c.pccs.neutral ? esc(c.pccs.toneJa) : esc(c.pccs.label)}
    </div>
  `).join("");

  const rows = colors.map((c, i) => {
    const cards = (matches[i] || []).map(({ bead, owned }) => {
      const inner = `
        <span class="b-img" style="background-color:${esc(bead.hex)};background-image:url('${esc(bead.img)}')"></span>
        <span class="b-meta">
          <b>TOHO No.${esc(bead.code)}</b>
          <span class="b-finish">${esc(bead.shape)} / ${esc(bead.finish)}</span>
          <span class="buy-mark">${owned ? '<span class="owned-mark">手持ち</span> ' : ""}${bead.buy ? "購入ページ ↗" : ""}</span>
        </span>`;
      return bead.buy
        ? `<a class="bead-card" href="${esc(bead.buy)}" target="_blank" rel="noopener">${inner}</a>`
        : `<span class="bead-card">${inner}</span>`;
    }).join("");
    const pccsLine = c.pccs.neutral
      ? esc(c.pccs.toneJa)
      : `${c.pccs.hueNo}:${esc(c.pccs.hueSym)} ${esc(c.pccs.hueJa)} / ${esc(c.pccs.toneJa)}`;
    return `
      <div class="bead-row${c.locked ? " is-locked" : ""}">
        <div class="color-cell">
          <button type="button" class="dot" style="background:${c.hex}"
            data-swap="${i}" data-hex="${esc(c.hex)}"
            title="この色を選び直す"></button>
          <div class="color-meta">
            <b>${esc(c.name)}</b>
            ${c.seedCode ? `<span class="seed-mark">使用: No.${esc(c.seedCode)}</span>` : ""}
            ${c.hex.toUpperCase()}
            ${c.wa ? `<span class="wa-name">≒ ${esc(c.wa.name)}(${esc(c.wa.kana)})</span>` : ""}
            <span class="pccs-tag">${pccsLine}</span>
          </div>
        </div>
        <div class="bead-cards">${cards}</div>
      </div>`;
  }).join("");

  // 作品事例(共有データ + このブラウザに登録した自分の作品)
  const workItems = [
    ...BeadMatcher.worksFor(palette.input),
    ...(typeof MyWorks !== "undefined" ? MyWorks.forTheme(palette.input) : []),
  ];
  const worksHtml = workItems.length ? `
    <div class="works">
      <h3>この物語で作った作品</h3>
      <div class="works-grid">
        ${workItems.map(w => `
          <figure class="work-card">
            <img src="${esc(w.image)}" alt="${esc(w.title)}" loading="lazy">
            <figcaption><b>${esc(w.title)}</b>${w.note ? `<span>${esc(w.note)}</span>` : ""}</figcaption>
          </figure>`).join("")}
      </div>
    </div>` : "";

  $("#result").innerHTML = `
    <div class="sheet-head">
      <div class="sheet-series">COLOR STORY PALETTE</div>
      <h2 class="sheet-title">${esc(palette.input)}</h2>
      ${palette.story ? `<p class="sheet-story">— ${esc(palette.story)} —</p>` : ""}
      <div class="mood-words">${palette.moodWords.map(w => `<span>${esc(w)}</span>`).join("・")}</div>
      ${palette.associations && palette.associations.length
        ? `<div class="assoc-words">この配色が呼び起こすもの: ${palette.associations.map(esc).join("・")}</div>` : ""}
    </div>

    <div class="palette-band">${band}</div>
    <div class="palette-caption">${caption}</div>

    <div class="technique-box">
      <span class="t-label">配色技法</span>
      <span class="t-name">${esc(palette.technique)}</span>
      <span class="t-note">${esc(palette.techniqueNote)}</span>
    </div>

    <div class="bead-rows">${rows}</div>
    ${worksHtml}

    <div class="worksheet">
      <h3>カラーワークシート(使用色相・トーン)</h3>
      <div class="ws-figures">
        <figure>${hueCircleSVG(usedHues)}<figcaption>PCCS色相環</figcaption></figure>
        <figure>${toneMapSVG(usedTones, mainColor ? mainColor.h : undefined)}<figcaption>PCCSトーン</figcaption></figure>
      </div>
    </div>

    <div class="sheet-footer">
      <span class="sheet-brand">
        ${tohoLogoSVG()}
        <span>COLOR STORY PALETTE</span>
      </span>
      <span>${today}</span>
    </div>`;

  $("#result").hidden = false;
  $("#print-bar").hidden = false;
}

// 鍵のアイコン。絵文字は環境で見え方が変わるので、SVGで描いて開閉を確実に区別する
const LOCK_ICON = (locked) => locked
  ? `<svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true">
       <path d="M2.6 5.2V3.4a2.9 2.9 0 015.8 0v1.8" stroke="currentColor" stroke-width="1.3" fill="none"/>
       <rect x="0.9" y="5.2" width="9.2" height="7.1" rx="1.3" fill="currentColor"/>
     </svg>`
  : `<svg width="11" height="13" viewBox="0 0 11 13" fill="none" aria-hidden="true">
       <path d="M2.6 5.2V3.4a2.9 2.9 0 015.8 0" stroke="currentColor" stroke-width="1.3" fill="none"/>
       <rect x="0.9" y="5.2" width="9.2" height="7.1" rx="1.3" fill="none"
             stroke="currentColor" stroke-width="1.3"/>
     </svg>`;

// ---------- 残す色(ロック) ----------
// キーはHEX。パレットを作り直しても、この色だけは必ず残る
let lockedColors = new Map();

function lockedList() {
  return [...lockedColors.values()];
}

function toggleLock(hex, name) {
  const key = hex.toLowerCase();
  if (lockedColors.has(key)) lockedColors.delete(key);
  else lockedColors.set(key, { hex, name });
  updateVaryHint();
}

function updateVaryHint() {
  const n = lockedColors.size;
  const hint = $("#vary-hint");
  if (!hint) return;
  hint.textContent = n
    ? `${n}色を残して、他の色だけを作り直します`
    : "同じテーマのまま、配色技法だけを変えて提案します";
  $("#unlock-btn").hidden = n === 0;
}

// ---------- 使いたいビーズ(品番3つまで) ----------
const SEED_IDS = ["#seed-1", "#seed-2", "#seed-3"];

// 入力された品番を、実在するビーズに解決する
function resolveSeedBeads() {
  const found = [];
  SEED_IDS.forEach((sel, i) => {
    const raw = $(sel).value.trim();
    const chip = $(`#seed-chip-${i + 1}`);
    if (!raw) { chip.textContent = ""; chip.className = "seed-chip"; return; }
    const bead = BeadMatcher.findByCode(raw);
    if (bead) {
      chip.className = "seed-chip is-found";
      chip.innerHTML = `<i style="background:${bead.hex}"></i>${esc(bead.shape)}`;
      found.push(bead);
    } else {
      chip.className = "seed-chip is-missing";
      chip.textContent = "見つかりません";
    }
  });
  $("#seed-clear").hidden = !SEED_IDS.some(s => $(s).value.trim());
  // 折りたたんでいても、いま何色指定しているか分かるようにする
  $("#seed-badge").textContent = found.length ? `${found.length}色を指定中` : "";
  return found;
}

// 使いたいビーズを「残す色」として登録する。
// こうすると、そのビーズの色が必ずパレットに入り、周りだけが組み替わる
function seedsToLocked(beads) {
  return beads.map(b => {
    const wa = WaColor.nearest(b.hex, 40);
    return { hex: b.hex, name: wa ? wa.name : `No.${b.code}`, seedCode: b.code };
  });
}

// ---------- 保存したパレット / 作品の一覧 ----------
function refreshCounts() {
  const s = SavedPalettes.all().length;
  const w = MyWorks.all().length;
  $("#saved-count").textContent = s ? ` ${s}` : "";
  $("#works-count").textContent = w ? ` ${w}` : "";
}

function closeModal() { $("#modal").hidden = true; }

function openModal(kind) {
  const body = $("#modal-body");
  if (kind === "saved") {
    $("#modal-title").textContent = "保存したパレット";
    const list = SavedPalettes.all();
    body.innerHTML = list.length ? `
      <div class="saved-grid">
        ${list.map(s => `
          <div class="saved-card">
            <button type="button" class="saved-open" data-id="${esc(s.id)}">
              <span class="saved-band">${s.swatches.map(h => `<i style="background:${h}"></i>`).join("")}</span>
              <b>${esc(s.input)}</b>
              <span class="saved-meta">${s.swatches.length}色 / ${esc(s.technique || "")}</span>
            </button>
            <button type="button" class="saved-del" data-del="${esc(s.id)}" title="削除">×</button>
          </div>`).join("")}
      </div>` : `<p class="modal-note">まだ保存したパレットはありません。資料の下の「このパレットを保存」から残せます。</p>`;
  } else {
    $("#modal-title").textContent = "登録した作品";
    const list = MyWorks.all();
    body.innerHTML = list.length ? `
      <div class="works-grid modal-works">
        ${list.map(w => `
          <figure class="work-card">
            <img src="${w.image}" alt="${esc(w.title)}">
            <figcaption>
              <b>${esc(w.title)}</b>
              ${w.theme ? `<span class="work-theme" data-theme="${esc(w.theme)}">${esc(w.theme)}</span>` : ""}
              ${w.note ? `<span>${esc(w.note)}</span>` : ""}
              ${w.colors?.length ? `<span class="work-band">${w.colors.map(c => `<i style="background:${c.hex}"></i>`).join("")}</span>` : ""}
              <button type="button" class="saved-del" data-delwork="${esc(w.id)}" title="削除">×</button>
            </figcaption>
          </figure>`).join("")}
      </div>` : `<p class="modal-note">まだ作品はありません。パレットを作ったあと「作品を登録」から写真を追加できます。</p>`;
  }

  body.onclick = e => {
    const open = e.target.closest(".saved-open");
    if (open) {
      const s = SavedPalettes.all().find(x => x.id === open.dataset.id);
      if (s) {
        $("#theme-input").value = s.input;
        $("#color-count").value = String(s.count);
        lockedColors.clear();
        (s.locked || []).forEach(l => lockedColors.set(l.hex.toLowerCase(), l));
        updateVaryHint();
        closeModal();
        run(s.variant || 0);
      }
      return;
    }
    const del = e.target.closest("[data-del]");
    if (del) { SavedPalettes.remove(del.dataset.del); refreshCounts(); openModal("saved"); return; }
    const delw = e.target.closest("[data-delwork]");
    if (delw) { MyWorks.remove(delw.dataset.delwork); refreshCounts(); openModal("works"); return; }
    // 作品のテーマを押すと、その配色をもう一度作る
    const th = e.target.closest(".work-theme");
    if (th) {
      $("#theme-input").value = th.dataset.theme;
      lockedColors.clear(); updateVaryHint(); closeModal(); run(0);
    }
  };
  $("#modal").hidden = false;
}

// ---------- 色を手で選び直す ----------
// いま出ている色をすべて固定したうえで、選ばれた1色だけを別の色に差し替える。
// こうすると「この色だけ変えたい」が、他の色を巻き込まずに叶う
function replaceColor(index, newColor) {
  const cur = window.__lastResult?.palette?.colors;
  if (!cur) return;
  lockedColors.clear();
  cur.forEach((c, i) => {
    const use = (i === index) ? newColor : c;
    lockedColors.set(use.hex.toLowerCase(), { hex: use.hex, name: use.name });
  });
  updateVaryHint();
  run(window.__lastResult.palette.variant || 0);
}

// 色の丸を押したときに開く、差し替え候補
function openSwapPanel(row, index, hex) {
  row.querySelectorAll(".swap-panel").forEach(el => el.remove());
  const cands = WaColor.neighbors(hex, 12);
  const panel = document.createElement("div");
  panel.className = "swap-panel no-print";
  panel.innerHTML = `
    <div class="swap-title">近い伝統色から選び直す</div>
    <div class="swap-list">
      ${cands.map(c => `
        <button type="button" class="swap-chip" data-hex="${esc(c.hex)}" data-name="${esc(c.name)}"
          title="${esc(c.name)}${c.kana ? `(${esc(c.kana)})` : ""}">
          <span class="swap-dot" style="background:${c.hex}"></span>
          <span class="swap-name">${esc(c.name)}</span>
        </button>`).join("")}
    </div>`;
  panel.addEventListener("click", e => {
    const chip = e.target.closest(".swap-chip");
    if (!chip) return;
    replaceColor(index, { hex: chip.dataset.hex, name: chip.dataset.name });
  });
  row.appendChild(panel);
}

// ---------- イベント ----------
async function run(variant = 0) {
  const input = $("#theme-input").value.trim();
  if (!input) return;
  const btn = variant ? $("#vary-btn") : $("#generate-btn");
  const label = btn.textContent;
  btn.disabled = true; btn.textContent = "配色中…";
  try {
    await BeadMatcher.load();

    // 「このビーズを使う」に入れた品番は、その色を必ずパレットに含める
    const seedBeads = resolveSeedBeads();
    let locked = lockedList();
    if (seedBeads.length) {
      // 画面で色を残しているときは、それも一緒に活かす(重複はビーズ側を優先)
      const seeds = seedsToLocked(seedBeads);
      const hexes = new Set(seeds.map(s => s.hex.toLowerCase()));
      locked = [...seeds, ...locked.filter(l => !hexes.has(l.hex.toLowerCase()))];
    }

    // 入力欄に品番だけを打った場合も、そのビーズを主役にする
    let beadSeed = null;
    const looksLikeCode = /^[#\s]*(toho\s*)?(no\.?\s*)?[0-9A-Za-z][0-9A-Za-z\-]*$/i.test(input)
      && /[0-9]/.test(input) && lookupTheme(input).length === 0;
    if (!locked.length && looksLikeCode) {
      beadSeed = BeadMatcher.findByCode(input);
      if (beadSeed) locked = seedsToLocked([beadSeed]);
    }

    const palette = generatePalette(
      input, Number($("#color-count").value), variant, locked);

    // 使ったビーズを資料に書き添える
    const usedSeeds = seedBeads.length ? seedBeads : (beadSeed ? [beadSeed] : []);
    if (usedSeeds.length) {
      palette.seedBeads = usedSeeds;
      const list = usedSeeds.map(b => `No.${b.code}`).join("・");
      palette.story = seedBeads.length
        ? `${list} を使った配色`
        : `TOHO ${list}(${usedSeeds[0].shape} / ${usedSeeds[0].finish})を主役に組んだ配色`;
    }
    const matches = BeadMatcher.match(palette.colors, {
      sparkle: palette.sparkle, matte: palette.matte, perColor: 3,
    });
    renderSheet(palette, matches);
    window.__lastResult = { palette, matches };
    // 技法を直接指定したときは「別の配色」を出せないので隠す
    $("#vary-bar").hidden = !palette.canVary;
    // このパレットのシェアリンクをURLに反映する(variantも共有できるように)
    const params = new URLSearchParams({ t: input, n: String(palette.colors.length) });
    if (variant) params.set("v", String(variant));
    history.replaceState(null, "", `${location.pathname}?${params}`);
    $("#result").scrollIntoView({ behavior: "smooth", block: "start" });
  } finally {
    btn.disabled = false; btn.textContent = label;
  }
}

// ---------- オープニング ----------
// 毎回だとくどいので、1日に1度だけ流す。
// シェアリンクで開いたときは、目当てのパレットをすぐ見せたいので出さない。
function setupIntro() {
  const KEY = "csp-intro-shown";
  const el = $("#intro");
  if (!el) return;

  const sharedLink = new URLSearchParams(location.search).has("t");
  const today = new Date().toDateString();
  if (sharedLink || localStorage.getItem(KEY) === today) return;

  localStorage.setItem(KEY, today);
  el.hidden = false;

  const close = () => {
    el.hidden = true;
    $("#theme-input")?.focus();
  };
  // アニメーションが終わったら閉じる(念のため時間でも保険をかける)
  el.addEventListener("animationend", e => {
    if (e.animationName === "intro-out") close();
  });
  setTimeout(close, 5200);
  $("#intro-skip").addEventListener("click", close);
  el.addEventListener("click", close);
}

document.addEventListener("DOMContentLoaded", () => {
  setupIntro();
  refreshCounts();
  const ex = $("#examples");
  for (const name of EXAMPLES) {
    const chip = document.createElement("button");
    chip.className = "chip"; chip.textContent = name;
    chip.addEventListener("click", () => {
      $("#theme-input").value = name;
      lockedColors.clear(); updateVaryHint(); run(0);
    });
    ex.appendChild(chip);
  }
  // 作り直し(COLOR IT)のときは、前のテーマで残した色は引き継がない
  const freshRun = () => { lockedColors.clear(); updateVaryHint(); run(0); };
  $("#generate-btn").addEventListener("click", freshRun);
  $("#theme-input").addEventListener("keydown", e => { if (e.key === "Enter") freshRun(); });
  // 別の配色を試す: テーマはそのままに、配色技法を次のものへ送る
  $("#vary-btn").addEventListener("click", () => {
    const current = window.__lastResult?.palette?.variant || 0;
    run(current + 1);
  });
  // 色の丸: 押すと、近い伝統色から選び直せる
  $("#result").addEventListener("click", e => {
    const dot = e.target.closest(".dot[data-swap]");
    if (!dot) return;
    const row = dot.closest(".bead-row");
    const open = row.querySelector(".swap-panel");
    document.querySelectorAll(".swap-panel").forEach(el => el.remove());
    if (!open) openSwapPanel(row, Number(dot.dataset.swap), dot.dataset.hex);
  });

  // 鍵ボタン: 押した色を残す/残すのをやめる(パレットは描き直されるので委譲で拾う)
  $("#result").addEventListener("click", e => {
    const btn = e.target.closest(".lock-btn");
    if (!btn) return;
    toggleLock(btn.dataset.hex, btn.dataset.name);
    // 押した見た目だけ即座に反映する(作り直しは「別の配色を試す」を押したとき)
    const on = lockedColors.has(btn.dataset.hex.toLowerCase());
    btn.classList.toggle("is-locked", on);
    btn.innerHTML = LOCK_ICON(on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.title = on ? "この色の固定をやめる" : "この色を残して他を作り直す";
    const idx = [...$("#result").querySelectorAll(".lock-btn")].indexOf(btn);
    $("#result").querySelectorAll(".palette-band .swatch")[idx]?.classList.toggle("is-locked", on);
    $("#result").querySelectorAll(".bead-row")[idx]?.classList.toggle("is-locked", on);
  });

  // 残した色をすべて解除する
  $("#unlock-btn").addEventListener("click", () => {
    lockedColors.clear();
    updateVaryHint();
    run(window.__lastResult?.palette?.variant || 0);
  });

  // ---- 使いたいビーズ(品番3つ) ----
  SEED_IDS.forEach(sel => {
    const el = $(sel);
    // 打ち終わったら品番を照合して、色と種類をその場に出す
    el.addEventListener("input", () => { if (BeadMatcher.ready?.()) resolveSeedBeads(); });
    el.addEventListener("change", () => resolveSeedBeads());
    el.addEventListener("keydown", e => { if (e.key === "Enter") run(0); });
  });
  $("#seed-clear").addEventListener("click", () => {
    SEED_IDS.forEach(s => { $(s).value = ""; });
    resolveSeedBeads();
    if (window.__lastResult) run(window.__lastResult.palette.variant || 0);
  });

  // ---- パレットの保存 ----
  $("#save-btn").addEventListener("click", () => {
    const r = window.__lastResult;
    if (!r) return;
    const saved = SavedPalettes.add(r.palette, lockedList());
    const btn = $("#save-btn");
    btn.textContent = saved ? "保存しました" : "保存済みです";
    setTimeout(() => { btn.textContent = "このパレットを保存"; }, 1800);
    refreshCounts();
  });

  // ---- 一覧(保存したパレット / 作品)----
  $("#open-saved").addEventListener("click", () => openModal("saved"));
  $("#open-works").addEventListener("click", () => openModal("works"));
  $("#modal-close").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });

  // ---- 作品の登録 ----
  $("#addwork-btn").addEventListener("click", () => {
    const r = window.__lastResult;
    if (!r) return;
    $("#work-theme-note").textContent = `「${r.palette.input}」の配色として登録します`;
    $("#work-title").value = "";
    $("#work-note").value = "";
    $("#work-file").value = "";
    $("#work-status").textContent = "";
    $("#work-modal").hidden = false;
  });
  $("#work-close").addEventListener("click", () => { $("#work-modal").hidden = true; });
  $("#work-modal").addEventListener("click", e => {
    if (e.target.id === "work-modal") $("#work-modal").hidden = true;
  });
  $("#work-save").addEventListener("click", async () => {
    const file = $("#work-file").files[0];
    const status = $("#work-status");
    if (!file) { status.textContent = "写真を選んでください"; return; }
    const r = window.__lastResult;
    status.textContent = "登録中…";
    try {
      await MyWorks.add({
        file,
        title: $("#work-title").value.trim(),
        note: $("#work-note").value.trim(),
        theme: r.palette.input,
        colors: r.palette.colors.map(c => ({ hex: c.hex, name: c.name })),
        beads: r.matches.map(m => m[0]?.bead.code).filter(Boolean),
      });
      status.textContent = "登録しました";
      refreshCounts();
      setTimeout(() => { $("#work-modal").hidden = true; run(r.palette.variant || 0); }, 800);
    } catch (err) {
      status.textContent = "登録できませんでした(" + err.message + ")";
    }
  });

  // PDF/印刷。iPhoneは印刷画面の出し方が違うので、先に手順を伝える
  $("#print-btn").addEventListener("click", () => {
    const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS) {
      const hint = $("#print-hint");
      if (hint) {
        hint.hidden = false;
        hint.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    window.print();
  });
  $("#jpeg-btn").addEventListener("click", () => {
    if (window.__lastResult) JpegExport.exportJpeg(window.__lastResult.palette, window.__lastResult.matches);
  });

  // シェアリンクのコピー
  $("#share-btn").addEventListener("click", async () => {
    const btn = $("#share-btn");
    try {
      await navigator.clipboard.writeText(location.href);
      btn.textContent = "コピーしました";
    } catch (_) {
      prompt("このリンクをコピーしてください", location.href);
    }
    setTimeout(() => { btn.textContent = "シェアリンクをコピー"; }, 2000);
  });

  // PWA: アプリとしてインストールできるようにする
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  BeadMatcher.load(); // 先読み

  // シェアリンク(?t=テーマ&n=色数)で開かれたら自動生成する
  const params = new URLSearchParams(location.search);
  const sharedTheme = params.get("t");
  if (sharedTheme) {
    $("#theme-input").value = sharedTheme;
    const n = Number(params.get("n"));
    if (n >= 2 && n <= 8) $("#color-count").value = String(n);
    run(Number(params.get("v")) || 0);
  }
});
