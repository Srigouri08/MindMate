// Safe UI-only fixes for sticker controls and doodle boundaries.
// This file is already imported by main.jsx; no new import is required.
(() => {
  const STYLE_ID = "mindmate-safe-creative-fix";

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .book-page .placed-sticker.selected .sticker-controls {
        z-index: 50 !important;
        transform-origin: center center !important;
        white-space: nowrap !important;
      }
      .mm-doodle.mm-doodle-fix canvas {
        clip-path: inset(0 0 0 0);
        -webkit-clip-path: inset(0 0 0 0);
      }
    `;
    document.head.appendChild(style);
  }

  function rotationFromTransform(element) {
    const value = getComputedStyle(element).transform;
    if (!value || value === "none") return 0;
    const match = value.match(/^matrix\((-?[0-9.eE+-]+),\s*(-?[0-9.eE+-]+),/);
    if (!match) return 0;
    return Math.atan2(Number(match[2]), Number(match[1])) * 180 / Math.PI;
  }

  function syncStickerControls() {
    document.querySelectorAll(".book-page .placed-sticker.selected").forEach((sticker) => {
      const controls = sticker.querySelector(".sticker-controls");
      if (!controls) return;
      const angle = rotationFromTransform(sticker);
      const rect = sticker.getBoundingClientRect();
      const parentRect = sticker.parentElement.getBoundingClientRect();
      const x = rect.left + rect.width / 2 - parentRect.left;
      const y = rect.top - parentRect.top - 10;
      controls.style.setProperty("left", `${x}px`, "important");
      controls.style.setProperty("top", `${y}px`, "important");
      controls.style.setProperty("transform", `translate(-50%, -100%) rotate(${-angle}deg)`, "important");
    });
  }

  function clipDoodleCanvas() {
    const doodle = document.querySelector(".mm-doodle.mm-doodle-fix");
    const book = document.querySelector(".book-page");
    if (!doodle || !book) return;
    const canvas = doodle.querySelector("canvas");
    if (!canvas) return;

    const page = book.getBoundingClientRect();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const top = Math.max(0, page.top);
    const left = Math.max(0, page.left);
    const right = Math.max(0, width - page.right);
    const bottom = Math.max(0, height - page.bottom);
    const clip = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
    canvas.style.clipPath = clip;
    canvas.style.webkitClipPath = clip;
  }

  function start() {
    addStyles();
    let frame = 0;
    const sync = () => {
      syncStickerControls();
      clipDoodleCanvas();
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };
    sync();
    document.addEventListener("click", schedule, true);
    document.addEventListener("pointerup", schedule, true);
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
