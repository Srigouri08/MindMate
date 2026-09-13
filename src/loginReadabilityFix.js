(() => {
  const STYLE_ID = "mindmate-login-readability";
  const css = `
    .login-card h2 { color: #38266f !important; }
    .login-card .login-subtitle { color: #786c91 !important; }
    .login-card .switch { color: #786c91 !important; }
    .login-card .switch .link-button { color: #6b4ac4 !important; }
  `;
  function start() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
