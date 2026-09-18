(() => {
  const BODY_CLASS = "mindmate-new-entry";
  let frame = 0;

  function updateToolbarVisibility() {
    frame = 0;
    const toolbar = document.querySelector(".mm-toolbar");
    if (!toolbar) return;

    const login = !!document.querySelector(".login-layout");
    const journal = !!document.querySelector(".journal-list-screen");
    const book = !!document.querySelector(".book-page");
    const primary = [...document.querySelectorAll(".action-row .primary-action")]
      .some((button) => /save entry/i.test(button.textContent.trim()));

    const isNewEntry = !login && !journal && book && primary;
    if (document.body.classList.contains(BODY_CLASS) !== isNewEntry) {
      document.body.classList.toggle(BODY_CLASS, isNewEntry);
      toolbar.setAttribute("aria-hidden", String(!isNewEntry));
    }
  }

  function scheduleUpdate() {
    if (!frame) frame = requestAnimationFrame(updateToolbarVisibility);
  }

  function start() {
    updateToolbarVisibility();
    const observer = new MutationObserver(scheduleUpdate);
    observer.observe(document.body, { childList:true, subtree:true });
    window.addEventListener("resize", scheduleUpdate, { passive:true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once:true });
  } else {
    start();
  }
})();
