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
      .mm-template-decor .corner{position:absolute;font-size:34px;opacity:.75}
      .mm-template-decor .tl{top:18px;left:18px}.mm-template-decor .tr{top:18px;right:18px}.mm-template-decor .bl{bottom:28px;left:18px}.mm-template-decor .br{bottom:28px;right:18px}
      .mm-template-decor .center{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);font:italic 14px Georgia,serif;opacity:.65}
      .mm-template-floral{background-color:#fff8fc!important;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 35px,rgba(114,126,164,.14) 36px,transparent 37px)!important}
      .mm-template-dreamy{background-color:#f8f5ff!important;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 35px,rgba(114,126,164,.12) 36px,transparent 37px)!important}
      .mm-template-nature{background-color:#fbfff7!important;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 35px,rgba(92,130,92,.13) 36px,transparent 37px)!important}
      .mm-template-night{background-color:#302a49!important;color:#f1eaff!important;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 35px,rgba(210,195,240,.08) 36px,transparent 37px)!important}
      .mm-template-night textarea{color:#f1eaff!important}.mm-template-night .book-title{background:#5d4a72!important;color:#fff!important}.mm-template-night .today-date{color:#d5c5e8!important}
      .mm-template-cute{background-color:#fff7f5!important;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 35px,rgba(114,126,164,.12) 36px,transparent 37px)!important}
      .mm-template-minimal{background-color:#fff!important;background-image:repeating-linear-gradient(to bottom,transparent 0,transparent 35px,rgba(114,126,164,.12) 36px,transparent 37px)!important}
      .mm-reset-template{grid-column:1/-1!important;background:#f3eef9!important;color:#6a5a82!important}
      .mm-doodle{position:fixed;inset:0;z-index:10000;background:transparent;touch-action:none}
      .mm-doodle canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none}
      .mm-doodle-bar{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);display:flex;align-items:center;gap:7px;padding:9px 11px;border:1px solid #d8caef;border-radius:18px;background:rgba(255,255,255,.97);box-shadow:0 12px 30px rgba(55,35,100,.2);font-family:Arial,sans-serif}
      .mm-doodle-bar button{border:1px solid #ddd3ed;background:#f7f3ff;color:#4e3c72;border-radius:10px;padding:8px 11px;cursor:pointer;font-weight:600}
      .mm-doodle-bar button:hover{background:#eee6ff}
      .mm-doodle-colors{display:flex;align-items:center;gap:5px;padding:0 5px;border-left:1px solid #e4dcef;border-right:1px solid #e4dcef}
      .mm-doodle-color{width:25px!important;height:25px!important;min-width:25px;padding:0!important;border-radius:50%!important;border:2px solid #fff!important;box-shadow:0 0 0 1px #cfc5df;cursor:pointer}
      .mm-doodle-color.active{box-shadow:0 0 0 2px #7655d3}
      .mm-doodle-size{width:72px;padding:7px!important}
      .dark-mode .mm-doodle-bar{background:rgba(42,36,60,.97);border-color:#514668}.dark-mode .mm-doodle-bar button{background:#332b46;color:#eee7ff;border-color:#514668}.dark-mode .mm-doodle-bar button:hover{background:#42365a}
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
        floral:["🌸","🌷","🌿","♡","bloom softly"],
        dreamy:["☁️","✨","🫧","☾","dream a little"],
        nature:["🌿","🍃","🌱","🌼","grow at your pace"],
        night:["✦","☾","✧","⋆","quiet thoughts"],
        cute:["🎀","💕","🍓","♡","made with love"],
        minimal:["·","·","·","·","just be here"]
      }[name];
      if (symbols) {
        const d=document.createElement("div");
        d.className="mm-template-decor";
        d.innerHTML=`<span class="corner tl">${symbols[0]}</span><span class="corner tr">${symbols[1]}</span><span class="corner bl">${symbols[2]}</span><span class="corner br">${symbols[3]}</span><span class="center">${symbols[4]}</span>`;
        book.appendChild(d);
      }
    };

    const openTemplates = () => {
      document.querySelector(".mm-panel")?.remove();
      const panel=document.createElement("div");
      panel.className="mm-panel";
      panel.innerHTML=`<button class="mm-close">×</button><h3>🎨 Page Templates</h3><p>Choose a complete page design, or reset it anytime.</p><div class="mm-grid"><button class="mm-template-card" data-t="floral"><strong>🌸 Soft Floral</strong><small>Flowers & gentle details</small></button><button class="mm-template-card" data-t="dreamy"><strong>☁️ Dreamy</strong><small>Clouds & sparkles</small></button><button class="mm-template-card" data-t="nature"><strong>🌿 Nature</strong><small>Leaves & earthy details</small></button><button class="mm-template-card" data-t="night"><strong>🌙 Night Thoughts</strong><small>Stars & midnight mood</small></button><button class="mm-template-card" data-t="cute"><strong>🎀 Cute</strong><small>Sweet scrapbook feel</small></button><button class="mm-template-card" data-t="minimal"><strong>🤍 Minimal</strong><small>Clean & simple</small></button><button class="mm-template-card mm-reset-template" data-t="default"><strong>↩ Reset to Default</strong><small>Remove the template completely</small></button></div>`;
      document.body.appendChild(panel);
      panel.querySelector(".mm-close").onclick=()=>panel.remove();
      panel.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{applyTemplate(b.dataset.t);panel.remove();});
    };

    const openStickerPicker = () => {
      const stickerButton=[...document.querySelectorAll(".topbar .icon-button")].find(b=>b.title==="Add stickers");
      if (stickerButton) {
        stickerButton.click();
        return;
      }
      const fallback=[...document.querySelectorAll("button")].find(b=>b.textContent.trim()==="🎀");
      fallback?.click();
    };

    const openDoodle = () => {
      document.querySelector(".mm-doodle")?.remove();
      const o=document.createElement("div");
      o.className="mm-doodle";
      o.innerHTML=`<canvas></canvas><div class="mm-doodle-bar"><button class="undo">↶ Undo</button><div class="mm-doodle-colors"><button class="mm-doodle-color active" data-color="#7655d3" style="background:#7655d3"></button><button class="mm-doodle-color" data-color="#e66b9a" style="background:#e66b9a"></button><button class="mm-doodle-color" data-color="#4f8fd9" style="background:#4f8fd9"></button><button class="mm-doodle-color" data-color="#56a66b" style="background:#56a66b"></button><button class="mm-doodle-color" data-color="#e39a3b" style="background:#e39a3b"></button><button class="mm-doodle-color" data-color="#4b4557" style="background:#4b4557"></button><button class="mm-doodle-color" data-color="#ffffff" style="background:#fff"></button></div><label>Size <input class="mm-doodle-size" type="range" min="1" max="12" value="3"></label><button class="clear">Clear</button><button class="done">Done</button></div>`;
      document.body.appendChild(o);
      const c=o.querySelector("canvas"),ctx=c.getContext("2d"),dpr=window.devicePixelRatio||1;
      const resize=()=>{const old=document.createElement("canvas");old.width=c.width;old.height=c.height;old.getContext("2d")?.drawImage(c,0,0);c.width=innerWidth*dpr;c.height=innerHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);if(old.width&&old.height)ctx.drawImage(old,0,0,innerWidth,innerHeight);};
      c.width=innerWidth*dpr;c.height=innerHeight*dpr;ctx.scale(dpr,dpr);ctx.lineCap="round";ctx.lineJoin="round";
      let drawing=false,color="#7655d3",size=3,history=[];
      const snapshot=()=>{const copy=document.createElement("canvas");copy.width=c.width;copy.height=c.height;copy.getContext("2d").drawImage(c,0,0);return copy;};
      c.onpointerdown=e=>{drawing=true;history.push(snapshot());ctx.beginPath();ctx.moveTo(e.clientX,e.clientY)};
      c.onpointermove=e=>{if(!drawing)return;ctx.strokeStyle=color;ctx.lineWidth=size;ctx.lineTo(e.clientX,e.clientY);ctx.stroke()};
      c.onpointerup=()=>{drawing=false;ctx.closePath()};c.onpointercancel=()=>drawing=false;
      o.querySelectorAll(".mm-doodle-color").forEach(b=>b.onclick=()=>{color=b.dataset.color;o.querySelectorAll(".mm-doodle-color").forEach(x=>x.classList.remove("active"));b.classList.add("active")});
      o.querySelector(".mm-doodle-size").oninput=e=>size=Number(e.target.value);
      o.querySelector(".undo").onclick=()=>{const h=history.pop();if(h)ctx.clearRect(0,0,innerWidth,innerHeight),ctx.drawImage(h,0,0)};
      o.querySelector(".clear").onclick=()=>{history.push(snapshot());ctx.clearRect(0,0,innerWidth,innerHeight)};
      o.querySelector(".done").onclick=()=>o.remove();
      window.addEventListener("resize",resize,{once:true});
    };

    const buildToolbar=()=>{
      document.querySelector(".mm-toolbar")?.remove();
      const toolbar=document.createElement("div");
      toolbar.className="mm-toolbar";
      toolbar.innerHTML='<button class="mm-tool add" title="Add photo">📸</button><button class="mm-tool" title="Stickers">✨</button><button class="mm-tool" title="Page templates">🎨</button><button class="mm-tool" title="Doodle">✏️</button>';
      document.body.appendChild(toolbar);
      toolbar.children[0].onclick=()=>{const input=document.createElement("input");input.type="file";input.accept="image/*";input.multiple=true;input.onchange=e=>{[...e.target.files].forEach(file=>{const reader=new FileReader();reader.onload=()=>{const photo={id:Date.now()+Math.random(),src:reader.result,frame:"polaroid",caption:"",month:new Date().toLocaleString("en-IN",{month:"long",year:"numeric"}),x:15,y:15,createdAt:Date.now()};const arr=JSON.parse(localStorage.getItem("mindmate-little-moments")||"[]");arr.push(photo);localStorage.setItem("mindmate-little-moments",JSON.stringify(arr));window.dispatchEvent(new Event("mindmate-photo-added"));};reader.readAsDataURL(file);});};input.click()};
      toolbar.children[1].onclick=(e)=>{e.stopPropagation();openStickerPicker()};
      toolbar.children[2].onclick=(e)=>{e.stopPropagation();openTemplates()};
      toolbar.children[3].onclick=(e)=>{e.stopPropagation();openDoodle()};
    };

    buildToolbar();
  });
})();