(() => {
  const STYLE_ID = "mindmate-sticker-fix-style";
  let drag = null;

  function install() {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        .mm-toolbar .mm-tool.add { background:#f1eaff !important; color:#6045a0 !important; border:1px solid transparent !important; }
        .mm-toolbar .mm-tool.add:hover { background:#dfd0ff !important; }
        body:has(.app.dark-mode) .mm-toolbar .mm-tool.add { background:#40355a !important; color:#eee7ff !important; border-color:#514668 !important; }
        body:has(.app.dark-mode) .mm-toolbar .mm-tool.add:hover { background:#55466f !important; }
        .book-page .placed-sticker { width:max-content !important; height:max-content !important; }
        .book-page .placed-sticker .sticker-controls { left:50% !important; top:-48px !important; transform:translateX(-50%) !important; width:max-content !important; }
        .book-page .placed-sticker { touch-action:none !important; }
      `;
      document.head.appendChild(style);
    }
  }

  function openReactStickerPicker() {
    const button = document.querySelector('.top-actions .icon-button[title="Add stickers"]');
    if (button) {
      button.click();
      return true;
    }

    // The ribbon button was intentionally removed. The React app can expose
    // its sticker state through this small event bridge instead.
    window.dispatchEvent(new CustomEvent("mindmate-open-stickers"));
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

  function isEditableScreen() {
    return [...document.querySelectorAll(".action-row .primary-action")]
      .some((button) => /save (entry|changes)/i.test(button.textContent.trim()));
  }

  function startDrag(event) {
    if (!isEditableScreen()) return;
    const sticker = event.target.closest?.(".placed-sticker");
    if (!sticker || event.target.closest?.(".sticker-controls")) return;
    const page = sticker.closest(".book-page");
    if (!page || !document.body.contains(page)) return;

    drag = {
      sticker,
      page,
      pointerId: event.pointerId,
      startLeft: parseFloat(sticker.style.left) || 0,
      startTop: parseFloat(sticker.style.top) || 0,
      startX: event.clientX,
      startY: event.clientY,
    };
  }

  function moveDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId || !document.body.contains(drag.sticker)) return;
    const rect = drag.page.getBoundingClientRect();
    const dx = ((event.clientX - drag.startX) / rect.width) * 100;
    const dy = ((event.clientY - drag.startY) / rect.height) * 100;
    const x = Math.max(3, Math.min(97, drag.startLeft + dx));
    const y = Math.max(5, Math.min(95, drag.startTop + dy));
    drag.sticker.style.left = `${x}%`;
    drag.sticker.style.top = `${y}%`;
  }

  function endDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    moveDrag(event);

    const app = document.querySelector(".app");
    if (app) {
      try {
        app.dispatchEvent(new PointerEvent("pointermove", {
          bubbles: true,
          clientX: event.clientX,
          clientY: event.clientY,
          pointerId: event.pointerId,
          pointerType: event.pointerType,
        }));
      } catch (_) {}
    }
    drag = null;
  }

  function start() {
    install();
    wireStickerTool();
    document.addEventListener("pointerdown", startDrag, true);
    document.addEventListener("pointermove", moveDrag, true);
    document.addEventListener("pointerup", endDrag, true);
    document.addEventListener("pointercancel", endDrag, true);
    const observer = new MutationObserver(() => requestAnimationFrame(wireStickerTool));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
