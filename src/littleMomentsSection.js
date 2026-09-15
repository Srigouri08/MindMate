(() => {
  const KEY = "mindmate-little-moments";
  const ID = "mindmate-little-moments-section";
  const STYLE = "mindmate-little-moments-style";

  function photos() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  }

  function installStyles() {
    if (document.getElementById(STYLE)) return;
    const s = document.createElement("style");
    s.id = STYLE;
    s.textContent = `
      #${ID}{padding:8px 4px 40px;max-width:1100px;margin:0 auto}
      .mm-lm-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:22px}
      .mm-lm-head h2{margin:0;color:#382a63;font-size:30px}.mm-lm-head p{margin:6px 0 0;color:#81758f}
      .mm-lm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:18px}
      .mm-lm-card{background:#fff;border:1px solid #ddd2ef;border-radius:18px;padding:10px;box-shadow:0 10px 25px rgba(72,49,130,.08)}
      .mm-lm-card img{width:100%;height:190px;object-fit:cover;border-radius:12px;display:block}.mm-lm-card p{margin:9px 3px 3px;color:#6f6280;font-size:13px}.mm-lm-card small{color:#91859d}
      .mm-lm-empty{padding:45px 20px;text-align:center;border:1px dashed #cfc1e7;border-radius:18px;color:#847895;background:rgba(255,255,255,.5)}
      .dark-mode #${ID} .mm-lm-head h2{color:#f0e9fa}.dark-mode #${ID} .mm-lm-head p{color:#aaa0b9}.dark-mode .mm-lm-card{background:#2b2539;border-color:#4b4260}.dark-mode .mm-lm-card p{color:#c1b7cc}.dark-mode .mm-lm-card small{color:#958aa2}.dark-mode .mm-lm-empty{border-color:#514668;color:#aaa0b9;background:#2b2539}
    `;
    document.head.appendChild(s);
  }

  function render() {
    const section = document.getElementById(ID);
    if (!section) return;
    const grid = section.querySelector(".mm-lm-grid");
    const items = photos();
    if (!items.length) {
      grid.innerHTML = '<div class="mm-lm-empty">📷<br><strong>No little moments yet</strong><br>Add a photo from the journal toolbar and it will appear here.</div>';
      return;
    }
    grid.innerHTML = items.map(p => `<article class="mm-lm-card"><img src="${p.src}" alt="Little moment"><p>${p.caption || "A little moment"}</p><small>${p.month || ""}</small></article>`).join("");
  }

  function open() {
    const main = document.querySelector(".main-content");
    if (!main) return;
    installStyles();
    let section = document.getElementById(ID);
    if (!section) {
      section = document.createElement("section");
      section.id = ID;
      section.innerHTML = '<div class="mm-lm-head"><div><p class="eyebrow">A LITTLE SPACE FOR MEMORIES</p><h2>Little Moments 📷</h2><p>Keep the photos and tiny memories that make you smile.</p></div></div><div class="mm-lm-grid"></div>';
      main.appendChild(section);
    }
    [...main.children].forEach(el => { if (el !== section) el.style.display = "none"; });
    section.style.display = "block";
    render();
  }

  function close() {
    const section = document.getElementById(ID);
    if (!section) return;
    section.remove();
    const main = document.querySelector(".main-content");
    if (main) [...main.children].forEach(el => { el.style.display = ""; });
  }

  function wire() {
    document.querySelectorAll(".side-item").forEach(item => {
      if (item.dataset.mmLmWired === "1") return;
      item.dataset.mmLmWired = "1";
      if (item.textContent.includes("Little Moments")) {
        item.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); open(); });
      } else {
        item.addEventListener("click", close);
      }
    });
  }

  function start() {
    installStyles();
    wire();
    const observer = new MutationObserver(() => requestAnimationFrame(wire));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
