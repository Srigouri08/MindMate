(() => {
  const STYLE_ID = "mindmate-creative-tools-style";

  const templates = {
    floral: { bg: "linear-gradient(135deg,#fff4fa,#f5edff)", border: "#ead1e7", shadow: "0 12px 30px rgba(130,80,140,.12)" },
    dreamy: { bg: "linear-gradient(135deg,#eef6ff,#f8efff)", border: "#d8dff2", shadow: "0 12px 30px rgba(80,110,170,.12)" },
    nature: { bg: "linear-gradient(135deg,#f0faef,#fffced)", border: "#d7e8d1", shadow: "0 12px 30px rgba(70,130,80,.10)" },
    night: { bg: "linear-gradient(135deg,#302947,#51446d)", border: "#766b91", shadow: "0 12px 30px rgba(30,20,60,.25)" },
    cute: { bg: "linear-gradient(135deg,#fff1f6,#fff9e9)", border: "#efd2df", shadow: "0 12px 30px rgba(180,100,130,.12)" },
    minimal: { bg: "#ffffff", border: "#e5e0ea", shadow: "0 12px 30px rgba(80,70,100,.08)" }
  };

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .mm-creative-panel{position:fixed;right:78px;top:50%;transform:translateY(-50%);width:330px;max-height:82vh;overflow:auto;z-index:10020;padding:20px;border:1px solid #ddd0f5;border-radius:22px;background:#fffafc;box-shadow:0 22px 55px rgba(50,30,100,.25);font-family:Arial,sans-serif;color:#46366c}
      .mm-creative-panel h3{margin:0 0 6px}.mm-creative-panel p{margin:0 0 15px;color:#887b9d;font-size:12px}
      .mm-creative-close{float:right;border:0;background:transparent;font-size:22px;color:#81748f;cursor:pointer}
      .mm-creative-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
      .mm-creative-choice{border:1px solid #ded4ef;border-radius:13px;padding:12px 8px;background:#fff;cursor:pointer;color:#594582;font-weight:600;text-align:left}
      .mm-creative-choice:hover{background:#eadfff;border-color:#7655d3}
      .mm-color-row,.mm-size-row{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 14px}
      .mm-color{width:30px;height:30px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px #d8cee8;cursor:pointer}
      .mm-color.active{box-shadow:0 0 0 2px #7655d3}
      .mm-size{border:1px solid #ded4ef;border-radius:10px;background:#fff;padding:8px 12px;cursor:pointer;color:#594582;font-weight:700}
      .mm-size.active{background:#eadfff;border-color:#7655d3}
      .mm-doodle-bar{gap:6px!important;flex-wrap:wrap;justify-content:center;max-width:92vw}
      .mm-doodle-bar .mm-doodle-color{width:28px;height:28px;padding:0!important;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px #d8cee8}
      .mm-doodle-bar .mm-doodle-color.active{box-shadow:0 0 0 2px #7655d3}
      .mm-doodle-bar .mm-doodle-size{min-width:44px}
      @media(max-width:800px){.mm-creative-panel{right:58px;width:285px}}
    `;
    document.head.appendChild(style);
  }

  function getBook() {
    return document.querySelector(".book-page");
  }

  function applyTemplate(type) {
    const book = getBook();
    if (!book) return;
    const t = templates[type] || templates.minimal;
    book.style.setProperty("background", t.bg, "important");
    book.style.setProperty("border-color", t.border, "important");
    book.style.setProperty("box-shadow", t.shadow, "important");
    book.dataset.mindmateTemplate = type;
    closePanel();
  }

  function closePanel() {
    document.querySelector(".mm-creative-panel")?.remove();
  }

  function openTemplatePanel() {
    closePanel();
    const panel = document.createElement("div");
    panel.className = "mm-creative-panel";
    panel.innerHTML = `
      <button class="mm-creative-close">×</button>
      <h3>🎨 Page Templates</h3>
      <p>Choose a look for your journal page.</p>
      <div class="mm-creative-grid">
        <button class="mm-creative-choice" data-template="floral">🌸 <strong>Soft Floral</strong></button>
        <button class="mm-creative-choice" data-template="dreamy">☁️ <strong>Dreamy</strong></button>
        <button class="mm-creative-choice" data-template="nature">🌿 <strong>Nature</strong></button>
        <button class="mm-creative-choice" data-template="night">🌙 <strong>Night Thoughts</strong></button>
        <button class="mm-creative-choice" data-template="cute">🎀 <strong>Cute</strong></button>
        <button class="mm-creative-choice" data-template="minimal">🤍 <strong>Minimal</strong></button>
      </div>`;
    document.body.appendChild(panel);
    panel.querySelector(".mm-creative-close").onclick = closePanel;
    panel.querySelectorAll("[data-template]").forEach((button) => {
      button.onclick = () => applyTemplate(button.dataset.template);
    });
  }

  function openDoodle() {
    const old = document.querySelector(".mm-doodle-fix");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.className = "mm-doodle mm-doodle-fix";
    overlay.innerHTML = `
      <canvas></canvas>
      <div class="mm-doodle-bar">
        <button class="undo">↶ Undo</button>
        <button class="clear">Clear</button>
        <button class="mm-doodle-color active" data-color="#7655d3" style="background:#7655d3" title="Purple"></button>
        <button class="mm-doodle-color" data-color="#e85d8f" style="background:#e85d8f" title="Pink"></button>
        <button class="mm-doodle-color" data-color="#4f86e8" style="background:#4f86e8" title="Blue"></button>
        <button class="mm-doodle-color" data-color="#55a66a" style="background:#55a66a" title="Green"></button>
        <button class="mm-doodle-color" data-color="#e69b35" style="background:#e69b35" title="Orange"></button>
        <button class="mm-doodle-color" data-color="#333333" style="background:#333333" title="Black"></button>
        <button class="mm-doodle-size active" data-size="3">S</button>
        <button class="mm-doodle-size" data-size="6">M</button>
        <button class="mm-doodle-size" data-size="10">L</button>
        <button class="done">Done</button>
      </div>`;
    document.body.appendChild(overlay);

    const canvas = overlay.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#7655d3";

    let drawing = false;
    let history = [];

    canvas.onpointerdown = (event) => {
      drawing = true;
      history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      ctx.beginPath();
      ctx.moveTo(event.clientX, event.clientY);
    };
    canvas.onpointermove = (event) => {
      if (!drawing) return;
      ctx.lineTo(event.clientX, event.clientY);
      ctx.stroke();
    };
    canvas.onpointerup = () => { drawing = false; };
    canvas.onpointercancel = () => { drawing = false; };

    overlay.querySelector(".undo").onclick = () => {
      const previous = history.pop();
      if (previous) ctx.putImageData(previous, 0, 0);
    };
    overlay.querySelector(".clear").onclick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      history = [];
    };
    overlay.querySelectorAll(".mm-doodle-color").forEach((button) => {
      button.onclick = () => {
        ctx.strokeStyle = button.dataset.color;
        overlay.querySelectorAll(".mm-doodle-color").forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
      };
    });
    overlay.querySelectorAll(".mm-doodle-size").forEach((button) => {
      button.onclick = () => {
        ctx.lineWidth = Number(button.dataset.size);
        overlay.querySelectorAll(".mm-doodle-size").forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
      };
    });
    overlay.querySelector(".done").onclick = () => overlay.remove();
  }

  function wire() {
    installStyles();
    const template = document.querySelector('.mm-toolbar .mm-tool[title="Page templates"]');
    if (template && template.dataset.mmTemplateFix !== "1") {
      template.dataset.mmTemplateFix = "1";
      template.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        openTemplatePanel();
      }, true);
    }

    const doodle = document.querySelector('.mm-toolbar .mm-tool[title="Doodle"]');
    if (doodle && doodle.dataset.mmDoodleFix !== "1") {
      doodle.dataset.mmDoodleFix = "1";
      doodle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        openDoodle();
      }, true);
    }
  }

  function start() {
    wire();
    new MutationObserver(() => requestAnimationFrame(wire)).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
