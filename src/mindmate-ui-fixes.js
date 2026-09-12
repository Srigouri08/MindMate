(() => {
  const wait = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  };

  wait(() => {
    const css = document.createElement("style");
    css.textContent = `
      .mm-toolbar{z-index:9997!important}
      .mm-template-decor{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden}
      .mm-template-decor .corner{position:absolute;font-size:34px;opacity:.7}
      .mm-template-decor .tl{top:18px;left:18px}.mm-template-decor .tr{top:18px;right:18px}.mm-template-decor .bl{bottom:28px;left:18px}.mm-template-decor .br{bottom:28px;right:18px}
      .mm-template-decor .center{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);font:italic 14px Georgia,serif;opacity:.65}
      .mm-template-floral{background-color:#fff8fc!important;background-image:radial-gradient(circle at 8% 12%,rgba(225,157,195,.22) 0 3px,transparent 4px),radial-gradient(circle at 92% 88%,rgba(161,134,211,.2) 0 3px,transparent 4px),repeating-linear-gradient(to bottom,transparent 0,transparent 35px,rgba(114,126,164,.14) 36px,transparent 37px)!important}
      .mm-template-dreamy{background-color:#f8f5ff!important;background-image:radial-gradient(circle at 15% 12%,rgba(164,197,235,.25) 0 22px,transparent 23px),radial-gradient(circle at 88% 86%,rgba(213,180,229,.2) 0 28px,transparent 29px),repeating-linear-gradient(to bottom,transparent 0,transparent 35px,rgba(114,126,164,.12) 36px,transparent 37px)!important}
      .mm-template-nature{background-color:#fbfff7!important;background-image:radial-gradient(circle at 9% 15%,rgba(117,168,111,.18) 0 18px,transparent 19px),radial-gradient(circle at 91% 85%,rgba(169,193,112,.18) 0 20px,transparent 21px),repeating-linear-gradient(to bottom,transparent 0,transparent 35px,rgba(92,130,92,.13) 36px,transparent 37px)!important}
      .mm-template-night{background-color:#302a49!important;color:#f1eaff!important;background-image:radial-gradient(circle at 82% 15%,rgba(255,255,255,.13) 0 2px,transparent 3px),radial-gradient(circle at 18% 75%,rgba(255,255,255,.1) 0 2px,transparent 3px),repeating-linear-gradient(to bottom,transparent 0,transparent 35px,rgba(210,195,240,.08) 36px,transparent 37px)!important}
      .mm-template-night textarea{color:#f1eaff!important}.mm-template-night .book-title{background:#5d4a72!important;color:#fff!important}.mm-template-night .today-date{color:#d5c5e8!important}
      .mm-template-cute{background-color:#fff7f5!important;background-image:radial-gradient(circle at 12% 15%,rgba(244,163,190,.18) 0 14px,transparent 15px),radial-gradient(circle at 90% 82%,rgba(246,206,137,.2) 0 17px,transparent 18px),repeating-linear-gradient(to bottom,transparent 0,transparent 35px,rgba(114,126,164,.12) 36px,transparent 37px)!important}
      .mm-template-minimal{background-color:#fff!important;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 35px,rgba(114,126,164,.12) 36px,transparent 37px)!important}
      .mm-reset-template{grid-column:1/-1!important;background:#f3eef9!important;color:#6a5a82!important}
    `;
    document.head.appendChild(css);

    const getBook = () => document.querySelector(".book-page");
    const clearTemplate = () => {
      const book = getBook();
      if (!book) return;
      book.classList.remove("mm-template-floral","mm-template-dreamy","mm-template-nature","mm-template-night","mm-template-cute","mm-template-minimal");
      book.style.removeProperty("background");
      book.style.removeProperty("background-color");
      book.style.removeProperty("background-image");
      book.style.removeProperty("border-color");
      book.querySelector(".mm-template-decor")?.remove();
    };
    const applyTemplate = (name) => {
      const book = getBook();
      if (!book) return;
      clearTemplate();
      if (name === "default") return;
      book.classList.add(`mm-template-${name}`);
      const symbols = {
        floral: ["🌸","🌷","🌿","♡","bloom softly"],
        dreamy: ["☁️","✨","🫧","☾","dream a little"],
        nature: ["🌿","🍃","🌱","🌼","grow at your pace"],
        night: ["✦","☾","✧","⋆","quiet thoughts"],
        cute: ["🎀","💕","🍓","♡","made with love"],
        minimal: ["·","·","·","·","just be here"]
      }[name];
      if (symbols) {
        const d = document.createElement("div");
        d.className = "mm-template-decor";
        d.innerHTML = `<span class="corner tl">${symbols[0]}</span><span class="corner tr">${symbols[1]}</span><span class="corner bl">${symbols[2]}</span><span class="corner br">${symbols[3]}</span><span class="center">${symbols[4]}</span>`;
        book.appendChild(d);
      }
    };

    const openTemplates = () => {
      document.querySelector(".mm-panel")?.remove();
      const panel = document.createElement("div");
      panel.className = "mm-panel";
      panel.innerHTML = `<button class="mm-close">×</button><h3>🎨 Page Templates</h3><p>Give your page a whole look — colors, details and decorations.</p><div class="mm-grid"><button class="mm-template-card mm-floral" data-t="floral"><strong>🌸 Soft Floral</strong><small>Flowers & gentle details</small></button><button class="mm-template-card mm-dreamy" data-t="dreamy"><strong>☁️ Dreamy</strong><small>Clouds & sparkles</small></button><button class="mm-template-card mm-nature" data-t="nature"><strong>🌿 Nature</strong><small>Leaves & earthy details</small></button><button class="mm-template-card mm-night" data-t="night"><strong>🌙 Night Thoughts</strong><small>Stars & midnight mood</small></button><button class="mm-template-card mm-cute" data-t="cute"><strong>🎀 Cute</strong><small>Sweet scrapbook feel</small></button><button class="mm-template-card mm-minimal" data-t="minimal"><strong>🤍 Minimal</strong><small>Clean & simple</small></button><button class="mm-template-card mm-reset-template" data-t="default"><strong>↩ Reset to Default</strong><small>Remove the template completely</small></button></div>`;
      document.body.appendChild(panel);
      panel.querySelector(".mm-close").onclick = () => panel.remove();
      panel.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { applyTemplate(b.dataset.t); panel.remove(); });
    };

    const openStickerPicker = () => {
      const existing = [...document.querySelectorAll("button")].find(b => b.classList.contains("icon-button") && (b.textContent.includes("🎀") || b.title?.toLowerCase().includes("sticker")));
      if (existing) existing.click();
    };

    const buildToolbar = () => {
      const old = document.querySelector(".mm-toolbar");
      if (old) old.remove();
      const toolbar = document.createElement("div");
      toolbar.className = "mm-toolbar";
      toolbar.innerHTML = '<button class="mm-tool add" title="Add photo">📸</button><button class="mm-tool" title="Stickers">✨</button><button class="mm-tool" title="Page templates">🎨</button><button class="mm-tool" title="Doodle">✏️</button>';
      document.body.appendChild(toolbar);
      toolbar.children[0].onclick = () => document.querySelector(".mm-panel")?.remove() || (() => {})();
      toolbar.children[0].onclick = () => {
        const input = document.createElement("input"); input.type="file"; input.accept="image/*"; input.multiple=true;
        input.onchange = e => { const files=[...e.target.files]; if(!files.length)return; const original=[...document.querySelectorAll(".mm-photo")]; let panel=document.querySelector(".mm-panel"); if(!panel){ document.querySelector(".mm-toolbar")?.remove(); }
          files.forEach(file => { const reader=new FileReader(); reader.onload=()=>{ const photo={id:Date.now()+Math.random(),src:reader.result,frame:"polaroid",caption:"",month:new Date().toLocaleString("en-IN",{month:"long",year:"numeric"}),x:12+(original.length%4)*18,y:12+(original.length%3)*20,createdAt:Date.now()}; try{const arr=JSON.parse(localStorage.getItem("mindmate-little-moments")||"[]");arr.push(photo);localStorage.setItem("mindmate-little-moments",JSON.stringify(arr));}catch{}; window.dispatchEvent(new Event("mindmate-photo-added")); }; reader.readAsDataURL(file); }); };
        input.click();
      };
      toolbar.children[1].onclick = openStickerPicker;
      toolbar.children[2].onclick = openTemplates;
      toolbar.children[3].onclick = () => { const old=document.querySelector(".mm-doodle-bar"); if(old){old.closest(".mm-doodle")?.remove();return;} const b=[...document.querySelectorAll(".mm-toolbar ~ *")].find(x=>false); window.dispatchEvent(new Event("mindmate-open-doodle")); };
    };

    buildToolbar();
    window.addEventListener("mindmate-open-doodle", () => {
      const o=document.createElement("div");o.className="mm-doodle";o.innerHTML='<canvas></canvas><div class="mm-doodle-bar"><button class="undo">↶ Undo</button><button class="clear">Clear</button><button class="done">Done</button></div>';document.body.appendChild(o);const c=o.querySelector("canvas"),ctx=c.getContext("2d"),dpr=devicePixelRatio||1;c.width=innerWidth*dpr;c.height=innerHeight*dpr;ctx.scale(dpr,dpr);ctx.lineWidth=3;ctx.lineCap="round";ctx.strokeStyle="#7655d3";let drawing=false,history=[];c.onpointerdown=e=>{drawing=true;history.push(ctx.getImageData(0,0,c.width,c.height));ctx.beginPath();ctx.moveTo(e.clientX,e.clientY)};c.onpointermove=e=>{if(!drawing)return;ctx.lineTo(e.clientX,e.clientY);ctx.stroke()};c.onpointerup=()=>drawing=false;o.querySelector(".undo").onclick=()=>{const h=history.pop();if(h)ctx.putImageData(h,0,0)};o.querySelector(".clear").onclick=()=>ctx.clearRect(0,0,innerWidth,innerHeight);o.querySelector(".done").onclick=()=>o.remove();
    });
  });
})();
