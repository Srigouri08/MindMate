(() => {
  const STYLE_ID = "mindmate-sticker-interaction-fix-style";
  let started = false;
  let observer = null;
  let frame = 0;

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* Keep sticker controls visually attached to the sticker without orbiting when it rotates. */
      .book-page .placed-sticker .sticker-controls {
        transform-origin: center center !important;
        z-index: 100 !important;
        white-space: nowrap !important;
      }

      /* Doodle is constrained to the journal page instead of the whole viewport. */
      .mm-doodle.mm-page-doodle-fix {
        position: absolute !important;
        z-index: 2000 !important;
        pointer-events: none !important;
        overflow: hidden !important;
        border-radius: 5px 22px 22px 5px !important;
      }
      .mm-doodle.mm-page-doodle-fix canvas {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        display: block !important;
        pointer-events: auto !important;
        touch-action: none !important;
      }
      .mm-doodle.mm-page-doodle-fix .mm-doodle-bar {
        position: fixed !important;
        top: 12px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 2001 !important;
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  function getRotation(sticker) {
    const transform = getComputedStyle(sticker).transform;
    if (!transform || transform === "none") return 0;
    const match = transform.match(/^matrix\\((-?[\\d.eE+-]+),\\s*(-?[\\d.eE+-]+),/);
    if (!match) return 0;
    return Math.atan2(Number(match[2]), Number(match[1])) * 180 / Math.PI;
  }

  function positionControls(sticker) {
    const controls = sticker.querySelector(".sticker-controls");
    if (!controls) return;
    const angle = getRotation(sticker);
    const radians = angle * Math.PI / 180;
    const offset = 48;
    const dx = Math.sin(radians) * offset;
    const dy = -Math.cos(radians) * offset;
    controls.style.setProperty("left", `calc(50% + ${dx}px)`, "important");
    controls.style.setProperty("top", `calc(50% + ${dy}px)`, "important");
    controls.style.setProperty("transform", `translateX(-50%) rotate(${-angle}deg)`, "important");
  }

  function syncControls() {
    document.querySelectorAll(".book-page .placed-sticker.selected").forEach(positionControls);
  }

  function scheduleSync() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(syncControls);
  }

  function openPageDoodle() {
    document.querySelector(".mm-page-doodle-fix")?.remove();
    const book = document.querySelector(".book-page");
    if (!book) return;

    const rect = book.getBoundingClientRect();
    const overlay = document.createElement("div");
    overlay.className = "mm-doodle mm-page-doodle-fix";
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.innerHTML = `
      <canvas></canvas>
      <div class="mm-doodle-bar mm-enhanced">
        <button class="undo">↶ Undo</button>
        <button class="clear">Clear</button>
        <span class="mm-doodle-label">Color</span>
        <button class="mm-doodle-color active" data-color="#7655d3" style="background:#7655d3" title="Purple"></button>
        <button class="mm-doodle-color" data-color="#e85d8f" style="background:#e85d8f" title="Pink"></button>
        <button class="mm-doodle-color" data-color="#4f86e8" style="background:#4f86e8" title="Blue"></button>
        <button class="mm-doodle-color" data-color="#55a66a" style="background:#55a66a" title="Green"></button>
        <button class="mm-doodle-color" data-color="#e69b35" style="background:#e69b35" title="Orange"></button>
        <button class="mm-doodle-color" data-color="#333333" style="background:#333333" title="Black"></button>
        <span class="mm-doodle-label">Size</span>
        <button class="mm-doodle-size active" data-size="3">S</button>
        <button class="mm-doodle-size" data-size="6">M</button>
        <button class="mm-doodle-size" data-size="10">L</button>
        <button class="done">Done</button>
      </div>`;
    document.body.appendChild(overlay);

    const canvas = overlay.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#7655d3";
    ctx.lineWidth = 3;

    let drawing = false;
    let history = [];
    let last = null;

    function point(event) {
      const current = overlay.getBoundingClientRect();
      return { x: event.clientX - current.left, y: event.clientY - current.top };
    }

    canvas.onpointerdown = (event) => {
      const p = point(event);
      drawing = true;
      last = p;
      history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      canvas.setPointerCapture?.(event.pointerId);
    };
    canvas.onpointermove = (event) => {
      if (!drawing || !last) return;
      const p = point(event);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    };
    const stop = () => { drawing = false; last = null; };
    canvas.onpointerup = stop;
    canvas.onpointercancel = stop;
    canvas.onpointerleave = stop;

    overlay.querySelector(".undo").onclick = () => {
      const previous = history.pop();
      if (previous) ctx.putImageData(previous, 0, 0);
    };
    overlay.querySelector(".clear").onclick = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      history = [];
    };
    overlay.querySelectorAll(".mm-doodle-color").forEach((button) => {
      button.onclick = () => {
        ctx.strokeStyle = button.dataset.color;
        overlay.querySelectorAll(".mm-doodle-color").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
      };
    });
    overlay.querySelectorAll(".mm-doodle-size").forEach((button) => {
      button.onclick = () => {
        ctx.lineWidth = Number(button.dataset.size);
        overlay.querySelectorAll(".mm-doodle-size").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
      };
    });
    overlay.querySelector(".done").onclick = () => overlay.remove();

    const reposition = () => {
      if (!document.body.contains(overlay)) return;
      const next = book.getBoundingClientRect();
      overlay.style.left = `${next.left + window.scrollX}px`;
      overlay.style.top = `${next.top + window.scrollY}px`;
      overlay.style.width = `${next.width}px`;
      overlay.style.height = `${next.height}px`;
    };
    window.addEventListener("resize", reposition, { passive: true });
    window.addEventListener("scroll", reposition, { passive: true });
    overlay.querySelector(".done").addEventListener("click", () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition);
    }, { once: true });
  }

  function wireDoodleButton() {
    const button = document.querySelector('.mm-toolbar .mm-tool[title="Doodle"]');
    if (!button || button.dataset.mmPageDoodleWired === "1") return;

    const cleanButton = button.cloneNode(true);
    button.replaceWith(cleanButton);
    cleanButton.dataset.mmPageDoodleWired = "1";
    cleanButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openPageDoodle();
    });
  }

  function start() {
    if (started) return;
    started = true;
    installStyles();
    wireDoodleButton();
    syncControls();
    observer = new MutationObserver(() => {
      wireDoodleButton();
      scheduleSync();
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });
    document.addEventListener("click", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync, { passive: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
