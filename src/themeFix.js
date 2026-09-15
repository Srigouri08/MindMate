const style = document.createElement("style");
style.textContent = `
  /* Keep every floating feature in the same visual theme as MindMate. */
  [data-mm-theme="light"] .mm-feature-modal,
  [data-mm-theme="light"] .mm-final-panel,
  [data-mm-theme="light"] .mm-sticker-floating,
  [data-mm-theme="light"] .mm-final-doodle-bar,
  [data-mm-theme="light"] .mm-toolbar[data-mm-final] {
    color-scheme: light;
  }

  [data-mm-theme="dark"] .mm-final-panel,
  [data-mm-theme="dark"] .mm-sticker-floating,
  [data-mm-theme="dark"] .mm-final-doodle-bar,
  [data-mm-theme="dark"] .mm-toolbar[data-mm-final] {
    background: #2d273d !important;
    color: #eee8ff !important;
    border-color: #514667 !important;
    box-shadow: 0 18px 45px rgba(0,0,0,.42) !important;
  }

  [data-mm-theme="dark"] .mm-final-panel p,
  [data-mm-theme="dark"] .mm-final-panel small {
    color: #b9aecb !important;
  }

  [data-mm-theme="dark"] .mm-final-choice,
  [data-mm-theme="dark"] .mm-final-panel input,
  [data-mm-theme="dark"] .mm-final-doodle-bar button {
    background: #40365a !important;
    color: #eee8ff !important;
    border-color: #5b4e72 !important;
  }

  [data-mm-theme="dark"] .mm-final-choice.active {
    background: #59477f !important;
    border-color: #9a7fe0 !important;
  }

  [data-mm-theme="dark"] .mm-final-panel .mm-t-night {
    background: #514268 !important;
  }

  [data-mm-theme="dark"] .mm-sticker-floating button {
    background: #40365a !important;
    color: #eee8ff !important;
  }

  [data-mm-theme="dark"] .mm-sticker-floating .remove {
    background: #603846 !important;
    color: #ffdce4 !important;
  }

  [data-mm-theme="dark"] .mm-toolbar[data-mm-final] .mm-tool {
    background: #40365a !important;
    color: #eee8ff !important;
    border-color: #5b4e72 !important;
  }

  [data-mm-theme="dark"] .mm-toolbar[data-mm-final] .mm-tool:hover,
  [data-mm-theme="dark"] .mm-toolbar[data-mm-final] .mm-tool:focus {
    background: #59477f !important;
    color: #fff !important;
  }

  [data-mm-theme="light"] .mm-toolbar[data-mm-final] .mm-tool {
    background: #f1eaff !important;
    color: #503a87 !important;
    border-color: #d6c7f5 !important;
  }

  [data-mm-theme="light"] .mm-toolbar[data-mm-final] .mm-tool:hover,
  [data-mm-theme="light"] .mm-toolbar[data-mm-final] .mm-tool:focus {
    background: #e2d4ff !important;
  }

  /* Clean up the template cards so the title and description read as two deliberate lines. */
  .mm-template-grid button {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: center !important;
    gap: 5px !important;
    min-height: 92px !important;
    line-height: 1.3 !important;
    font-family: Arial, sans-serif !important;
  }

  .mm-template-grid button strong {
    display: block !important;
    width: 100% !important;
    font-size: 15px !important;
    line-height: 1.25 !important;
    letter-spacing: .05px !important;
  }

  .mm-template-grid button small {
    display: block !important;
    width: 100% !important;
    font-size: 11px !important;
    line-height: 1.35 !important;
    font-weight: 500 !important;
    opacity: .82 !important;
  }

  [data-mm-theme="dark"] .mm-template-grid button small {
    color: #ddd4ee !important;
    opacity: .9 !important;
  }

  /* Make the floating photo/sticker/doodle tools feel like one consistent control family. */
  .mm-final-panel,
  .mm-sticker-floating,
  .mm-final-doodle-bar {
    font-family: Arial, sans-serif !important;
  }
`;
document.head.appendChild(style);

function syncTheme() {
  const app = document.querySelector(".app");
  document.body.dataset.mmTheme = app?.classList.contains("dark-mode") ? "dark" : "light";
}

syncTheme();
new MutationObserver(syncTheme).observe(document.body, {
  attributes: true,
  subtree: true,
  attributeFilter: ["class"],
});
