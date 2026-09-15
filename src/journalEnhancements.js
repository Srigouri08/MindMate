(() => {
  const STYLE_ID = "mindmate-journal-enhancements-style";
  const COLOR_ID = "mindmate-font-color-input";

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* Template text must stay readable on every page theme. */
      .book-page.mm-template-floral textarea { color:#5a3b4d !important; caret-color:#5a3b4d !important; }
      .book-page.mm-template-dreamy textarea { color:#443b61 !important; caret-color:#443b61 !important; }
      .book-page.mm-template-nature textarea { color:#365a34 !important; caret-color:#365a34 !important; }
      .book-page.mm-template-cute textarea { color:#65394b !important; caret-color:#65394b !important; }
      .book-page.mm-template-night textarea { color:#f2edf8 !important; caret-color:#f2edf8 !important; }
      .book-page.mm-template-minimal textarea { color:#3f3947 !important; caret-color:#3f3947 !important; }
      body:has(.app.dark-mode) .book-page.mm-template-floral textarea { color:#f4ddeb !important; caret-color:#f4ddeb !important; }
      body:has(.app.dark-mode) .book-page.mm-template-dreamy textarea { color:#eee9ff !important; caret-color:#eee9ff !important; }
      body:has(.app.dark-mode) .book-page.mm-template-nature textarea { color:#e5f4df !important; caret-color:#e5f4df !important; }
      body:has(.app.dark-mode) .book-page.mm-template-cute textarea { color:#ffe8ef !important; caret-color:#ffe8ef !important; }

      .mm-toolbar .mm-font-color-tool { position:relative; }
      .mm-toolbar .mm-font-color-tool .mm-font-color-letter {
        display:flex;
        align-items:center;
        justify-content:center;
        width:100%;
        height:100%;
        font:700 21px Georgia,serif;
        line-height:1;
        color:#eee7ff;
        position:relative;
        pointer-events:none;
      }
      .mm-toolbar .mm-font-color-tool .mm-font-color-letter::after {
        content:"";
        position:absolute;
        width:17px;
        height:3px;
        border-radius:3px;
        background:var(--mm-font-color,#8d6bd1);
        bottom:5px;
        left:50%;
        transform:translateX(-50%);
      }
      .mm-toolbar .mm-font-color-tool:hover { transform:scale(1.06); }
      .mm-toolbar .mm-font-color-tool.mm-hidden { display:none !important; }

      .mm-font-color-popover {
        position:fixed;
        z-index:10020;
        width:190px;
        min-height:92px;
        box-sizing:border-box;
        padding:12px;
        border:1px solid #d9cfee;
        border-radius:15px;
        background:#fff;
        box-shadow:0 12px 30px rgba(58,39,115,.22);
      }
      .mm-font-color-popover-title {
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom:9px;
        color:#514267;
        font:700 12px Arial,sans-serif;
      }
      .mm-font-color-popover-title small { color:#8a7c9e; font-weight:500; }
      .mm-font-color-popover-row { display:flex; align-items:center; gap:9px; }
      .mm-font-color-popover input {
        width:52px;
        height:36px;
        padding:0;
        border:1px solid #d9cfee;
        border-radius:9px;
        background:transparent;
        cursor:pointer;
      }
      .mm-font-color-hex { color:#756784; font:600 12px Arial,sans-serif; }
      body:has(.app.dark-mode) .mm-font-color-popover {
        background:#302943;
        border-color:#5b4f70;
      }
      body:has(.app.dark-mode) .mm-font-color-popover-title { color:#eee7ff; }
      body:has(.app.dark-mode) .mm-font-color-popover-title small,
      body:has(.app.dark-mode) .mm-font-color-hex { color:#b9accd; }
      body:has(.app.dark-mode) .mm-font-color-popover input { border-color:#5b4f70; }
    `;
    document.head.appendChild(style);
  }

  function editableScreen() {
    return [...document.querySelectorAll(".action-row .primary-action")]
      .some((button) => /save (entry|changes)/i.test(button.textContent.trim()));
  }

  function getTextarea() {
    return document.querySelector(".book-page textarea");
  }

  function applyColor(color) {
    const textarea = getTextarea();
    if (textarea) {
      textarea.style.setProperty("color", color, "important");
      textarea.style.setProperty("caret-color", color, "important");
    }
    localStorage.setItem("mindmate-font-color", color);
    const letter = document.querySelector(".mm-font-color-letter");
    if (letter) letter.style.setProperty("--mm-font-color", color);
    const hex = document.querySelector(".mm-font-color-hex");
    if (hex) hex.textContent = color.toUpperCase();
  }

  function createColorPicker() {
    if (document.querySelector(".mm-font-color-tool")) return;
    const toolbar = document.querySelector(".mm-toolbar");
    if (!toolbar) return;

    const button = document.createElement("button");
    button.className = "mm-tool mm-font-color-tool";
    button.title = "Font color";
    button.type = "button";
    button.innerHTML = '<span class="mm-font-color-letter">A</span>';
    toolbar.appendChild(button);

    const popover = document.createElement("div");
    popover.className = "mm-font-color-popover";
    popover.style.display = "none";
    popover.innerHTML = '<div class="mm-font-color-popover-title"><span>Font color</span><small>Choose a color</small></div><div class="mm-font-color-popover-row"><input type="color" id="mindmate-font-color-input"><span class="mm-font-color-hex"></span></div>';
    document.body.appendChild(popover);
    const input = popover.querySelector("input");
    input.value = localStorage.getItem("mindmate-font-color") || "#4c4055";

    const place = () => {
      const rect = button.getBoundingClientRect();
      const width = 190;
      const gap = 10;
      let left = rect.left - width - gap;
      if (left < 8) left = Math.min(window.innerWidth - width - 8, rect.right + gap);
      popover.style.left = `${Math.max(8, left)}px`;
      popover.style.top = `${Math.max(8, Math.min(window.innerHeight - 110, rect.top + rect.height / 2 - 46))}px`;
    };

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!editableScreen()) return;
      place();
      const opening = popover.style.display === "none";
      popover.style.display = opening ? "block" : "none";
      if (opening) applyColor(input.value);
    });

    input.addEventListener("input", () => applyColor(input.value));
    input.addEventListener("change", () => applyColor(input.value));
    document.addEventListener("click", (event) => {
      if (!popover.contains(event.target) && event.target !== button) popover.style.display = "none";
    });
    window.addEventListener("resize", place);
  }

  function sync() {
    createColorPicker();
    const button = document.querySelector(".mm-font-color-tool");
    if (!button) return;
    button.classList.toggle("mm-hidden", !editableScreen());
    const textarea = getTextarea();
    const saved = localStorage.getItem("mindmate-font-color");
    if (textarea && editableScreen() && saved) {
      textarea.style.setProperty("color", saved, "important");
      textarea.style.setProperty("caret-color", saved, "important");
    }
    const letter = button.querySelector(".mm-font-color-letter");
    if (letter && saved) letter.style.setProperty("--mm-font-color", saved);
    const input = document.getElementById(COLOR_ID);
    if (input && saved && input.value !== saved) input.value = saved;
    const hex = document.querySelector(".mm-font-color-hex");
    if (hex) hex.textContent = (saved || "#4C4055").toUpperCase();
  }

  function start() {
    installStyles();
    sync();
    const observer = new MutationObserver(() => requestAnimationFrame(sync));
    observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:["class"] });
    window.addEventListener("resize", () => requestAnimationFrame(sync));
    setInterval(sync, 700);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
