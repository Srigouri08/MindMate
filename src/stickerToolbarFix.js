(() => {
  const STYLE_ID = "mindmate-sticker-fix-style";

  function install() {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        /* Keep Add Photo consistent in light mode and properly dark in dark mode. */
        .mm-toolbar .mm-tool.add {
          background: #f1eaff !important;
          color: #6045a0 !important;
          border: 1px solid transparent !important;
        }
        .mm-toolbar .mm-tool.add:hover {
          background: #dfd0ff !important;
        }
        body:has(.app.dark-mode) .mm-toolbar .mm-tool.add {
          background: #40355a !important;
          color: #eee7ff !important;
          border-color: #514668 !important;
        }
        body:has(.app.dark-mode) .mm-toolbar .mm-tool.add:hover {
          background: #55466f !important;
        }

        /* Keep sticker controls attached to the sticker instead of drifting away. */
        .book-page .placed-sticker {
          width: max-content !important;
          height: max-content !important;
        }
        .book-page .placed-sticker .sticker-controls {
          left: 50% !important;
          top: -48px !important;
          transform: translateX(-50%) !important;
          width: max-content !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function openReactStickerPicker() {
    const button = document.querySelector('.top-actions .icon-button[title="Add stickers"]');
    if (!button) return false;
    button.click();
    return true;
  }

  function wireStickerTool() {
    const toolbarButton = document.querySelector('.mm-toolbar .mm-tool[title="Stickers"]');
    if (!toolbarButton || toolbarButton.dataset.mmStickerWired === "1") return;

    toolbarButton.dataset.mmStickerWired = "1";
    toolbarButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openReactStickerPicker();
    }, true);
  }

  function start() {
    install();
    wireStickerTool();
    const observer = new MutationObserver(() => requestAnimationFrame(wireStickerTool));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
