// Page template styling only.
// Doodle interactions are intentionally handled by stickerControlsInteractionFix.js
// so there is exactly one doodle layer and it stays clipped to .book-page.
(() => {
  const STYLE_ID = "mindmate-creative-tools-style";
  const TEMPLATE_CLASSES = ["floral", "dreamy", "nature", "night", "cute", "minimal"];

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .book-page[class*="mm-template-"]{isolation:isolate;transition:background .25s ease,border-color .25s ease,box-shadow .25s ease}
      .book-page[class*="mm-template-"]::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;border-radius:inherit}
      .book-page[class*="mm-template-"]>.book-page-top,.book-page[class*="mm-template-"]>.margin-line,.book-page[class*="mm-template-"]>textarea,.book-page[class*="mm-template-"]>.placed-sticker,.book-page[class*="mm-template-"]>.book-hint{position:relative;z-index:1}
      .book-page.mm-template-floral{background:#fff7fc!important;border-color:#e5bfd9!important;box-shadow:inset 0 0 0 2px rgba(213,130,179,.12)!important}
      .book-page.mm-template-floral::before{background:radial-gradient(circle at 96% 7%,rgba(237,117,176,.25) 0 11px,transparent 12px),radial-gradient(circle at 91% 12%,rgba(179,122,215,.2) 0 7px,transparent 8px),radial-gradient(circle at 5% 92%,rgba(237,117,176,.15) 0 17px,transparent 18px),repeating-linear-gradient(0deg,transparent 0 31px,rgba(210,157,194,.17) 32px)}
      .book-page.mm-template-floral .book-title{background:#f4dfec!important;color:#91496f!important;border-color:#d89cba!important}
      .book-page.mm-template-dreamy{background:#f4f2ff!important;border-color:#c7c1e8!important;box-shadow:inset 0 0 0 2px rgba(128,113,190,.10)!important}
      .book-page.mm-template-dreamy::before{background:radial-gradient(ellipse at 91% 9%,rgba(255,255,255,.95) 0 27px,transparent 28px),radial-gradient(ellipse at 85% 10%,rgba(255,255,255,.8) 0 20px,transparent 21px),radial-gradient(circle at 14% 86%,rgba(132,116,199,.17) 0 4px,transparent 5px),radial-gradient(circle at 20% 79%,rgba(132,116,199,.13) 0 3px,transparent 4px)}
      .book-page.mm-template-dreamy .book-title{background:#e5e0fb!important;color:#61539a!important;border-color:#b9afe0!important}
      .book-page.mm-template-nature{background:#f7fff4!important;border-color:#bcd5b8!important;box-shadow:inset 0 0 0 2px rgba(85,140,77,.09)!important}
      .book-page.mm-template-nature::before{background:radial-gradient(ellipse at 95% 7%,rgba(78,145,77,.2) 0 18px,transparent 19px),radial-gradient(ellipse at 89% 13%,rgba(78,145,77,.13) 0 13px,transparent 14px),repeating-linear-gradient(0deg,transparent 0 31px,rgba(117,163,103,.15) 32px)}
      .book-page.mm-template-nature .book-title{background:#e5f2df!important;color:#4c7549!important;border-color:#a8c89e!important}
      .book-page.mm-template-night{background:#2e2843!important;border-color:#71638f!important;box-shadow:inset 0 0 0 2px rgba(255,244,184,.08)!important}
      .book-page.mm-template-night::before{background:radial-gradient(circle at 88% 9%,#fff3ae 0 3px,transparent 4px),radial-gradient(circle at 94% 17%,rgba(255,255,255,.85) 0 2px,transparent 3px),radial-gradient(circle at 80% 24%,rgba(255,255,255,.7) 0 2px,transparent 3px),radial-gradient(circle at 12% 84%,rgba(255,255,255,.5) 0 2px,transparent 3px)}
      .book-page.mm-template-night .book-title{background:#493c64!important;color:#fff0b7!important;border-color:#8172a5!important}
      .book-page.mm-template-night .today-date{color:#d9d0ea!important}
      .book-page.mm-template-night textarea{color:#f2edf8!important}
      .book-page.mm-template-cute{background:#fff7fa!important;border-color:#e8bccc!important;box-shadow:inset 0 0 0 2px rgba(225,105,145,.09)!important}
      .book-page.mm-template-cute::before{background:radial-gradient(circle at 94% 7%,rgba(232,91,139,.25) 0 7px,transparent 8px),radial-gradient(circle at 90% 7%,rgba(232,91,139,.25) 0 7px,transparent 8px),radial-gradient(circle at 92% 11%,rgba(232,91,139,.2) 0 10px,transparent 11px),repeating-linear-gradient(0deg,transparent 0 31px,rgba(231,166,187,.15) 32px)}
      .book-page.mm-template-cute .book-title{background:#ffe5ed!important;color:#a34c70!important;border-color:#df9db4!important}
      .book-page.mm-template-minimal{background:#fff!important;border-color:#d7d2dc!important;box-shadow:inset 0 0 0 1px rgba(80,70,95,.06)!important}
      .book-page.mm-template-minimal::before{background:repeating-linear-gradient(0deg,transparent 0 31px,rgba(110,100,125,.10) 32px)}
      .book-page.mm-template-minimal .book-title{background:#f4f2f6!important;color:#514a5c!important;border-color:#d3ced8!important}
      body:has(.app.dark-mode) .book-page.mm-template-minimal{background:#302b38!important;border-color:#5d5568!important}
      body:has(.app.dark-mode) .book-page.mm-template-minimal::before{background:repeating-linear-gradient(0deg,transparent 0 31px,rgba(225,215,235,.08) 32px)}
    `;
    document.head.appendChild(style);
  }

  function applyTemplate(name) {
    const book = document.querySelector(".book-page");
    if (!book) return;
    TEMPLATE_CLASSES.forEach((item) => book.classList.remove(`mm-template-${item}`));
    book.classList.add(`mm-template-${name}`);
    localStorage.setItem("mindmate-template", name);
  }

  function closePanel() { document.querySelector(".mm-creative-panel")?.remove(); }

  function openPanel() {
    closePanel();
    const panel = document.createElement("div");
    panel.className = "mm-panel mm-creative-panel";
    panel.innerHTML = `
      <button class="mm-close">×</button>
      <h3>🎨 Page Templates</h3>
      <p>Each template changes the page mood, accents and details.</p>
      <div class="mm-grid">
        <button class="mm-template-card mm-floral" data-template="floral"><strong>🌸 Soft Floral</strong><small>Pink accents + journal lines</small></button>
        <button class="mm-template-card mm-dreamy" data-template="dreamy"><strong>☁️ Dreamy</strong><small>Clouds + soft sky details</small></button>
        <button class="mm-template-card mm-nature" data-template="nature"><strong>🌿 Nature</strong><small>Leaves + fresh green lines</small></button>
        <button class="mm-template-card mm-night" data-template="night"><strong>🌙 Night Thoughts</strong><small>Dark page + little stars</small></button>
        <button class="mm-template-card mm-cute" data-template="cute"><strong>🎀 Cute</strong><small>Pink hearts + scrapbook feel</small></button>
        <button class="mm-template-card mm-minimal" data-template="minimal"><strong>🤍 Minimal</strong><small>Clean page + subtle lines</small></button>
      </div>`;
    document.body.appendChild(panel);
    panel.querySelector(".mm-close").onclick = closePanel;
    panel.querySelectorAll("[data-template]").forEach((button) => {
      button.onclick = () => {
        applyTemplate(button.dataset.template);
        closePanel();
      };
    });
  }

  function wire() {
    const button = document.querySelector('.mm-toolbar .mm-tool[title="Page templates"]');
    if (!button || button.dataset.mmTemplateOnlyWired === "1") return;
    button.dataset.mmTemplateOnlyWired = "1";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openPanel();
    }, true);
  }

  function restore() {
    const saved = localStorage.getItem("mindmate-template");
    const book = document.querySelector(".book-page");
    if (saved && TEMPLATE_CLASSES.includes(saved) && book) applyTemplate(saved);
  }

  function start() {
    installStyles();
    wire();
    restore();
    new MutationObserver(() => requestAnimationFrame(() => { wire(); restore(); })).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
