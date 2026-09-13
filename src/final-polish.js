(() => {
  const STYLE_ID = "mindmate-final-polish-style";
  const prompts = [
    "What made you smile today?",
    "What has been on your mind lately?",
    "What is one small thing you are proud of today?",
    "Describe one moment you want to remember.",
    "What do you need a little more of right now?",
  ];

  const css = `
    /* Keep floating UI outside React in sync with the selected app theme. */
    body[data-mm-theme="dark"] .mm-feature-modal .mm-feature-card,
    body[data-mm-theme="dark"] .mm-final-panel,
    body[data-mm-theme="dark"] .mm-photo-panel {
      background:#29243a !important;
      color:#eee7fa !important;
      border-color:#514668 !important;
      box-shadow:0 22px 55px rgba(0,0,0,.45) !important;
    }
    body[data-mm-theme="dark"] .mm-feature-modal { background:rgba(7,5,15,.62) !important; }
    body[data-mm-theme="dark"] .mm-feature-head h2,
    body[data-mm-theme="dark"] .mm-final-panel h3,
    body[data-mm-theme="dark"] .mm-photo-panel h3 { color:#f1eaff !important; }
    body[data-mm-theme="dark"] .mm-feature-head p,
    body[data-mm-theme="dark"] .mm-final-panel p,
    body[data-mm-theme="dark"] .mm-photo-panel p { color:#bdb3c8 !important; }
    body[data-mm-theme="dark"] .mm-feature-input,
    body[data-mm-theme="dark"] .mm-final-panel input,
    body[data-mm-theme="dark"] .mm-photo-panel input {
      background:#211d2e !important;color:#eee7fa !important;border-color:#554a69 !important;
    }
    body[data-mm-theme="dark"] .mm-feature-answer,
    body[data-mm-theme="dark"] .mm-stat,
    body[data-mm-theme="dark"] .mm-result,
    body[data-mm-theme="dark"] .mm-day,
    body[data-mm-theme="dark"] .mm-prompt,
    body[data-mm-theme="dark"] .mm-final-choice,
    body[data-mm-theme="dark"] .mm-frame-choice { background:#352e47 !important;color:#eee7fa !important;border-color:#55496b !important; }
    body[data-mm-theme="dark"] .mm-feature-secondary,
    body[data-mm-theme="dark"] .mm-calendar-head button,
    body[data-mm-theme="dark"] .mm-feature-close,
    body[data-mm-theme="dark"] .mm-close-final { background:#40365a !important;color:#eee7fa !important;border-color:#5b4e72 !important; }
    body[data-mm-theme="dark"] .mm-prompt-hint { background:#40365a !important;color:#c4b8d7 !important; }

    /* Floating journal toolbar follows the app theme too. */
    body[data-mm-theme="dark"] .mm-toolbar[data-mm-final],
    body[data-mm-theme="dark"] .mm-toolbar[data-mm-final].mm-scoped-toolbar {
      background:rgba(35,30,48,.98) !important;border-color:#514668 !important;box-shadow:0 12px 30px rgba(0,0,0,.42) !important;
    }
    body[data-mm-theme="dark"] .mm-toolbar[data-mm-final] .mm-tool,
    body[data-mm-theme="dark"] .mm-toolbar[data-mm-final].mm-scoped-toolbar .mm-tool {
      background:#302943 !important;border-color:#514668 !important;color:#eee7fa !important;
    }
    body[data-mm-theme="dark"] .mm-toolbar[data-mm-final] .mm-tool:hover { background:#46385f !important;border-color:#77639e !important; }
    body[data-mm-theme="dark"] .mm-toolbar[data-mm-final] .mm-tool.add { background:#7655d3 !important;border-color:#7655d3 !important;color:#fff !important; }

    /* Make the template chooser clean and intentional. */
    .mm-final-panel .mm-template-grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important;gap:10px !important; }
    .mm-final-panel .mm-template-grid button {
      min-height:86px !important;height:86px !important;padding:13px 14px !important;
      display:flex !important;flex-direction:column !important;justify-content:center !important;align-items:flex-start !important;
      gap:5px !important;text-align:left !important;line-height:1.15 !important;overflow:hidden !important;
    }
    .mm-final-panel .mm-template-grid button strong { display:block !important;font-size:14px !important;line-height:1.2 !important;white-space:nowrap !important; }
    .mm-final-panel .mm-template-grid button small { display:block !important;font-size:11px !important;line-height:1.25 !important;opacity:.78 !important;white-space:normal !important; }
    .mm-final-panel .mm-template-grid .mm-reset-final-template { min-height:56px !important;height:56px !important;align-items:center !important; }

    /* Writing prompts live softly inside the journal page, not as a separate block. */
    .book-page textarea[data-mm-prompt-watermark="1"]::placeholder { opacity:.48 !important;transition:opacity .2s ease; }
    .book-page textarea[data-mm-prompt-watermark="1"]:focus::placeholder { opacity:.30 !important; }

    @media(max-width:600px){
      .mm-final-panel .mm-template-grid { grid-template-columns:1fr !important; }
      .mm-final-panel .mm-template-grid button { height:78px !important;min-height:78px !important; }
    }
  `;

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function syncTheme() {
    const app = document.querySelector(".app");
    document.body.dataset.mmTheme = app?.classList.contains("dark-mode") ? "dark" : "light";
  }

  function removeWeeklyReflection() {
    document.querySelectorAll(".sidebar .side-item").forEach((button) => {
      if (/Weekly Reflection/i.test(button.textContent || "")) button.remove();
    });
  }

  function setPromptWatermark() {
    const textarea = document.querySelector(".book-page textarea");
    if (!textarea) return;
    const isNew = [...document.querySelectorAll(".sidebar .side-item")]
      .some((button) => /New Entry/i.test(button.textContent || "") && button.classList.contains("active"));
    if (!isNew) {
      textarea.removeAttribute("data-mm-prompt-watermark");
      return;
    }
    if (!textarea.value.trim()) {
      if (!textarea.dataset.mmPromptText) {
        const index = Number(localStorage.getItem("mindmate-prompt-index") || 0);
        textarea.dataset.mmPromptText = prompts[index % prompts.length];
      }
      textarea.placeholder = textarea.dataset.mmPromptText;
      textarea.dataset.mmPromptWatermark = "1";
    } else {
      textarea.removeAttribute("data-mm-prompt-watermark");
    }
  }

  function cleanTemplatePanel() {
    const panel = document.querySelector(".mm-final-panel");
    if (!panel || !/Page Templates/i.test(panel.textContent || "")) return;
    panel.querySelectorAll(".mm-template-grid button").forEach((button) => {
      const strong = button.querySelector("strong");
      const small = button.querySelector("small");
      if (strong) strong.style.display = "block";
      if (small) small.style.display = "block";
    });
  }

  function wire() {
    installStyles();
    syncTheme();
    removeWeeklyReflection();
    setPromptWatermark();
    cleanTemplatePanel();
  }

  function start() {
    wire();
    const observer = new MutationObserver(() => requestAnimationFrame(wire));
    observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:["class","value"] });
    setInterval(wire, 500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
  else start();
})();
