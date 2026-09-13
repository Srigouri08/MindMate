(() => {
  const STYLE_ID = "mindmate-login-final-fix";
  const css = `
    .app.dark-mode .login-layout .login-card {
      background: #ffffff !important;
      color: #38266f !important;
      opacity: 1 !important;
      filter: none !important;
    }
    .app.dark-mode .login-layout .login-card h2 {
      color: #38266f !important;
      -webkit-text-fill-color: #38266f !important;
      opacity: 1 !important;
      visibility: visible !important;
      display: block !important;
    }
    .app.dark-mode .login-layout .login-card .login-subtitle {
      color: #786c91 !important;
      -webkit-text-fill-color: #786c91 !important;
      opacity: 1 !important;
      visibility: visible !important;
      display: block !important;
    }
    .app.dark-mode .login-layout .login-card .switch {
      color: #786c91 !important;
      -webkit-text-fill-color: #786c91 !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
    .app.dark-mode .login-layout .login-card .switch .link-button {
      color: #6b4ac4 !important;
      -webkit-text-fill-color: #6b4ac4 !important;
    }
    .app.dark-mode .login-layout .login-card .login-heart {
      color: #7655d3 !important;
      -webkit-text-fill-color: #7655d3 !important;
      opacity: 1 !important;
    }
  `;

  function install() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  install();
  new MutationObserver(install).observe(document.documentElement, { childList: true, subtree: true });
})();
