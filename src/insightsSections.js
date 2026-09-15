import { auth, db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

(() => {
  const STYLE_ID = "mindmate-insights-sections-style";
  const MOODS = {
    great: { emoji: "😄", label: "Great" },
    good: { emoji: "😌", label: "Good" },
    okay: { emoji: "😐", label: "Okay" },
    low: { emoji: "😔", label: "Low" },
    rough: { emoji: "😣", label: "Rough" },
  };

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .mm-insights-screen{width:100%;animation:mmFade .22s ease}
      .mm-insights-header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:24px}
      .mm-insights-header h2{margin:0 0 7px;font-size:30px;color:#38266f}
      .mm-insights-header p{margin:0;color:#827697}
      .mm-insights-back{border:1px solid #d1c3f3;background:#fff;color:#514674;border-radius:14px;padding:11px 16px;font-weight:700;cursor:pointer}
      .mm-calendar-card,.mm-growth-card{background:rgba(255,255,255,.82);border:1px solid #ddd2f1;border-radius:22px;padding:24px;box-shadow:0 10px 30px rgba(72,49,130,.08)}
      .mm-calendar-nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
      .mm-calendar-nav h3{margin:0;color:#382a63;font-size:20px}
      .mm-calendar-nav button{border:1px solid #d9cff0;background:#fff;border-radius:12px;width:40px;height:40px;cursor:pointer;font-size:18px;color:#514674}
      .mm-weekdays,.mm-calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px}
      .mm-weekdays div{text-align:center;color:#8b7ba5;font-size:11px;font-weight:700;padding:5px}
      .mm-day{min-height:78px;border:1px solid #e5dcf2;border-radius:14px;background:#fff;padding:8px;position:relative;text-align:left}
      .mm-day.empty{background:transparent;border-color:transparent}.mm-day.today{border:2px solid #8e70d2;background:#f7f2ff}.mm-day-num{font-size:12px;color:#76678e;font-weight:700}.mm-day-mood{font-size:24px;display:block;text-align:center;margin-top:2px}.mm-day-count{font-size:9px;color:#8b7ba5;text-align:center;display:block;margin-top:2px}
      .mm-growth-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}.mm-stat{border:1px solid #e2d8f2;background:#faf8ff;border-radius:17px;padding:17px}.mm-stat span{font-size:12px;color:#88799f}.mm-stat strong{display:block;font-size:25px;color:#4a3973;margin-top:5px}.mm-timeline{border:1px solid #e2d8f2;border-radius:18px;padding:18px;background:#faf8ff}.mm-timeline h3{margin:0 0 16px;color:#4a3973}.mm-bars{display:flex;align-items:flex-end;gap:9px;height:150px}.mm-bar-wrap{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:7px}.mm-bar{width:100%;max-width:38px;min-height:5px;background:#a78be0;border-radius:9px 9px 4px 4px}.mm-bar-wrap small{font-size:10px;color:#88799f}.mm-growth-message{margin-top:18px;padding:17px;border-radius:16px;background:#f1eaff;color:#59468a;font-weight:600;text-align:center}
      .dark-mode .mm-insights-header h2{color:#eee7ff}.dark-mode .mm-insights-header p{color:#aaa0bd}.dark-mode .mm-insights-back,.dark-mode .mm-calendar-nav button{background:#302943;color:#eee7ff;border-color:#514668}.dark-mode .mm-calendar-card,.dark-mode .mm-growth-card{background:rgba(42,36,60,.9);border-color:#4b4262}.dark-mode .mm-calendar-nav h3,.dark-mode .mm-stat strong,.dark-mode .mm-timeline h3{color:#eee7ff}.dark-mode .mm-day{background:#302943;border-color:#514668}.dark-mode .mm-day.today{background:#40345b;border-color:#9a7fe0}.dark-mode .mm-day-num,.dark-mode .mm-day-count,.dark-mode .mm-weekdays div{color:#aaa0bd}.dark-mode .mm-stat,.dark-mode .mm-timeline{background:#302943;border-color:#514668}.dark-mode .mm-stat span{color:#aaa0bd}.dark-mode .mm-growth-message{background:#40345b;color:#ded4f5}
      @keyframes mmFade{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
      @media(max-width:850px){.mm-growth-grid{grid-template-columns:repeat(2,1fr)}.mm-day{min-height:62px}.mm-calendar-card,.mm-growth-card{padding:16px}}
    `;
    document.head.appendChild(style);
  }

  function dateOf(value) { return value?.toDate ? value.toDate() : new Date(value); }
  function keyOf(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }

  async function loadEntries() {
    if (!auth.currentUser) return [];
    const q = query(collection(db, "journalEntries"), where("userId", "==", auth.currentUser.uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id:d.id, ...d.data() }));
  }

  function shell(title, subtitle, body) {
    return `<section class="mm-insights-screen"><div class="mm-insights-header"><div><p class="eyebrow">MindMate</p><h2>${title}</h2><p>${subtitle}</p></div><button class="mm-insights-back" data-mm-insights-back>← My Journal</button></div>${body}</section>`;
  }

  async function renderCalendar(root) {
    const entries = await loadEntries();
    let cursor = new Date(); cursor.setDate(1);
    const draw = () => {
      const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const last = new Date(cursor.getFullYear(), cursor.getMonth()+1, 0);
      const byDay = {};
      entries.forEach(e => { if(!e.createdAt) return; const d=dateOf(e.createdAt); const k=keyOf(d); if(!byDay[k]) byDay[k]={count:0,mood:null}; byDay[k].count++; if(!byDay[k].mood && e.mood) byDay[k].mood=e.mood; });
      const todayKey=keyOf(new Date());
      let cells="";
      for(let i=0;i<first.getDay();i++) cells += `<div class="mm-day empty"></div>`;
      for(let d=1;d<=last.getDate();d++){
        const date=new Date(cursor.getFullYear(),cursor.getMonth(),d), k=keyOf(date), info=byDay[k], mood=MOODS[info?.mood];
        cells += `<div class="mm-day ${k===todayKey?"today":""}"><span class="mm-day-num">${d}</span>${mood?`<span class="mm-day-mood">${mood.emoji}</span>`:""}${info?.count?`<span class="mm-day-count">${info.count} ${info.count===1?"entry":"entries"}</span>`:""}</div>`;
      }
      root.innerHTML=shell("Mood Calendar 📊","A gentle look at how your days have been feeling.",`<div class="mm-calendar-card"><div class="mm-calendar-nav"><button data-prev>‹</button><h3>${cursor.toLocaleString("en-IN",{month:"long",year:"numeric"})}</h3><button data-next>›</button></div><div class="mm-weekdays"><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div><div class="mm-calendar-grid">${cells}</div></div>`);
      root.querySelector("[data-prev]").onclick=()=>{cursor.setMonth(cursor.getMonth()-1);draw()}; root.querySelector("[data-next]").onclick=()=>{cursor.setMonth(cursor.getMonth()+1);draw()}; root.querySelector("[data-mm-insights-back]").onclick=()=>showOriginal(root);
    }; draw();
  }

  function streak(entries){
    const days=[...new Set(entries.filter(e=>e.createdAt).map(e=>keyOf(dateOf(e.createdAt))))].sort(); let best=0,run=0,prev=null;
    days.forEach(k=>{const d=new Date(k+"T00:00:00"); if(prev && (d-prev)/(86400000)===1) run++; else run=1; prev=d; best=Math.max(best,run)}); return best;
  }

  async function renderGrowth(root) {
    const entries=await loadEntries(), counts={}; entries.forEach(e=>{if(e.mood)counts[e.mood]=(counts[e.mood]||0)+1}); const common=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
    const now=new Date(), months=[]; for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push({d,count:0})}; entries.forEach(e=>{if(!e.createdAt)return;const d=dateOf(e.createdAt);const m=months.find(x=>x.d.getFullYear()===d.getFullYear()&&x.d.getMonth()===d.getMonth());if(m)m.count++}); const max=Math.max(1,...months.map(m=>m.count));
    const total=entries.length, best=streak(entries), commonMood=common?MOODS[common[0]]:null;
    const message=total===0?"Your first page is waiting for you. 🌱":best>=7?"You’re building a beautiful habit, one honest page at a time. Keep going. 💜":total>=10?"Look how much you've already captured. Your reflections are adding up. 🌷":"Every entry is a small act of self-awareness. Keep giving yourself space to reflect. ✨";
    root.innerHTML=shell("Your Growth 🌱","Small reflections become a story of progress over time.",`<div class="mm-growth-card"><div class="mm-growth-grid"><div class="mm-stat"><span>Total journal entries</span><strong>${total}</strong></div><div class="mm-stat"><span>Most common mood</span><strong>${commonMood?commonMood.emoji:"—"} ${commonMood?commonMood.label:"—"}</strong></div><div class="mm-stat"><span>Best journaling streak</span><strong>${best} ${best===1?"day":"days"}</strong></div><div class="mm-stat"><span>Months reflected</span><strong>${months.filter(m=>m.count>0).length}</strong></div></div><div class="mm-timeline"><h3>Monthly journaling timeline</h3><div class="mm-bars">${months.map(m=>`<div class="mm-bar-wrap"><div class="mm-bar" style="height:${Math.max(5,(m.count/max)*115)}px" title="${m.count} entries"></div><small>${m.d.toLocaleString("en-IN",{month:"short"})}</small></div>`).join("")}</div></div><div class="mm-growth-message">${message}</div></div>`); root.querySelector("[data-mm-insights-back]").onclick=()=>showOriginal(root);
  }

  function showOriginal(root){ root.innerHTML=""; root.dataset.mmHidden="1"; const journal=document.querySelector(".journal-list-screen"); if(journal) journal.style.display="block"; }

  function mount(type){
    const main=document.querySelector(".main-content"); if(!main)return;
    let root=document.getElementById("mm-insights-root"); if(!root){root=document.createElement("div");root.id="mm-insights-root";main.prepend(root)}
    const journal=document.querySelector(".journal-list-screen"); if(journal)journal.style.display="none";
    injectStyles(); type==="calendar"?renderCalendar(root):renderGrowth(root);
  }

  function scan(){
    if(!auth.currentUser)return;
    const buttons=[...document.querySelectorAll("button")];
    buttons.forEach(btn=>{const text=btn.textContent.trim(); if(btn.dataset.mmBound)return; if(/Mood Calendar/i.test(text)){btn.dataset.mmBound="1";btn.onclick=(e)=>{e.stopPropagation();mount("calendar")};} if(/Your Growth/i.test(text)){btn.dataset.mmBound="1";btn.onclick=(e)=>{e.stopPropagation();mount("growth")};}});
  }

  auth.onAuthStateChanged(user=>{ if(user){ setTimeout(scan,500); const observer=new MutationObserver(()=>scan()); observer.observe(document.body,{childList:true,subtree:true}); } });
})();
