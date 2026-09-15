(() => {
  const STYLE_ID = "mindmate-phase-one-polish";

  function install() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .water-liters{font-size:10px!important;font-weight:700!important}
    `;
    document.head.appendChild(style);
  }

  function polishWater() {
    document.querySelectorAll(".water-card").forEach((card) => {
      const milestones = [...card.querySelectorAll(".water-milestone")];
      const icons = ["💧", "🥛", "🫗", "🫙"];
      milestones.forEach((item, index) => {
        const icon = item.querySelector(".water-icon");
        const label = item.querySelector(".water-liters");
        if (icon) icon.textContent = icons[index] || "💧";
        if (label) label.textContent = `${index + 1}L`;
      });
    });
  }

  function removeDuplicateDefaults() {
    document.querySelectorAll(".mm-panel, .mm-final-panel").forEach((panel) => {
      const buttons = [...panel.querySelectorAll("button")].filter((button) => /set to default/i.test(button.textContent.trim()));
      buttons.slice(1).forEach((button) => button.remove());
    });
  }

  function polish() {
    install();
    polishWater();
    removeDuplicateDefaults();
  }

  function start() {
    polish();
    const observer = new MutationObserver(() => requestAnimationFrame(polish));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
