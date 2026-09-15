const style = document.createElement("style");
style.textContent = `
  [data-mm-theme="dark"] .mm-wellness-nav button { background:#40365a !important; color:#eee8ff !important; border-color:#5b4e72 !important; }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-floral { background:#4b3652 !important; border-color:#8c648e !important; }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-dreamy { background:#35415a !important; border-color:#667fa8 !important; }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-nature { background:#354a3d !important; border-color:#668b70 !important; }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-night { background:#44365e !important; border-color:#8068a4 !important; }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-cute { background:#513b49 !important; border-color:#9a6e87 !important; }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-minimal { background:#41404d !important; border-color:#777487 !important; }
`;
document.head.appendChild(style);

function anchorStickerToolbar() {
  const sticker = document.querySelector(".placed-sticker.selected");
  const floating = document.querySelector(".mm-sticker-floating");
  const book = document.querySelector(".book-page");
  if (sticker && floating && book) {
    const rect = book.getBoundingClientRect();
    const x = parseFloat(sticker.style.left) || 50;
    const y = parseFloat(sticker.style.top) || 50;
    const left = rect.left + rect.width * x / 100;
    const top = rect.top + rect.height * y / 100 - 42;
    floating.style.left = `${Math.max(8, left - floating.offsetWidth / 2)}px`;
    floating.style.top = `${Math.max(8, top)}px`;
  }
  requestAnimationFrame(anchorStickerToolbar);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(anchorStickerToolbar), { once:true });
} else {
  requestAnimationFrame(anchorStickerToolbar);
}
