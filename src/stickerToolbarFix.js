(() => {
  const STYLE_ID = "mindmate-sticker-fix-style";

  function install() {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        .mm-toolbar .mm-tool.add {
          background: #f1eaff !important;
          color: #6045a0 !important;
        }
        .mm-toolbar .mm-tool.add:hover {
          background: #dfd0ff !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function openReactStickerPicker() {
    const button = document.querySelector('button[title="Add stickers"]');
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
