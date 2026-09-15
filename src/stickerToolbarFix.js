(() => {
  const STYLE_ID = "mindmate-sticker-fix-style";
  let started = false;

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .mm-toolbar .mm-tool.add { background:#f1eaff !important; color:#6045a0 !important; border:1px solid transparent !important; }
      .mm-toolbar .mm-tool.add:hover { background:#dfd0ff !important; }
      body:has(.app.dark-mode) .mm-toolbar .mm-tool.add { background:#40355a !important; color:#eee7ff !important; border-color:#514668 !important; }
      body:has(.app.dark-mode) .mm-toolbar .mm-tool.add:hover { background:#55466f !important; }
      .book-page .placed-sticker { width:max-content !important; height:max-content !important; touch-action:none !important; }
      .book-page .placed-sticker .sticker-controls { left:50% !important; top:-48px !important; width:max-content !important; }
    `;
    document.head.appendChild(style);
  }

  function openReactStickerPicker() {
    window.dispatchEvent(new CustomEvent("mindmate-open-stickers"));
  }

  function wireStickerTool() {
    const toolbarButton = document.querySelector('.mm-toolbar .mm-tool[title="Stickers"]');
    if (!toolbarButton || toolbarButton.dataset.mmStickerWired === "1") return;
    toolbarButton.dataset.mmStickerWired = "1";
    toolbarButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openReactStickerPicker();
    });
  }

  function keepControlsLevel(sticker) {
    if (!sticker) return;
    const controls = sticker.querySelector(".sticker-controls");
    if (!controls) return;
    const match = (sticker.style.transform || "").match(/rotate\(\s*(-?[\d.]+)deg\s*\)/i);
    const rotation = match ? parseFloat(match[1]) || 0 : 0;
    controls.style.setProperty("transform", `translateX(-50%) rotate(${-rotation}deg)`, "important");
    controls.style.setProperty("transform-origin", "center center", "important");
  }

  function syncSelectedStickerControls() {
    document.querySelectorAll(".book-page .placed-sticker.selected").forEach(keepControlsLevel);
  }

  function start() {
    if (started) return;
    started = true;
    installStyles();
    wireStickerTool();

    // React owns sticker dragging now. We deliberately do not attach a global
    // pointermove handler here; that was causing lag and fighting React state.
    document.addEventListener("click", (event) => {
      const button = event.target.closest?.(".sticker-controls button");
      if (!button) return;
      requestAnimationFrame(syncSelectedStickerControls);
    }, { passive:true });

    // Give React one frame to render the controls after a sticker is selected.
    document.addEventListener("pointerup", (event) => {
      if (event.target.closest?.(".placed-sticker")) requestAnimationFrame(syncSelectedStickerControls);
    }, { passive:true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
