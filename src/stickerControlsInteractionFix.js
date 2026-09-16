// Robust mobile fixes for the creative tools.
// This file is already imported by main.jsx.
(() => {
  const STYLE_ID = "mindmate-creative-mobile-fix";
  const TOOLBAR_ID = "mindmate-sticker-toolbar-overlay";
  const DOODLE_ID = "mindmate-doodle-overlay";

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* React keeps the real controls inside the rotated sticker. Hide them and
         use a screen-level copy so rotation can never make the toolbar orbit. */
      .book-page .placed-sticker.selected .sticker-controls {
        visibility: hidden !important;
        pointer-events: none !important;
      }
      #${TOOLBAR_ID} {
        position: fixed !important;
        z-index: 2147483646 !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        padding: 7px !important;
        border-radius: 14px !important;
        background: #302844 !important;
        box-shadow: 0 8px 24px rgba(30,20,50,.28) !important;
        transform: translateX(-50%) !important;
        white-space: nowrap !important;
      }
      #${TOOLBAR_ID} button {
        width: 30px !important;
        min-width: 30px !important;
        height: 30px !important;
        border: 0 !important;
        border-radius: 9px !important;
        background: #4a3b68 !important;
        color: #f8f3ff !important;
        font-size: 17px !important;
        font-weight: 800 !important;
      }
      #${TOOLBAR_ID} .remove-sticker { background: #70415d !important; }
      #${DOODLE_ID} {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 2147483647 !important;
        overflow: hidden !important;
        touch-action: none !important;
        overscroll-behavior: none !important;
        background: transparent !important;
      }
      #${DOODLE_ID} canvas {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        touch-action: none !important;
        pointer-events: auto !important;
      }
      #${DOODLE_ID} .mm-doodle-bar {
        position: fixed !important;
        left: 50% !important;
        bottom: max(18px, env(safe-area-inset-bottom)) !important;
        top: auto !important;
        transform: translateX(-50%) !important;
        z-index: 2 !important;
      }
      body.mindmate-doodling {
        overflow: hidden !important;
        overscroll-behavior: none !important;
        touch-action: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function removeElement(id) {
    document.getElementById(id)?.remove();
  }

  function createStickerToolbar(sticker) {
    removeElement(TOOLBAR_ID);
    const original = sticker.querySelector(".sticker-controls");
    if (!original) return;

    const toolbar = document.createElement("div");
    toolbar.id = TOOLBAR_ID;
    toolbar.setAttribute("aria-label", "Sticker controls");

    original.querySelectorAll("button").forEach((sourceButton) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = sourceButton.textContent;
      button.className = sourceButton.className || "";
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        sourceButton.click();
      });
      toolbar.appendChild(button);
    });

    document.body.appendChild(toolbar);
    positionStickerToolbar(sticker, toolbar);
  }

  function positionStickerToolbar(sticker, toolbar) {
    if (!sticker || !toolbar?.isConnected) return;
    const rect = sticker.getBoundingClientRect();
    const gap = 10;
    const toolbarHeight = toolbar.offsetHeight || 44;
    let left = rect.left + rect.width / 2;
    let top = rect.top - gap;

    if (top - toolbarHeight < 8) top = rect.bottom + gap + toolbarHeight;
    left = Math.max(toolbar.offsetWidth / 2 + 8, Math.min(window.innerWidth - toolbar.offsetWidth / 2 - 8, left));
    top = Math.max(toolbarHeight + 8, Math.min(window.innerHeight - 8, top));

    toolbar.style.left = `${left}px`;
    toolbar.style.top = `${top}px`;
  }

  function syncStickerToolbar() {
    const toolbar = document.getElementById(TOOLBAR_ID);
    const sticker = document.querySelector(".book-page .placed-sticker.selected");
    if (!sticker || !sticker.querySelector(".sticker-controls")) {
      removeElement(TOOLBAR_ID);
      return;
    }
    if (!toolbar) createStickerToolbar(sticker);
    else positionStickerToolbar(sticker, toolbar);
  }

  function openFixedDoodle() {
    removeElement(DOODLE_ID);
    document.querySelector(".mm-doodle-fix")?.remove();

    const overlay = document.createElement("div");
    overlay.id = DOODLE_ID;
    overlay.innerHTML = `
      <canvas></canvas>
      <div class="mm-doodle-bar mm-enhanced">
        <button class="undo">↶ Undo</button>
        <button class="clear">Clear</button>
        <span class="mm-doodle-label">Color</span>
        <button class="mm-doodle-color active" data-color="#7655d3" style="background:#7655d3" title="Purple"></button>
        <button class="mm-doodle-color" data-color="#e85d8f" style="background:#e85d8f" title="Pink"></button>
        <button class="mm-doodle-color" data-color="#4f86e8" style="background:#4f86e8" title="Blue"></button>
        <button class="mm-doodle-color" data-color="#55a66a" style="background:#55a66a" title="Green"></button>
        <button class="mm-doodle-color" data-color="#e69b35" style="background:#e69b35" title="Orange"></button>
        <button class="mm-doodle-color" data-color="#333333" style="background:#333333" title="Black"></button>
        <span class="mm-doodle-label">Size</span>
        <button class="mm-doodle-size active" data-size="3">S</button>
        <button class="mm-doodle-size" data-size="6">M</button>
        <button class="mm-doodle-size" data-size="10">L</button>
        <button class="done">Done</button>
      </div>`;
    document.body.appendChild(overlay);
    document.body.classList.add("mindmate-doodling");

    const canvas = overlay.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let drawing = false;
    let last = null;
    let history = [];

    function resizeCanvas() {
      const old = canvas.width && canvas.height ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = ctx.strokeStyle || "#7655d3";
      if (old) { /* viewport resize is rare; start clean rather than offset the drawing */ }
    }
    resizeCanvas();

    const position = (event) => ({ x: event.clientX, y: event.clientY });
    const preventScroll = (event) => event.preventDefault();

    canvas.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      drawing = true;
      last = position(event);
      history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      canvas.setPointerCapture?.(event.pointerId);
    }, { passive: false });

    canvas.addEventListener("pointermove", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!drawing || !last) return;
      const next = position(event);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
      last = next;
    }, { passive: false });

    const stop = (event) => {
      event.preventDefault();
      drawing = false;
      last = null;
    };
    canvas.addEventListener("pointerup", stop, { passive: false });
    canvas.addEventListener("pointercancel", stop, { passive: false });
    overlay.addEventListener("touchmove", preventScroll, { passive: false });
    overlay.addEventListener("wheel", preventScroll, { passive: false });

    overlay.querySelector(".undo").onclick = () => {
      const previous = history.pop();
      if (previous) ctx.putImageData(previous, 0, 0);
    };
    overlay.querySelector(".clear").onclick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      history = [];
    };
    overlay.querySelectorAll(".mm-doodle-color").forEach((button) => {
      button.onclick = () => {
        ctx.strokeStyle = button.dataset.color;
        overlay.querySelectorAll(".mm-doodle-color").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
      };
    });
    overlay.querySelectorAll(".mm-doodle-size").forEach((button) => {
      button.onclick = () => {
        ctx.lineWidth = Number(button.dataset.size);
        overlay.querySelectorAll(".mm-doodle-size").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
      };
    });
    overlay.querySelector(".done").onclick = () => {
      document.body.classList.remove("mindmate-doodling");
      overlay.remove();
    };
  }

  function interceptDoodleButton() {
    const doodle = document.querySelector('.mm-toolbar .mm-tool[title="Doodle"]');
    if (!doodle || doodle.dataset.mmMobileDoodleFix === "1") return;
    doodle.dataset.mmMobileDoodleFix = "1";
    doodle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openFixedDoodle();
    }, true);
  }

  function sync() {
    interceptDoodleButton();
    syncStickerToolbar();
  }

  function start() {
    installStyles();
    sync();
    document.addEventListener("click", sync, true);
    document.addEventListener("pointerup", sync, true);
    window.addEventListener("resize", sync, { passive: true });
    window.addEventListener("scroll", sync, { passive: true });
    new MutationObserver(() => requestAnimationFrame(sync)).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
