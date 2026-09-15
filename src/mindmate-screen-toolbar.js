(() => {
  const BODY_CLASS = "mindmate-new-entry";

  function updateToolbarVisibility() {
    const toolbar = document.querySelector(".mm-toolbar");
    if (!toolbar) return;

    const login = !!document.querySelector(".login-layout");
    const journal = !!document.querySelector(".journal-list-screen");
    const book = !!document.querySelector(".book-page");
    const primary = [...document.querySelectorAll(".action-row .primary-action")]
      .some((button) => button.textContent.trim().toLowerCase().includes("save entry"));

    const isNewEntry = !login && !journal && book && primary;
    document.body.classList.toggle(BODY_CLASS, isNewEntry);
    toolbar.setAttribute("aria-hidden", String(!isNewEntry));
  }

  function start() {
    updateToolbarVisibility();
    const observer = new MutationObserver(() => requestAnimationFrame(updateToolbarVisibility));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", updateToolbarVisibility);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
