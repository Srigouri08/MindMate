(() => {
  const STYLE_ID = "mindmate-sticker-fix-style";
  let started = false;
  let toolbarObserver = null;

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
    if (!toolbarButton) return false;
    if (toolbarButton.dataset.mmStickerWired === "1") return true;

    // Remove the old inline handler from index.html so it cannot open a second
    // picker or recursively click itself. React owns the actual sticker picker.
    const cleanButton = toolbarButton.cloneNode(true);
    toolbarButton.replaceWith(cleanButton);
    cleanButton.dataset.mmStickerWired = "1";
    cleanButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openReactStickerPicker();
    });
    return true;
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
    if (!wireStickerTool()) {
      // The toolbar is created by the static page script. Watch only until its
      // sticker button exists, then disconnect so this cannot become a hot path.
      toolbarObserver = new MutationObserver(() => {
        if (wireStickerTool() && toolbarObserver) {
          toolbarObserver.disconnect();
          toolbarObserver = null;
        }
      });
      toolbarObserver.observe(document.body, { childList:true, subtree:true });
    }

    // React owns sticker dragging now. We deliberately do not attach a global
    // pointermove handler here; that was causing lag and fighting React state.
    document.addEventListener("click", (event) => {
      const button = event.target.closest?.(".sticker-controls button");
      if (!button) return;
      requestAnimationFrame(syncSelectedStickerControls);
    }, { passive:true });

    document.addEventListener("pointerup", (event) => {
      if (event.target.closest?.(".placed-sticker")) requestAnimationFrame(syncSelectedStickerControls);
    }, { passive:true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
