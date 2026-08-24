/* 画面制御と資料シートの描画 */

const EXAMPLES = [
  "TOKYO NIGHT", "SETOUCHI SEA", "KYOTO AUTUMN",
  "DESERT SUNSET", "FOREST FOLKLORE", "NEW ENGLAND",
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

// ---------- 在庫リスト ----------
const INV_KEY = "icm-inventory";
function parseInventory(text) {
  return new Set(text.toUpperCase().split(/[\s,、。/]+/).filter(s => /^[0-9A-Z\-]+$/.test(s)));
}
function currentInventory() {
  return parseInventory($("#inventory-input").value || "");
}
function updateInventoryCount() {
  const n = currentInventory().size;
  $("#inventory-count").textContent = n ? ` ${n}品番` : "";
}

// ---------- シート描画 ----------
function renderSheet(palette, matches) {
  const { colors } = palette;
  const usedHues = [...new Set(colors.filter(c => !c.pccs.neutral).map(c => c.pccs.hueNo))];
  const usedTones = [...new Set(colors.map(c => c.pccs.toneKey))];
  const mainColor = colors.find(c => !c.pccs.neutral);
  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });

  const band = colors.map(c => `<div class="swatch" style="background:${c.hex}"></div>`).join("");
  const caption = colors.map(c => `
    <div class="cap"><b>${esc(c.name)}</b>${c.hex.toUpperCase()}<br>${c.pccs.neutral ? esc(c.pccs.toneJa) : esc(c.pccs.label)}</div>
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
      <div class="bead-row">
        <div class="color-cell">
          <div class="dot" style="background:${c.hex}"></div>
          <div class="color-meta">
            <b>${esc(c.name)}</b>
            ${c.hex.toUpperCase()}
            ${c.wa ? `<span class="wa-name">≒ ${esc(c.wa.name)}(${esc(c.wa.kana)})</span>` : ""}
            <span class="pccs-tag">${pccsLine}</span>
          </div>
        </div>
        <div class="bead-cards">${cards}</div>
      </div>`;
  }).join("");

  // 作品事例
  const workItems = BeadMatcher.worksFor(palette.input);
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
      <span>イメージカラーメーカー × TOHO BEADS</span>
      <span>${today}</span>
    </div>`;

  $("#result").hidden = false;
  $("#print-bar").hidden = false;
}

// ---------- イベント ----------
async function run() {
  const input = $("#theme-input").value.trim();
  if (!input) return;
  const btn = $("#generate-btn");
  btn.disabled = true; btn.textContent = "翻訳中…";
  try {
    await BeadMatcher.load();
    const palette = generatePalette(input, Number($("#color-count").value));
    const matches = BeadMatcher.match(palette.colors, {
      sparkle: palette.sparkle, matte: palette.matte, perColor: 3,
      inventory: currentInventory(),
      inventoryOnly: $("#inventory-only").checked,
    });
    renderSheet(palette, matches);
    window.__lastResult = { palette, matches };
    $("#result").scrollIntoView({ behavior: "smooth", block: "start" });
  } finally {
    btn.disabled = false; btn.textContent = "翻訳する";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ex = $("#examples");
  for (const name of EXAMPLES) {
    const chip = document.createElement("button");
    chip.className = "chip"; chip.textContent = name;
    chip.addEventListener("click", () => { $("#theme-input").value = name; run(); });
    ex.appendChild(chip);
  }
  $("#generate-btn").addEventListener("click", run);
  $("#theme-input").addEventListener("keydown", e => { if (e.key === "Enter") run(); });
  $("#print-btn").addEventListener("click", () => window.print());
  $("#jpeg-btn").addEventListener("click", () => {
    if (window.__lastResult) JpegExport.exportJpeg(window.__lastResult.palette, window.__lastResult.matches);
  });

  // 在庫リスト: localStorage に自動保存
  const inv = $("#inventory-input");
  inv.value = localStorage.getItem(INV_KEY) || "";
  updateInventoryCount();
  inv.addEventListener("input", () => {
    localStorage.setItem(INV_KEY, inv.value);
    updateInventoryCount();
  });

  BeadMatcher.load(); // 先読み
});
