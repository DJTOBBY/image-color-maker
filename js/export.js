/* Instagram用JPEG書き出し(1080×1350、フィード4:5)
   資料シートと同じ紙のデザインをCanvasに描く。外部画像を使わないので
   どの環境でも汚染なしで書き出せる。 */

const JpegExport = (() => {
  const W = 1080, H = 1350, M = 84;
  const PAPER = "#faf8f4", INK = "#2b2926", SOFT = "#6f6a62", ACCENT = "#8a6d3b", LINE = "#e2ddd4";
  const SERIF = '"Shippori Mincho", "Hiragino Mincho ProN", serif';
  const SANS = '"Zen Kaku Gothic New", "Hiragino Kaku Gothic ProN", sans-serif';

  // ---- 実物写真の計測色でビーズの連を描く ----
  function mix(hex, target, amount) {
    const [r, g, b] = hexToRgb(hex);
    const [tr, tg, tb] = hexToRgb(target);
    return rgbToHex(
      Math.round(r + (tr - r) * amount),
      Math.round(g + (tg - g) * amount),
      Math.round(b + (tb - b) * amount));
  }
  function luminance(hex) {
    const [r, g, b] = hexToRgb(hex);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }
  function drawBeadStrand(ctx, cx, cy, bead, count = 6, r = 13) {
    const palette = (bead.p && bead.p.length ? bead.p : [[bead.hex, 100]])
      .filter(([, w]) => w >= 4);
    const sorted = [...palette].sort((a, b) => luminance(b[0]) - luminance(a[0]));
    const light = sorted[0][0];
    const dark = sorted[sorted.length - 1][0];
    // 面積比に応じて本体色の並びを作る(擬似乱数は品番から決める=毎回同じ絵)
    let seed = 0;
    for (const ch of bead.code) seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
    const total = palette.reduce((a, [, w]) => a + w, 0);
    const bodies = [];
    for (let i = 0; i < count; i++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      let pick = (seed / 2147483648) * total;
      let hex = palette[0][0];
      for (const [c, w] of palette) { pick -= w; if (pick <= 0) { hex = c; break; } }
      bodies.push(hex);
    }
    const startX = cx - ((count - 1) * (r * 2 + 2)) / 2;
    bodies.forEach((hex, i) => {
      const x = startX + i * (r * 2 + 2);
      // 本体
      ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = hex; ctx.fill();
      // 下側の陰(写真の暗部の色)
      ctx.beginPath(); ctx.arc(x + r * 0.25, cy + r * 0.3, r * 0.62, 0, Math.PI * 2);
      ctx.fillStyle = mix(hex, dark, 0.45); ctx.globalAlpha = 0.5; ctx.fill();
      ctx.globalAlpha = 1;
      // 上側のハイライト(写真の明部の色)
      ctx.beginPath(); ctx.arc(x - r * 0.3, cy - r * 0.35, r * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = mix(hex, light, 0.75); ctx.globalAlpha = 0.85; ctx.fill();
      ctx.globalAlpha = 1;
      // 輪郭
      ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.stroke();
    });
  }

  // 画面に埋め込んであるTOHO BEADSロゴを、書き出し用の色でCanvasに描けるようにする
  function loadLogo(color) {
    const src = document.querySelector(".toho-logo");
    if (!src) return Promise.resolve(null);
    const svg = src.cloneNode(true);
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    // currentColor のままでは画像化したときに色が決まらないので、実際の色を焼き込む
    svg.querySelectorAll('[fill="currentColor"]').forEach(el => el.setAttribute("fill", color));
    svg.querySelectorAll("g").forEach(g => {
      if (g.getAttribute("fill") === "currentColor") g.setAttribute("fill", color);
    });
    const url = "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(new XMLSerializer().serializeToString(svg));
    return new Promise(res => {
      const img = new Image();
      const timer = setTimeout(() => res(null), 3000);
      img.onload = () => { clearTimeout(timer); res(img); };
      img.onerror = () => { clearTimeout(timer); res(null); };
      img.src = url;
    });
  }

  // カタログ(CORS開放)の実物写真を読み込む。失敗・タイムアウトはnull
  function loadPhoto(url, timeoutMs = 4000) {
    return new Promise(res => {
      const img = new Image();
      const timer = setTimeout(() => res(null), timeoutMs);
      img.crossOrigin = "anonymous";
      img.onload = () => { clearTimeout(timer); res(img); };
      img.onerror = () => { clearTimeout(timer); res(null); };
      img.src = url;
    });
  }

  // 実物写真をカバーフィットで角丸枠に描く
  function drawPhotoStrip(ctx, img, cx, cy, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 8);
    ctx.clip();
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale, sh = h / scale;
    ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh,
      cx - w / 2, cy - h / 2, w, h);
    ctx.restore();
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 8);
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.stroke();
  }

  function fitFont(ctx, text, family, weight, startPx, maxWidth) {
    let px = startPx;
    do {
      ctx.font = `${weight} ${px}px ${family}`;
      if (ctx.measureText(text).width <= maxWidth) break;
      px -= 2;
    } while (px > 20);
    return px;
  }

  async function render(palette, matches) {
    await document.fonts.ready;
    // 各色の第一候補の実物写真を先に読み込む(無い品番はnull=計測色のビーズ描画)
    const photos = await Promise.all((palette.colors).map((c, i) => {
      const first = matches[i] && matches[i][0];
      return first && first.bead.photo ? loadPhoto(first.bead.photo) : Promise.resolve(null);
    }));
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const { colors } = palette;

    // 紙
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";

    // 見出し
    ctx.fillStyle = SOFT;
    ctx.letterSpacing = "10px";
    ctx.font = `500 22px ${SANS}`;
    ctx.fillText("COLOR STORY PALETTE", W / 2, 118);
    ctx.letterSpacing = "0px";

    ctx.fillStyle = INK;
    const title = palette.input.toUpperCase();
    ctx.letterSpacing = "6px";
    fitFont(ctx, title, SERIF, 700, 84, W - M * 2);
    ctx.fillText(title, W / 2, 218);
    ctx.letterSpacing = "0px";

    if (palette.story) {
      ctx.fillStyle = SOFT;
      const story = `— ${palette.story} —`;
      fitFont(ctx, story, SERIF, 500, 30, W - M * 2);
      ctx.fillText(story, W / 2, 272);
    }
    if (palette.moodWords.length) {
      ctx.fillStyle = ACCENT;
      ctx.font = `500 25px ${SANS}`;
      ctx.letterSpacing = "3px";
      ctx.fillText(palette.moodWords.join(" ・ "), W / 2, 322);
      ctx.letterSpacing = "0px";
    }

    // 色数が増えるほど1行が薄くなり、文字が窮屈になる。
    // そこで(1)パレット帯を縮めて行に場所を譲り、(2)文字も少しだけ小さくする。
    // 片方だけだと副作用が目立つので、両方を穏やかに効かせる。
    const n = colors.length;
    const bandY = 370;
    const bandH = n <= 5 ? 260 : Math.max(196, 260 - (n - 5) * 22);
    const gapAfterBand = n <= 5 ? 100 : 84;   // 帯と行のあいだ

    const colW = (W - M * 2) / n;
    colors.forEach((c, i) => {
      ctx.fillStyle = c.hex;
      ctx.fillRect(M + i * colW, bandY, colW, bandH);
    });
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.strokeRect(M, bandY, W - M * 2, bandH);

    // 技法
    ctx.fillStyle = SOFT;
    ctx.font = `500 24px ${SANS}`;
    ctx.letterSpacing = "2px";
    ctx.fillText(`配色技法 ─ ${palette.technique}`, W / 2, bandY + bandH + Math.round(gapAfterBand * 0.56));
    ctx.letterSpacing = "0px";

    // 色ごとの行
    const rowsTop = bandY + bandH + gapAfterBand;
    const rowsBottom = H - 120;
    const rowH = Math.min(96, (rowsBottom - rowsTop) / n);
    // 行の高さに合わせて文字を縮める(96pxのときが基準。小さくしすぎない)
    const fz = Math.max(0.78, Math.min(1, rowH / 96));
    const px = (base) => Math.round(base * fz);
    ctx.textAlign = "left";
    colors.forEach((c, i) => {
      const y = rowsTop + i * rowH + rowH / 2;
      // 2行の文字は行の中心をはさんで上下に置く。間隔も行の高さに合わせる
      const lead = Math.round(16 * fz);        // 中心から1行目までの距離
      const drop = Math.round(26 * fz);        // 中心から2行目までの距離
      // 丸スウォッチ
      ctx.beginPath();
      ctx.arc(M + 34, y, Math.round(30 * fz), 0, Math.PI * 2);
      ctx.fillStyle = c.hex;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.stroke();
      // 名前と情報
      ctx.fillStyle = INK;
      ctx.font = `700 ${px(31)}px ${SANS}`;
      ctx.fillText(c.name, M + 92, y - lead + Math.round(10 * fz));
      ctx.fillStyle = SOFT;
      ctx.font = `400 ${px(22)}px ${SANS}`;
      const pccsLabel = c.pccs.neutral ? c.pccs.toneJa : `${c.pccs.hueNo}:${c.pccs.hueSym} ${c.pccs.toneJa}`;
      const waLabel = c.wa ? ` ≒${c.wa.name}` : "";
      ctx.fillText(`${c.hex.toUpperCase()}  ${pccsLabel}${waLabel}`, M + 92, y + drop);
      // ビーズ品番(右寄せ)と実物写真(写真が無い品番は計測色でビーズを描く)
      const first = matches[i] && matches[i][0];
      if (first) {
        if (photos[i]) {
          drawPhotoStrip(ctx, photos[i], 640, y, Math.round(220 * fz), Math.min(52, rowH * 0.58));
        } else {
          drawBeadStrand(ctx, 640, y, first.bead, 6, Math.min(15, rowH * 0.17));
        }
        ctx.textAlign = "right";
        ctx.fillStyle = INK;
        ctx.font = `700 ${px(27)}px ${SANS}`;
        ctx.fillText(`TOHO No.${first.bead.code}`, W - M, y - lead + Math.round(10 * fz));
        ctx.fillStyle = SOFT;
        ctx.font = `400 ${px(20)}px ${SANS}`;
        const finish = first.bead.finish.length > 14 ? first.bead.finish.slice(0, 14) + "…" : first.bead.finish;
        ctx.fillText(finish, W - M, y + drop - Math.round(2 * fz));
        ctx.textAlign = "left";
      }
      // 区切り線
      if (i < colors.length - 1) {
        ctx.strokeStyle = LINE;
        ctx.beginPath();
        ctx.moveTo(M, rowsTop + (i + 1) * rowH);
        ctx.lineTo(W - M, rowsTop + (i + 1) * rowH);
        ctx.stroke();
      }
    });

    // フッター
    ctx.strokeStyle = LINE;
    ctx.beginPath(); ctx.moveTo(M, H - 84); ctx.lineTo(W - M, H - 84); ctx.stroke();
    ctx.fillStyle = SOFT;
    ctx.font = `500 20px ${SANS}`;
    ctx.letterSpacing = "2px";
    ctx.fillText("COLOR STORY PALETTE", M, H - 46);
    ctx.letterSpacing = "0px";

    // TOHO BEADSロゴ(投稿された画像から出どころが分かるように)
    const logo = await loadLogo(SOFT);
    if (logo) {
      const lh = 26, lw = logo.width * (lh / logo.height);
      ctx.drawImage(logo, W / 2 - lw / 2, H - 62, lw, lh);
    }

    ctx.textAlign = "right";
    ctx.fillStyle = SOFT;
    ctx.font = `500 20px ${SANS}`;
    ctx.fillText(new Date().toLocaleDateString("ja-JP"), W - M, H - 46);
    ctx.textAlign = "left";

    return canvas;
  }

  // 保存: Artifact上ではdownloads capability、ローカルでは<a download>相当
  // iPhone・iPad(iPadOSはMacを名乗るのでタッチの有無でも見る)
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  function canvasToBlob(canvas) {
    return new Promise(r => canvas.toBlob(r, "image/jpeg", 0.92));
  }

  async function saveJpeg(canvas, filename, statusEl) {
    const runtime = window.claude && window.claude.use ? window.claude : null;
    if (runtime) {
      const dl = await runtime.use("downloads");
      if (dl) {
        try {
          await dl.save({ filename, data: await canvasToBlob(canvas) });
          statusEl.textContent = "保存しました";
          return;
        } catch (e) {
          if (e && e.code === "declined") { statusEl.textContent = ""; return; }
          if (e && e.code === "rate_limited") { statusEl.textContent = "確認画面が開いています。少し待ってからもう一度どうぞ"; return; }
          statusEl.textContent = "保存できませんでした。画像を長押しして保存してください";
          return;
        }
      }
      statusEl.textContent = "この環境では、画像を長押しして保存してください";
      return;
    }

    const blob = await canvasToBlob(canvas);
    if (!blob) { statusEl.textContent = "画像を作れませんでした"; return; }

    // iPhoneは共有シートから「画像を保存」できる。写真アプリに直接入るのでこれが最良
    if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: "image/jpeg" })] })) {
      try {
        await navigator.share({ files: [new File([blob], filename, { type: "image/jpeg" })] });
        statusEl.textContent = "";
        return;
      } catch (e) {
        if (e && e.name === "AbortError") { statusEl.textContent = ""; return; }
        // 共有できなければ下の方法へ
      }
    }

    // iOSのSafariは <a download> を無視して画像を表示してしまうため、
    // 新しいタブで開いて「長押しで保存」してもらう
    const url = URL.createObjectURL(blob);
    if (isIOS) {
      const win = window.open(url, "_blank");
      statusEl.textContent = win
        ? "開いた画像を長押しして「”写真”に追加」を選んでください"
        : "画像を長押しして「”写真”に追加」を選んでください";
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return;
    }

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    statusEl.textContent = "保存しました";
  }

  // 書き出してオーバーレイに表示(長押し/右クリック保存にも対応)
  async function exportJpeg(palette, matches) {
    const canvas = await render(palette, matches);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const filename = `${palette.input.replace(/[^\w぀-ヿ一-龯]+/g, "-")}-palette.jpg`;

    let overlay = document.getElementById("jpeg-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "jpeg-overlay";
      overlay.className = "jpeg-overlay no-print";
      overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="jpeg-box">
        <img src="${dataUrl}" alt="書き出し画像">
        <div class="jpeg-actions">
          <button class="primary-link" id="jpeg-save-btn">${
            isIOS && navigator.share ? "写真に保存 / 共有" : "JPEGを保存"}</button>
          <span id="jpeg-status">${isIOS
            ? "上の画像を長押しして「”写真”に追加」でも保存できます"
            : "Instagramには保存した画像を投稿してください。画像を長押し(または右クリック)でも保存できます"}</span>
          <button class="close-btn" onclick="this.closest('.jpeg-overlay').remove()">閉じる</button>
        </div>
      </div>`;
    overlay.querySelector("#jpeg-save-btn").addEventListener("click", () =>
      saveJpeg(canvas, filename, overlay.querySelector("#jpeg-status")));
  }

  return { exportJpeg };
})();
