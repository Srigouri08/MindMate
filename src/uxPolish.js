import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "./firebase";

const WATER_KEY = (uid, date) => `mindmate-water-${uid}-${date}`;
const MOODS = { great: "😄", good: "😌", okay: "😐", low: "😔", rough: "😣" };
const PROMPTS = [
  "What made you smile today?",
  "What is something you are proud of today?",
  "What felt difficult today, and why?",
  "What is one small thing you want to do tomorrow?",
  "Who made your day a little better?",
  "What is something you want to remember about today?",
  "What are you grateful for right now?",
  "If today had a title, what would it be?",
];

function addStyles() {
  if (document.getElementById("mindmate-ux-polish")) return;
  const style = document.createElement("style");
  style.id = "mindmate-ux-polish";
  style.textContent = `
    .mm-inline-feature{margin-top:18px;padding:18px;border:1px solid #ddd2f1;border-radius:18px;background:rgba(255,255,255,.78);box-shadow:0 8px 25px rgba(72,49,130,.08)}
    .mm-inline-feature h3{margin:0 0 6px;color:#382a63;font-size:17px}.mm-inline-feature p{color:#827697;font-size:13px}
    .mm-ask-row{display:flex;gap:8px;margin-top:12px}.mm-ask-row input{flex:1;padding:11px 13px;border:1px solid #d8ccea;border-radius:11px;background:#fff;color:#382a63}.mm-ask-row button,.mm-inline-btn{border:0;border-radius:11px;padding:10px 14px;background:#7655d3;color:#fff;font-weight:700;cursor:pointer}.mm-ask-answer{margin-top:14px;padding:13px;border-radius:12px;background:#f4efff;color:#574777;white-space:pre-wrap;line-height:1.5;font-size:13px}
    .mm-section-screen{animation:mmFade .18s ease}.mm-section-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px}.mm-section-header h2{margin:0;color:#382a63}.mm-section-header p{margin:6px 0 0;color:#827697}.mm-section-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.mm-section-card{padding:20px;border:1px solid #ddd2f1;border-radius:20px;background:rgba(255,255,255,.8);box-shadow:0 8px 25px rgba(72,49,130,.08)}.mm-section-card h3{margin:0 0 8px;color:#382a63}.mm-big-stat{font-size:32px;font-weight:800;color:#7655d3}.mm-day-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin-top:12px}.mm-day{min-height:66px;padding:7px;border:1px solid #e4dbf1;border-radius:10px;background:#fff;font-size:11px;color:#756986}.mm-day strong{display:block;color:#4c3b68;margin-bottom:4px}.mm-day small{display:block;margin-top:3px}.mm-month-nav{display:flex;align-items:center;gap:8px}.mm-month-nav button{border:1px solid #d8ccea;background:#f4efff;color:#5a4387;border-radius:9px;width:32px;height:30px;cursor:pointer}.mm-month-nav strong{min-width:125px;text-align:center;color:#4c3b68}
    .mm-prompt-panel{position:fixed;right:78px;top:50%;transform:translateY(-50%);width:330px;max-height:70vh;overflow:auto;z-index:10060;padding:18px;border:1px solid #ddd0f5;border-radius:20px;background:#fffafc;box-shadow:0 22px 55px rgba(50,30,100,.25)}.mm-prompt-panel h3{margin:0 0 5px;color:#46366c}.mm-prompt-panel p{margin:0 0 13px;color:#887b9d;font-size:12px}.mm-prompt-choice{width:100%;text-align:left;border:1px solid #ded4ef;border-radius:12px;padding:11px;margin:5px 0;background:#fff;color:#594582;cursor:pointer}.mm-prompt-choice:hover{background:#f2eaff}.mm-prompt-close{float:right;border:0;background:transparent;font-size:22px;color:#81748f;cursor:pointer}
    .mm-photo-panel{position:fixed;right:78px;top:50%;transform:translateY(-50%);width:340px;max-height:78vh;overflow:auto;z-index:10060;padding:18px;border:1px solid #ddd0f5;border-radius:20px;background:#fffafc;box-shadow:0 22px 55px rgba(50,30,100,.25)}.mm-photo-panel h3{margin:0 0 5px;color:#46366c}.mm-photo-panel p{margin:0 0 13px;color:#887b9d;font-size:12px}.mm-photo-panel input{width:100%;box-sizing:border-box;padding:10px;margin:6px 0;border:1px solid #ddd3ed;border-radius:10px}.mm-photo-panel .mm-photo-add{width:100%;border:0;border-radius:11px;padding:11px;background:#7655d3;color:#fff;font-weight:700;cursor:pointer}.mm-photo-choices{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.mm-photo-frame{border:1px solid #ded4ef;border-radius:11px;padding:9px;background:#fff;color:#594582;cursor:pointer}.mm-photo-frame.active{background:#eadfff;border-color:#7655d3}
    [data-mm-theme="dark"] .mm-inline-feature,[data-mm-theme="dark"] .mm-section-card,.dark-mode .mm-inline-feature,.dark-mode .mm-section-card{background:#2d273d;border-color:#514667}.dark-mode .mm-inline-feature h3,.dark-mode .mm-section-card h2,.dark-mode .mm-section-card h3,.dark-mode .mm-section-header h2,.dark-mode .mm-month-nav strong,.dark-mode .mm-day strong{color:#eee8ff}.dark-mode .mm-inline-feature p,.dark-mode .mm-section-header p,.dark-mode .mm-section-card p,.dark-mode .mm-day{color:#b8aecb}.dark-mode .mm-ask-row input{background:#383049;color:#eee8ff;border-color:#5a4d70}.dark-mode .mm-ask-answer{background:#40345b;color:#eee8ff}.dark-mode .mm-day{background:#342d45;border-color:#514667}.dark-mode .mm-prompt-panel,.dark-mode .mm-photo-panel{background:#2d273d;border-color:#514667}.dark-mode .mm-prompt-panel h3,.dark-mode .mm-photo-panel h3{color:#eee8ff}.dark-mode .mm-prompt-choice,.dark-mode .mm-photo-frame{background:#39314a;color:#eee8ff;border-color:#5a4d70}.dark-mode .mm-prompt-choice:hover,.dark-mode .mm-photo-frame.active{background:#4a3b60}
    @keyframes mmFade{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
    @media(max-width:850px){.mm-section-grid{grid-template-columns:1fr}.mm-ask-row{flex-direction:column}.mm-prompt-panel,.mm-photo-panel{right:58px;width:285px}}
  `;
  document.head.appendChild(style);
}

function sidebarButton(label) {
  return [...document.querySelectorAll(".sidebar .side-item")].find((b) => b.textContent.replace(/\s+/g, " ").trim().toLowerCase().includes(label.toLowerCase()));
}

function cleanUnusedNav() {
  [...document.querySelectorAll(".sidebar .side-item")].forEach((b) => {
    const text = b.textContent.trim();
    if (/Memory Search|Weekly Reflection/i.test(text)) b.remove();
  });
}

function setMain(content) {
  const main = document.querySelector(".main-content");
  if (!main) return null;
  main.dataset.mmSectionMode = "true";
  main.innerHTML = "";
  main.appendChild(content);
  return main;
}

function restoreReactScreen() {
  const btn = sidebarButton("My Journal");
  if (btn) btn.click();
}

async function loadEntries() {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(collection(db, "journalEntries"), where("userId", "==", user.uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - new Date(a.createdAt?.toDate?.() || a.createdAt || 0));
}

function monthKey(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`; }
function monthTitle(date) { return date.toLocaleString("en-IN", { month:"long", year:"numeric" }); }

async function showWellnessSection() {
  const wrap = document.createElement("section");
  wrap.className = "mm-section-screen";
  wrap.innerHTML = `<div class="mm-section-header"><div><p class="eyebrow">Your everyday check-in</p><h2>🌿 Wellness Calendar</h2><p>See your moods and water habits together, day by day.</p></div><button class="mm-inline-btn" data-back>← My Journal</button></div><div class="mm-section-card"><div class="mm-month-nav"><button data-prev>‹</button><strong data-title></strong><button data-next>›</button></div><div class="mm-day-grid" data-days></div></div>`;
  setMain(wrap);
  const daysEl = wrap.querySelector("[data-days]"), titleEl = wrap.querySelector("[data-title]");
  let cursor = new Date(); cursor.setDate(1);
  let entries = [];
  try { entries = await loadEntries(); } catch {}
  const render = () => {
    const key = monthKey(cursor); titleEl.textContent = monthTitle(cursor); daysEl.innerHTML = "";
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
    const count = new Date(cursor.getFullYear(), cursor.getMonth()+1, 0).getDate();
    for(let i=0;i<first;i++) daysEl.appendChild(document.createElement("div"));
    for(let d=1;d<=count;d++){
      const date = new Date(cursor.getFullYear(),cursor.getMonth(),d), iso = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const dayEntries = entries.filter((e)=>{const x=e.createdAt?.toDate?.() || new Date(e.createdAt || 0);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`===iso;});
      const mood = dayEntries.find(e=>e.mood)?.mood; const water = Number(localStorage.getItem(WATER_KEY(auth.currentUser?.uid || "", iso)) || 0);
      const cell=document.createElement("div"); cell.className="mm-day"; cell.innerHTML=`<strong>${d}</strong><span>${mood?MOODS[mood]:"·"}</span><small>💧 ${water?`${(water/1000).toFixed(2).replace(/0+$/,'').replace(/\.$/,'')}L`:"0L"}</small>`; daysEl.appendChild(cell);
    }
  };
  wrap.querySelector("[data-prev]").onclick=()=>{cursor.setMonth(cursor.getMonth()-1);render()};
  wrap.querySelector("[data-next]").onclick=()=>{cursor.setMonth(cursor.getMonth()+1);render()};
  wrap.querySelector("[data-back]").onclick=restoreReactScreen;
  render();
}

async function showGrowthSection() {
  const wrap=document.createElement("section"); wrap.className="mm-section-screen";
  wrap.innerHTML=`<div class="mm-section-header"><div><p class="eyebrow">Look back gently</p><h2>🌱 Your Growth</h2><p>A simple picture of how your journaling has grown over time.</p></div><button class="mm-inline-btn" data-back>← My Journal</button></div><div class="mm-section-grid"><div class="mm-section-card"><h3>Total entries</h3><div class="mm-big-stat" data-total>—</div></div><div class="mm-section-card"><h3>Most common mood</h3><div class="mm-big-stat" data-mood>—</div></div><div class="mm-section-card"><h3>Journaling streak</h3><div class="mm-big-stat" data-streak>—</div><p>Consecutive days with at least one entry.</p></div><div class="mm-section-card"><h3>Recent themes</h3><p data-themes>Loading…</p></div></div><div class="mm-section-card" style="margin-top:16px"><h3>Monthly entries</h3><div class="mm-day-grid" style="grid-template-columns:repeat(auto-fit,minmax(90px,1fr))" data-months></div></div>`;
  setMain(wrap); wrap.querySelector("[data-back]").onclick=restoreReactScreen;
  let entries=[]; try{entries=await loadEntries()}catch{}
  wrap.querySelector("[data-total]").textContent=entries.length;
  const moodCounts=entries.filter(e=>e.mood).reduce((a,e)=>(a[e.mood]=(a[e.mood]||0)+1,a),{}); const common=Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]; wrap.querySelector("[data-mood]").textContent=common?`${MOODS[common]} ${common}`:"Not enough data";
  const dates=[...new Set(entries.map(e=>{const d=e.createdAt?.toDate?.()||new Date(e.createdAt||0);return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`}))].sort((a,b)=>new Date(b)-new Date(a)); let streak=0; const now=new Date(); now.setHours(0,0,0,0); for(let i=0;i<dates.length;i++){const target=new Date(now);target.setDate(now.getDate()-i);const key=`${target.getFullYear()}-${target.getMonth()+1}-${target.getDate()}`;if(dates.includes(key))streak++;else break;} wrap.querySelector("[data-streak]").textContent=`${streak} day${streak===1?"":"s"}`;
  const themes={Studies:["study","exam","college","class","assignment","project","coding"],Friends:["friend","friends","classmate"],Family:["family","mom","dad","mother","father","sister","brother"],Growth:["learn","goal","improve","growth","future"],SelfCare:["sleep","rest","walk","gym","health","calm","relax"]}; const text=entries.map(e=>e.text||"").join(" ").toLowerCase(); const found=Object.entries(themes).filter(([,w])=>w.some(x=>text.includes(x))).map(([k])=>k); wrap.querySelector("[data-themes]").textContent=found.length?found.join(" • "):"Everyday life";
  const monthly={}; entries.forEach(e=>{const d=e.createdAt?.toDate?.()||new Date(e.createdAt||0);const k=d.toLocaleString("en-IN",{month:"short",year:"numeric"});monthly[k]=(monthly[k]||0)+1}); const m=wrap.querySelector("[data-months]"); Object.entries(monthly).slice(0,8).forEach(([k,v])=>{const c=document.createElement("div");c.className="mm-day";c.innerHTML=`<strong>${k}</strong><span>${v} ${v===1?"entry":"entries"}</span>`;m.appendChild(c)});
}

function patchSectionButtons() {
  const moodBtn=sidebarButton("Mood Calendar"), growthBtn=sidebarButton("Your Growth");
  if(moodBtn && !moodBtn.dataset.mmUxPatched){const clone=moodBtn.cloneNode(true);clone.dataset.mmUxPatched="true";moodBtn.replaceWith(clone);clone.onclick=(e)=>{e.stopPropagation();showWellnessSection()};}
  if(growthBtn && !growthBtn.dataset.mmUxPatched){const clone=growthBtn.cloneNode(true);clone.dataset.mmUxPatched="true";growthBtn.replaceWith(clone);clone.onclick=(e)=>{e.stopPropagation();showGrowthSection()};}
}

function patchJournalAsk() {
  const main=document.querySelector(".main-content"); if(!main) return;
  const heading=[...main.querySelectorAll("h2")].find(h=>h.textContent.includes("My Journal"));
  if(!heading || heading.dataset.mmAskPatched) return;
  heading.dataset.mmAskPatched="true";
  const row=heading.parentElement; row.style.display="flex";row.style.alignItems="center";row.style.gap="10px";
  const button=document.createElement("button");button.className="mm-inline-btn";button.textContent="🧠 Ask MindMate";button.style.marginLeft="4px";row.appendChild(button);
  button.onclick=()=>{
    let panel=main.querySelector(".mm-inline-feature[data-ask]"); if(panel){panel.remove();return;}
    panel=document.createElement("div");panel.className="mm-inline-feature";panel.dataset.ask="true";panel.innerHTML=`<h3>🧠 Ask MindMate</h3><p>Ask a question about your journal and MindMate will answer using your saved entries.</p><div class="mm-ask-row"><input placeholder="e.g. What has been making me happy lately?"><button>Ask</button></div><div class="mm-ask-answer" hidden></div>`;row.parentElement.appendChild(panel);
    const input=panel.querySelector("input"), ask=panel.querySelector("button"), answer=panel.querySelector(".mm-ask-answer");
    const run=async()=>{const q=input.value.trim();if(!q)return;ask.disabled=true;ask.textContent="Thinking…";answer.hidden=false;answer.textContent="MindMate is thinking…";try{const entries=await loadEntries();const r=await fetch("https://mindmate-kuqp.onrender.com/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:q,entries:entries.slice(0,25).map(e=>({text:e.text,date:e.createdAt?.toDate?.()?.toISOString?.()||"",mood:e.mood||null}))})});const data=await r.json();if(!r.ok)throw new Error(data.error||"Could not answer");answer.textContent=data.answer||"I couldn't find an answer right now."}catch{answer.textContent="MindMate couldn't answer right now. Please try again in a moment."}ask.disabled=false;ask.textContent="Ask"};ask.onclick=run;input.onkeydown=e=>{if(e.key==='Enter')run()};
  };
}

function patchPromptButton() {
  const toolbar=document.querySelector(".mm-toolbar[data-mm-final]"); if(!toolbar || toolbar.querySelector("[data-mm-prompts]")) return;
  const button=document.createElement("button");button.className="mm-tool";button.dataset.mmPrompts="true";button.title="Writing prompts";button.textContent="✍️";toolbar.appendChild(button);
  button.onclick=(e)=>{e.stopPropagation();document.querySelector(".mm-prompt-panel")?.remove();const p=document.createElement("div");p.className="mm-prompt-panel";p.innerHTML=`<button class="mm-prompt-close">×</button><h3>✍️ Writing Prompts</h3><p>Pick one to start writing.</p><div data-list></div>`;document.body.appendChild(p);const list=p.querySelector("[data-list]");PROMPTS.forEach((text)=>{const b=document.createElement("button");b.className="mm-prompt-choice";b.textContent=text;b.onclick=()=>{const ta=document.querySelector(".book-page textarea");if(ta){const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value")?.set;setter?.call(ta,text);ta.dispatchEvent(new Event("input",{bubbles:true}));ta.focus()}p.remove()};list.appendChild(b)});p.querySelector(".mm-prompt-close").onclick=()=>p.remove()};
}

function photoData(){try{return JSON.parse(localStorage.getItem("mindmate-little-moments")||"[]")}catch{return[]}}
function savePhotoData(x){localStorage.setItem("mindmate-little-moments",JSON.stringify(x))}
function openLittleMomentPanel(){
  document.querySelector(".mm-photo-panel")?.remove();
  const p=document.createElement("div");p.className="mm-photo-panel";p.innerHTML=`<button class="mm-prompt-close">×</button><h3>📸 Little Moments</h3><p>Add a photo to your journal page and keep the moment close.</p><div class="mm-photo-choices"><button class="mm-photo-frame active" data-f="polaroid">📷 Polaroid</button><button class="mm-photo-frame" data-f="rounded">🔲 Rounded</button><button class="mm-photo-frame" data-f="film">🎞️ Film</button><button class="mm-photo-frame" data-f="tape">📎 Tape</button><button class="mm-photo-frame" data-f="heart">💜 Heart</button></div><input type="file" accept="image/*"><input data-caption placeholder="Optional caption..."><button class="mm-photo-add">Add Photo</button>`;document.body.appendChild(p);
  let frame="polaroid";p.querySelectorAll("[data-f]").forEach(b=>b.onclick=()=>{frame=b.dataset.f;p.querySelectorAll("[data-f]").forEach(x=>x.classList.remove("active"));b.classList.add("active")});p.querySelector(".mm-prompt-close").onclick=()=>p.remove();p.querySelector(".mm-photo-add").onclick=()=>{const file=p.querySelector("input[type=file]").files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{const a=photoData();const item={id:Date.now()+Math.random(),src:reader.result,frame,caption:p.querySelector("[data-caption]").value.trim(),x:12+(a.length%4)*19,y:10+(a.length%3)*22,createdAt:Date.now()};a.push(item);savePhotoData(a);renderLittleMoment(item);p.remove()};reader.readAsDataURL(file)};
}
function renderLittleMoment(item){const b=document.querySelector(".book-page");if(!b)return;document.querySelector(`[data-mm-ux-photo="${item.id}"]`)?.remove();const w=document.createElement("div");w.className=`mm-photo ${item.frame||"polaroid"}`;w.dataset.mmUxPhoto=item.id;w.style.left=(item.x||12)+"%";w.style.top=(item.y||12)+"%";w.innerHTML=`<img src="${item.src}" alt="Little moment"><span class="mm-caption">${item.caption||""}</span>`;b.appendChild(w)}
function restoreLittleMoments(){photoData().forEach(renderLittleMoment)}
function patchLittleMoments(){const b=sidebarButton("Little Moments");if(!b||b.dataset.mmUxPatched)return;const clone=b.cloneNode(true);clone.dataset.mmUxPatched="true";b.replaceWith(clone);clone.onclick=(e)=>{e.stopPropagation();const journal=sidebarButton("My Journal");if(journal)journal.click();setTimeout(openLittleMomentPanel,120)};}

function patch(){addStyles();cleanUnusedNav();patchSectionButtons();patchJournalAsk();patchPromptButton();patchLittleMoments();}

function boot(){patch();setInterval(patch,500);const observer=new MutationObserver(()=>patch());observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
