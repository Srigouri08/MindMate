(() => {
  const STYLE_ID = "mindmate-creative-polish-style";
  const templateSymbols = {
    floral: ["🌸", "✿", "🌷", "❀"],
    dreamy: ["☁️", "✦", "☾", "⋆"],
    nature: ["🍃", "🌿", "☘️", "🌱"],
    night: ["✦", "☾", "⋆", "✧"],
    cute: ["🎀", "♡", "💕", "✿"],
    minimal: ["·", "⌁", "·", "⌁"]
  };

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* Make doodle colors visible in both light and dark mode. */
      .mm-doodle-bar .mm-doodle-color{position:relative!important;overflow:visible!important;background-image:none!important}
      .mm-doodle-bar .mm-doodle-color::before{content:"";position:absolute;inset:3px;border-radius:50%;background:inherit!important;z-index:0}
      .mm-doodle-bar .mm-doodle-color.active{outline:3px solid #7655d3!important;outline-offset:2px!important;transform:scale(1.12)!important}
      .mm-doodle-bar .mm-doodle-color.active::after{content:"✓"!important;position:absolute!important;inset:0!important;display:grid!important;place-items:center!important;color:#fff!important;font-size:15px!important;font-weight:900!important;text-shadow:0 1px 3px #000!important;z-index:2!important}
      body:has(.app.dark-mode) .mm-doodle-bar .mm-doodle-color{border-color:#f7f2ff!important;box-shadow:0 0 0 1px #8e80aa,0 2px 6px rgba(0,0,0,.45)!important}
      body:has(.app.dark-mode) .mm-doodle-bar .mm-doodle-size{background:#40355a!important;color:#eee7ff!important;border-color:#625679!important}
      body:has(.app.dark-mode) .mm-doodle-bar .mm-doodle-size.active{background:#7655d3!important;color:#fff!important;border-color:#9b83df!important}

      /* Four decorative corner symbols for every template. */
      .mm-template-corners{position:absolute!important;inset:0!important;pointer-events:none!important;z-index:4!important}
      .mm-template-corner{position:absolute!important;font-size:24px!important;line-height:1!important;opacity:.82!important;filter:drop-shadow(0 2px 3px rgba(50,30,80,.12))!important}
      .mm-template-corner.tl{top:14px!important;left:24px!important}.mm-template-corner.tr{top:14px!important;right:24px!important}
      .mm-template-corner.bl{bottom:18px!important;left:24px!important}.mm-template-corner.br{bottom:18px!important;right:24px!important}
      .book-page.mm-template-floral .mm-template-corner{color:#d76c9d!important}
      .book-page.mm-template-dreamy .mm-template-corner{color:#8877c4!important}
      .book-page.mm-template-nature .mm-template-corner{color:#57945c!important}
      .book-page.mm-template-night .mm-template-corner{color:#ffe8a3!important;text-shadow:0 0 8px rgba(255,238,160,.35)!important}
      .book-page.mm-template-cute .mm-template-corner{color:#df648f!important}
      .book-page.mm-template-minimal .mm-template-corner{color:#827889!important}
    `;
    document.head.appendChild(style);
  }

  function decorateTemplate(book) {
    const match = [...book.classList].find((name) => name.startsWith("mm-template-"));
    if (!match) return;
    const name = match.replace("mm-template-", "");
    const symbols = templateSymbols[name];
    if (!symbols) return;
    let holder = book.querySelector(".mm-template-corners");
    if (!holder) {
      holder = document.createElement("div");
      holder.className = "mm-template-corners";
      holder.innerHTML = '<span class="mm-template-corner tl"></span><span class="mm-template-corner tr"></span><span class="mm-template-corner bl"></span><span class="mm-template-corner br"></span>';
      book.appendChild(holder);
    }
    const corners = holder.querySelectorAll(".mm-template-corner");
    corners.forEach((corner, index) => { corner.textContent = symbols[index]; });
  }

  function forceDoodleColors() {
    document.querySelectorAll(".mm-doodle-bar .mm-doodle-color").forEach((button) => {
      const color = button.dataset.color;
      if (color) button.style.setProperty("background-color", color, "important");
      if (button.classList.contains("active")) button.style.setProperty("background-color", color, "important");
    });
  }

  function fixAddPhoto() {
    const button = document.querySelector('.mm-toolbar .mm-tool[title="Add photo"]');
    if (!button) return;
    const dark = document.querySelector(".app.dark-mode");
    button.style.setProperty("background", dark ? "#40355a" : "#f1eaff", "important");
    button.style.setProperty("background-color", dark ? "#40355a" : "#f1eaff", "important");
    button.style.setProperty("color", dark ? "#eee7ff" : "#6045a0", "important");
    button.style.setProperty("border-color", dark ? "#514668" : "transparent", "important");
  }

  function sync() {
    installStyles();
    const book = document.querySelector(".book-page");
    if (book) decorateTemplate(book);
    forceDoodleColors();
    fixAddPhoto();
  }

  function start() {
    sync();
    new MutationObserver(() => requestAnimationFrame(sync)).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
