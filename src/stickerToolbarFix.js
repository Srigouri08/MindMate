(() => {
  const STYLE_ID = "mindmate-sticker-fix-style";

  function install() {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        .placed-sticker.mm-sticker-fixed { transform: translate(-50%, -50%) !important; font-size: 0 !important; }
        .placed-sticker.mm-sticker-fixed::before { content: attr(data-sticker); display: block; font-size: var(--sticker-size); line-height: 1; transform: rotate(var(--sticker-rotation)); transform-origin: center; }
        .placed-sticker.mm-sticker-fixed .sticker-controls { transform: translateX(-50%) !important; transform-origin: center !important; }
      `;
      document.head.appendChild(style);
    }
  }

  function fix() {
    install();
    document.querySelectorAll(".placed-sticker").forEach((sticker) => {
      const controls = sticker.querySelector(".sticker-controls");
      const text = [...sticker.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      const emoji = (sticker.dataset.sticker || text?.textContent || "").trim();
      if (!emoji) return;
      sticker.dataset.sticker = emoji;
      const style = sticker.getAttribute("style") || "";
      const size = style.match(/font-size:\s*([\d.]+)px/);
      const angle = style.match(/rotate\((-?[\d.]+)deg\)/);
      sticker.style.setProperty("--sticker-size", `${size ? size[1] : 44}px`);
      sticker.style.setProperty("--sticker-rotation", `${angle ? angle[1] : 0}deg`);
      sticker.classList.add("mm-sticker-fixed");
      if (text) text.textContent = "";
      if (controls) controls.style.transform = "translateX(-50%)";
    });
  }

  const start = () => {
    fix();
    const observer = new MutationObserver(() => requestAnimationFrame(fix));
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
