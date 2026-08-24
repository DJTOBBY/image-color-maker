/* Instagram用JPEG書き出し(1080×1350、フィード4:5)
   資料シートと同じ紙のデザインをCanvasに描く。外部画像を使わないので
   どの環境でも汚染なしで書き出せる。 */

const JpegExport = (() => {
  const W = 1080, H = 1350, M = 84;
  const PAPER = "#faf8f4", INK = "#2b2926", SOFT = "#6f6a62", ACCENT = "#8a6d3b", LINE = "#e2ddd4";
  const SERIF = '"Shippori Mincho", "Hiragino Mincho ProN", serif';
  const SANS = '"Zen Kaku Gothic New", "Hiragino Kaku Gothic ProN", sans-serif';

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

    // パレット帯
    const bandY = 370, bandH = 260;
    const colW = (W - M * 2) / colors.length;
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
    ctx.fillText(`配色技法 ─ ${palette.technique}`, W / 2, bandY + bandH + 56);
    ctx.letterSpacing = "0px";

    // 色ごとの行
    const rowsTop = bandY + bandH + 100;
    const rowsBottom = H - 120;
    const rowH = Math.min(96, (rowsBottom - rowsTop) / colors.length);
    ctx.textAlign = "left";
    colors.forEach((c, i) => {
      const y = rowsTop + i * rowH + rowH / 2;
      // 丸スウォッチ
      ctx.beginPath();
      ctx.arc(M + 34, y, 30, 0, Math.PI * 2);
      ctx.fillStyle = c.hex;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.stroke();
      // 名前と情報
      ctx.fillStyle = INK;
      ctx.font = `700 31px ${SANS}`;
      ctx.fillText(c.name, M + 92, y - 6);
      ctx.fillStyle = SOFT;
      ctx.font = `400 22px ${SANS}`;
      const pccsLabel = c.pccs.neutral ? c.pccs.toneJa : `${c.pccs.hueNo}:${c.pccs.hueSym} ${c.pccs.toneJa}`;
      const waLabel = c.wa ? ` ≒${c.wa.name}` : "";
      ctx.fillText(`${c.hex.toUpperCase()}  ${pccsLabel}${waLabel}`, M + 92, y + 26);
      // ビーズ品番(右寄せ)
      const first = matches[i] && matches[i][0];
      if (first) {
        ctx.textAlign = "right";
        ctx.fillStyle = INK;
        ctx.font = `700 27px ${SANS}`;
        ctx.fillText(`TOHO No.${first.bead.code}`, W - M, y - 6);
        ctx.fillStyle = SOFT;
        ctx.font = `400 20px ${SANS}`;
        const finish = first.bead.finish.length > 14 ? first.bead.finish.slice(0, 14) + "…" : first.bead.finish;
        ctx.fillText(finish, W - M, y + 24);
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
    ctx.fillText("イメージカラーメーカー × TOHO BEADS", M, H - 46);
    ctx.textAlign = "right";
    ctx.fillText(new Date().toLocaleDateString("ja-JP"), W - M, H - 46);
    ctx.textAlign = "left";
    ctx.letterSpacing = "0px";

    return canvas;
  }

  // 保存: Artifact上ではdownloads capability、ローカルでは<a download>相当
  async function saveJpeg(canvas, filename, statusEl) {
    const runtime = window.claude && window.claude.use ? window.claude : null;
    if (runtime) {
      const dl = await runtime.use("downloads");
      if (dl) {
        try {
          const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", 0.92));
          await dl.save({ filename, data: blob });
          statusEl.textContent = "保存しました";
          return;
        } catch (e) {
          if (e && e.code === "declined") { statusEl.textContent = ""; return; }
          if (e && e.code === "rate_limited") { statusEl.textContent = "確認画面が開いています。少し待ってからもう一度どうぞ"; return; }
          statusEl.textContent = "保存できませんでした。画像を長押し(またはright-click)して保存してください";
          return;
        }
      }
      statusEl.textContent = "この環境では、画像を長押し(またはright-click)して保存してください";
      return;
    }
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg", 0.92);
    a.download = filename;
    a.click();
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
          <button class="primary-link" id="jpeg-save-btn">JPEGを保存</button>
          <span id="jpeg-status">Instagramには保存した画像を投稿してください。画像の長押し(またはright-click)でも保存できます</span>
          <button class="close-btn" onclick="this.closest('.jpeg-overlay').remove()">閉じる</button>
        </div>
      </div>`;
    overlay.querySelector("#jpeg-save-btn").addEventListener("click", () =>
      saveJpeg(canvas, filename, overlay.querySelector("#jpeg-status")));
  }

  return { exportJpeg };
})();
