// Stable creative controls for MindMate.
// Sticker controls are rendered as a screen-level overlay so rotation never
// transforms the toolbar. Doodle mode is rendered INSIDE .book-page so the
// journal page's overflow boundary clips every stroke.
(() => {
  const STYLE_ID = "mindmate-stable-creative-fix";
  const STICKER_TOOLBAR_ID = "mindmate-stable-sticker-toolbar";
  const DOODLE_ID = "mindmate-stable-doodle";
  const stickerButtonLabels = ["−", "+", "↺", "↻", "×"];

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .book-page .placed-sticker.selected .sticker-controls {
        visibility: hidden !important;
        pointer-events: none !important;
      }
      #${STICKER_TOOLBAR_ID} {
        position: fixed !important;
        z-index: 2147483646 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
        padding: 7px !important;
        border-radius: 14px !important;
        background: #302844 !important;
        box-shadow: 0 8px 24px rgba(30,20,50,.30) !important;
        white-space: nowrap !important;
        transform: translateX(-50%) !important;
        pointer-events: auto !important;
      }
      #${STICKER_TOOLBAR_ID} button {
        width: 30px !important;
        min-width: 30px !important;
        height: 30px !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 9px !important;
        background: #4a3b68 !important;
        color: #f8f3ff !important;
        font-size: 17px !important;
        font-weight: 800 !important;
        line-height: 30px !important;
        cursor: pointer !important;
        transform: none !important;
      }
      #${STICKER_TOOLBAR_ID} button:hover { background: #5a477d !important; }
      #${STICKER_TOOLBAR_ID} .remove-sticker { background: #70415d !important; }
      #${DOODLE_ID} .mm-doodle-eraser.active {
        background: #70415d !important;
        color: #fff !important;
        box-shadow: inset 0 0 0 2px #f2b8cd !important;
      }

      /* Doodle is a child of .book-page, so .book-page overflow:hidden is the hard boundary. */
      #${DOODLE_ID} {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 10000 !important;
        overflow: hidden !important;
        border-radius: inherit !important;
        background: transparent !important;
        touch-action: none !important;
        overscroll-behavior: contain !important;
      }
      #${DOODLE_ID} canvas {
        position: absolute !important;
        inset: 0 !important;
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        touch-action: none !important;
        pointer-events: auto !important;
      }
      #${DOODLE_ID} .mm-doodle-bar {
        position: absolute !important;
        left: 50% !important;
        top: 14px !important;
        bottom: auto !important;
        transform: translateX(-50%) !important;
        z-index: 2 !important;
        max-width: calc(100% - 24px) !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        touch-action: manipulation !important;
      }
      body.mindmate-doodling {
        overflow: hidden !important;
        overscroll-behavior: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function remove(id) { document.getElementById(id)?.remove(); }

  function getSelectedSticker() {
    return document.querySelector(".book-page .placed-sticker.selected");
  }

  function getCurrentControl(sticker, index) {
    return sticker?.querySelectorAll(".sticker-controls button")[index] || null;
  }

  function positionStickerToolbar(toolbar, sticker) {
    if (!toolbar?.isConnected || !sticker?.isConnected) return;
    const page = sticker.closest(".book-page");
    const pageRect = page?.getBoundingClientRect();
    const rect = sticker.getBoundingClientRect();
    const toolbarWidth = toolbar.offsetWidth || 190;
    const toolbarHeight = toolbar.offsetHeight || 44;
    const gap = 14;

    // Use the sticker's layout box, not its transformed bounding box. Rotation
    // changes getBoundingClientRect().height/top and made the toolbar bounce.
    const leftAnchor = pageRect
      ? pageRect.left + sticker.offsetLeft
      : rect.left + rect.width / 2;
    const topAnchor = pageRect
      ? pageRect.top + sticker.offsetTop - sticker.offsetHeight / 2
      : rect.top;
    const bottomAnchor = pageRect
      ? pageRect.top + sticker.offsetTop + sticker.offsetHeight / 2
      : rect.bottom;

    let left = leftAnchor;
    let top = topAnchor - toolbarHeight - gap;
    if (top < 8) top = bottomAnchor + gap;
    left = Math.max(toolbarWidth / 2 + 8, Math.min(window.innerWidth - toolbarWidth / 2 - 8, left));
    top = Math.max(8, Math.min(window.innerHeight - toolbarHeight - 8, top));

    toolbar.style.left = `${left}px`;
    toolbar.style.top = `${top}px`;
  }

  function ensureStickerToolbar() {
    const sticker = getSelectedSticker();
    if (!sticker || !sticker.querySelector(".sticker-controls")) {
      remove(STICKER_TOOLBAR_ID);
      return;
    }
    let toolbar = document.getElementById(STICKER_TOOLBAR_ID);
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.id = STICKER_TOOLBAR_ID;
      toolbar.setAttribute("aria-label", "Sticker controls");
      stickerButtonLabels.forEach((label, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.controlIndex = String(index);
        button.textContent = label;
        if (index === 4) button.className = "remove-sticker";
        button.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          event.stopPropagation();
        }, { passive: false });
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          const currentSticker = getSelectedSticker();
          const source = getCurrentControl(currentSticker, index);
          if (source) source.click();
        });
        toolbar.appendChild(button);
      });
      document.body.appendChild(toolbar);
    }
    positionStickerToolbar(toolbar, sticker);
  }

  function openDoodle() {
    remove(DOODLE_ID);
    const book = document.querySelector(".book-page");
    if (!book) return;
    // Draw on top of the saved drawing so the user can add to it on any
    // editable screen. The React state (and thus the saved entry) is only
    // replaced when this overlay closes via Done.
    const existing = book.querySelector("img.doodle-layer");

    const overlay = document.createElement("div");
    overlay.id = DOODLE_ID;
    overlay.innerHTML = `
      <canvas></canvas>
      <div class="mm-doodle-bar mm-enhanced">
        <button class="undo" type="button">↶ Undo</button>
        <button class="clear" type="button">Clear</button>
        <span class="mm-doodle-label">Color</span>
        <button class="mm-doodle-color active" data-color="#7655d3" style="background:#7655d3" title="Purple" type="button"></button>
        <button class="mm-doodle-color" data-color="#e85d8f" style="background:#e85d8f" title="Pink" type="button"></button>
        <button class="mm-doodle-color" data-color="#4f86e8" style="background:#4f86e8" title="Blue" type="button"></button>
        <button class="mm-doodle-color" data-color="#55a66a" style="background:#55a66a" title="Green" type="button"></button>
        <button class="mm-doodle-color" data-color="#e69b35" style="background:#e69b35" title="Orange" type="button"></button>
        <button class="mm-doodle-color" data-color="#333333" style="background:#333333" title="Black" type="button"></button>
        <span class="mm-doodle-label">Size</span>
        <button class="mm-doodle-size active" data-size="3" type="button">S</button>
        <button class="mm-doodle-size" data-size="6" type="button">M</button>
        <button class="mm-doodle-size" data-size="10" type="button">L</button>
        <button class="mm-doodle-eraser" type="button" title="Eraser">🧽 Eraser</button>
        <button class="done" type="button">Done</button>
      </div>`;

    book.appendChild(overlay);
    document.body.classList.add("mindmate-doodling");

    const canvas = overlay.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(1, book.clientWidth);
    const height = Math.max(1, book.clientHeight);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#7655d3";
    ctx.lineWidth = 3;
    if (existing) {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0, width, height);
      };
      image.src = existing.src;
    }

    let drawing = false;
    let last = null;
    let history = [];

    function point(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
        y: Math.max(0, Math.min(rect.height, event.clientY - rect.top))
      };
    }

    canvas.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      drawing = true;
      last = point(event);
      history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      canvas.setPointerCapture?.(event.pointerId);
    }, { passive: false });

    canvas.addEventListener("pointermove", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!drawing || !last) return;
      const next = point(event);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
      last = next;
    }, { passive: false });

    const stopDrawing = (event) => {
      event?.preventDefault?.();
      drawing = false;
      last = null;
    };
    canvas.addEventListener("pointerup", stopDrawing, { passive: false });
    canvas.addEventListener("pointercancel", stopDrawing, { passive: false });

    overlay.querySelector(".undo").onclick = () => {
      const previous = history.pop();
      if (previous) ctx.putImageData(previous, 0, 0);
    };
    overlay.querySelector(".clear").onclick = () => {
      ctx.clearRect(0, 0, width, height);
      history = [];
    };
    // Eraser mode: strokes punch through existing pixels (destination-out).
    // Pencil color/width and eraser width are remembered per mode, so picking
    // a size or color keeps working exactly as before for the pencil.
    const colorButtons = [...overlay.querySelectorAll(".mm-doodle-color")];
    const sizeButtons = [...overlay.querySelectorAll(".mm-doodle-size")];
    const eraserButton = overlay.querySelector(".mm-doodle-eraser");
    let eraser = false;
    const pencil = { color: ctx.strokeStyle, width: ctx.lineWidth };
    let eraserWidth = 15;

    const setMode = (next) => {
      eraser = next;
      eraserButton.classList.toggle("active", eraser);
      canvas.style.cursor = eraser ? "cell" : "crosshair";
      if (eraser) {
        colorButtons.forEach((item) => item.classList.remove("active"));
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = eraserWidth;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = pencil.color;
        ctx.lineWidth = pencil.width;
        colorButtons.find((item) => item.dataset.color === pencil.color)?.classList.add("active");
      }
    };

    eraserButton.onclick = () => setMode(!eraser);

    overlay.querySelectorAll(".mm-doodle-color").forEach((button) => {
      button.onclick = () => {
        pencil.color = button.dataset.color;
        setMode(false);
      };
    });
    overlay.querySelectorAll(".mm-doodle-size").forEach((button) => {
      button.onclick = () => {
        const size = Number(button.dataset.size);
        // Eraser tips run wider than pencil tips at the same S/M/L setting.
        if (eraser) eraserWidth = size * 3; else pencil.width = size;
        sizeButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        ctx.lineWidth = eraser ? eraserWidth : pencil.width;
      };
    });
    overlay.querySelector(".done").onclick = () => {
      // Persist the drawing: hand the bitmap to React (mindmate-doodle-data) so
      // App state can store it on the entry when the user saves. A blank
      // canvas (cleared or never drawn on) is ignored.
      const dataUrl = canvas.toDataURL("image/png");
      const blank = document.createElement("canvas");
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (dataUrl !== blank.getContext("2d").canvas.toDataURL("image/png")) {
        window.dispatchEvent(new CustomEvent("mindmate-doodle-data", { detail: { dataUrl } }));
      }
      document.body.classList.remove("mindmate-doodling");
      overlay.remove();
    };
  }

  function wireDoodleButton() {
    const button = document.querySelector('.mm-toolbar .mm-tool[title="Doodle"]');
    if (!button || button.dataset.mmStableDoodleWired === "1") return;
    button.dataset.mmStableDoodleWired = "1";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openDoodle();
    }, true);
  }

  function start() {
    installStyles();
    wireDoodleButton();
    ensureStickerToolbar();
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        wireDoodleButton();
        ensureStickerToolbar();
      });
    };
    document.addEventListener("click", schedule, true);
    document.addEventListener("pointerup", schedule, true);
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
