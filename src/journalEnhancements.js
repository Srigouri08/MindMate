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

      .mm-toolbar .mm-font-color-tool {
        position:relative;
        overflow:hidden;
      }
      .mm-toolbar .mm-font-color-tool .mm-font-color-dot {
        width:13px;
        height:13px;
        border-radius:50%;
        display:block;
        border:2px solid rgba(255,255,255,.9);
        box-shadow:0 0 0 1px rgba(82,63,110,.25);
        pointer-events:none;
      }
      .mm-toolbar .mm-font-color-tool:hover { transform:scale(1.06); }
      .mm-toolbar .mm-font-color-tool.mm-hidden { display:none !important; }
      .mm-font-color-popover {
        position:fixed;
        z-index:10020;
        width:54px;
        height:54px;
        padding:5px;
        border:1px solid #d9cfee;
        border-radius:14px;
        background:#fff;
        box-shadow:0 12px 28px rgba(58,39,115,.22);
      }
      .mm-font-color-popover input {
        width:100%;
        height:100%;
        padding:0;
        border:0;
        border-radius:9px;
        background:transparent;
        cursor:pointer;
      }
      body:has(.app.dark-mode) .mm-font-color-popover {
        background:#302943;
        border-color:#5b4f70;
      }
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
    if (!textarea) return;
    textarea.style.setProperty("color", color, "important");
    textarea.style.setProperty("caret-color", color, "important");
    localStorage.setItem("mindmate-font-color", color);
    const dot = document.querySelector(".mm-font-color-dot");
    if (dot) dot.style.background = color;
  }

  function createColorPicker() {
    if (document.querySelector(".mm-font-color-tool")) return;
    const toolbar = document.querySelector(".mm-toolbar");
    if (!toolbar) return;

    const button = document.createElement("button");
    button.className = "mm-tool mm-font-color-tool";
    button.title = "Font color";
    button.type = "button";
    button.innerHTML = '<span class="mm-font-color-dot"></span>';
    toolbar.appendChild(button);

    const popover = document.createElement("div");
    popover.className = "mm-font-color-popover";
    popover.style.display = "none";
    const input = document.createElement("input");
    input.type = "color";
    input.id = COLOR_ID;
    input.value = localStorage.getItem("mindmate-font-color") || "#4c4055";
    popover.appendChild(input);
    document.body.appendChild(popover);

    const place = () => {
      const rect = button.getBoundingClientRect();
      popover.style.left = `${Math.max(8, rect.left - 62)}px`;
      popover.style.top = `${Math.max(8, rect.top + rect.height / 2 - 27)}px`;
    };

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!editableScreen()) return;
      place();
      popover.style.display = popover.style.display === "none" ? "block" : "none";
      if (popover.style.display === "block") input.click();
    });

    input.addEventListener("input", () => applyColor(input.value));
    input.addEventListener("change", () => applyColor(input.value));
    document.addEventListener("click", (event) => {
      if (!popover.contains(event.target) && event.target !== button) popover.style.display = "none";
    });
  }

  function sync() {
    createColorPicker();
    const button = document.querySelector(".mm-font-color-tool");
    if (!button) return;
    button.classList.toggle("mm-hidden", !editableScreen());
    const textarea = getTextarea();
    const saved = localStorage.getItem("mindmate-font-color");
    if (textarea && editableScreen() && saved && !textarea.dataset.mmFontColorApplied) {
      textarea.style.setProperty("color", saved, "important");
      textarea.style.setProperty("caret-color", saved, "important");
      textarea.dataset.mmFontColorApplied = "1";
      const dot = button.querySelector(".mm-font-color-dot");
      if (dot) dot.style.background = saved;
    }
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
