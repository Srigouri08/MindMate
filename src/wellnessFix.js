import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "./firebase";

const MOODS = {
  great: "😄",
  good: "😌",
  okay: "😐",
  low: "😔",
  rough: "😣",
};

const WATER_KEY = (uid, date) => `mindmate-water-${uid}-${date}`;

const style = document.createElement("style");
style.textContent = `
  [data-mm-theme="dark"] .mm-template-grid .mm-t-floral { background:#4b3652!important;border-color:#8c648e!important }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-dreamy { background:#35415a!important;border-color:#667fa8!important }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-nature { background:#354a3d!important;border-color:#668b70!important }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-night { background:#44365e!important;border-color:#8068a4!important }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-cute { background:#513b49!important;border-color:#9a6e87!important }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-minimal { background:#41404d!important;border-color:#777487!important }

  .mm-water-card{min-height:205px}
  .mm-water-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}
  .mm-water-title{margin:0 0 4px;color:#382a63;font-size:18px}
  .mm-water-sub{margin:0;color:#827697;font-size:13px}
  .mm-water-total{font-size:26px;font-weight:800;color:#6548a5;white-space:nowrap}
  .mm-water-buttons{display:flex;gap:7px;flex-wrap:wrap;margin:14px 0 12px}
  .mm-water-add{border:1px solid #d9cef0;background:#f5f0ff;color:#59427f;border-radius:11px;padding:8px 10px;font-size:12px;font-weight:700;cursor:pointer}
  .mm-water-add:hover{background:#e9ddff;border-color:#b9a1e2}
  .mm-water-milestones{display:flex;gap:7px;align-items:stretch;flex-wrap:wrap}
  .mm-water-milestone{flex:1;min-width:58px;text-align:center;padding:8px 4px 7px;border:1px solid #e1d7f0;border-radius:12px;background:#faf8ff;opacity:.55;transition:.2s}
  .mm-water-milestone.active{opacity:1;border-color:#a98cdb;background:#f0e8ff;transform:translateY(-1px)}
  .mm-water-milestone span{display:block;font-size:11px;color:#7d7191;margin-top:5px;font-weight:700}
  .mm-water-emoji{font-size:28px;line-height:31px;height:31px}
  .mm-water-reset{border:0;background:transparent;color:#88799b;font-size:11px;cursor:pointer;padding:0}
  .mm-water-reset:hover{color:#684d9c;text-decoration:underline}
  .mm-water-calendar{margin-top:11px;width:100%;border:1px solid #ded4ef;border-radius:11px;padding:8px;background:#f4efff;color:#59427f;font-size:11px;font-weight:700;cursor:pointer}
  .mm-water-calendar:hover{background:#e9ddff}

  .mm-wellness-modal{position:fixed;inset:0;z-index:12001;display:grid;place-items:center;padding:22px;background:rgba(35,24,60,.28);backdrop-filter:blur(5px)}
  .mm-wellness-card{width:min(820px,100%);max-height:88vh;overflow:auto;padding:25px;border:1px solid #ddd1f3;border-radius:24px;background:#fff;color:#403361;box-shadow:0 24px 70px rgba(45,30,85,.25);font-family:Arial,sans-serif}
  .mm-wellness-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px}
  .mm-wellness-head h2{margin:0 0 5px;color:#38266f;font-size:25px}
  .mm-wellness-head p{margin:0;color:#857999;font-size:13px}
  .mm-wellness-close{width:36px;height:36px;border:1px solid #ddd2ef;border-radius:10px;background:#f8f5ff;color:#65557e;font-size:23px}
  .mm-wellness-nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
  .mm-wellness-nav button{width:35px;height:35px;border:1px solid #ddd2ef;border-radius:9px;background:#f5f0ff;color:#5b4780;font-size:21px}
  .mm-wellness-nav strong{font-size:17px;color:#49376f}
  .mm-wellness-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px}
  .mm-wellness-week{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin-bottom:6px}
  .mm-wellness-week div{text-align:center;font-size:10px;color:#978aa5;font-weight:700}
  .mm-wellness-day{min-height:82px;padding:7px;border:1px solid #e2d9f1;border-radius:12px;background:#fff}
  .mm-wellness-day.today{border-color:#8b6bd0;box-shadow:0 0 0 2px #eee7ff}
  .mm-wellness-day-num{font-size:11px;color:#9185a0}
  .mm-wellness-mood{margin-top:6px;font-size:20px}
  .mm-wellness-water{margin-top:4px;font-size:11px;color:#5f79a0;font-weight:800}
  .mm-wellness-empty{padding:8px}
  .mm-wellness-legend{margin-top:13px;padding:11px 13px;border-radius:12px;background:#f6f1ff;color:#77698c;font-size:11px;line-height:1.5}

  [data-mm-theme="dark"] .mm-wellness-modal{background:rgba(8,6,18,.58)}
  [data-mm-theme="dark"] .mm-wellness-card{background:#2d273d;border-color:#514667;color:#eee8ff;box-shadow:0 24px 70px rgba(0,0,0,.45)}
  [data-mm-theme="dark"] .mm-wellness-head h2{color:#f1eaff}
  [data-mm-theme="dark"] .mm-wellness-head p{color:#b9aecb}
  [data-mm-theme="dark"] .mm-wellness-close,[data-mm-theme="dark"] .mm-wellness-nav button{background:#40365a;color:#eee8ff;border-color:#5b4e72}
  [data-mm-theme="dark"] .mm-wellness-nav strong{color:#eee8ff}
  [data-mm-theme="dark"] .mm-wellness-day{background:#352e47;border-color:#55496b}
  [data-mm-theme="dark"] .mm-wellness-day-num{color:#b7acc9}
  [data-mm-theme="dark"] .mm-wellness-legend{background:#40365a;color:#c4b8d7}
  [data-mm-theme="dark"] .mm-water-title{color:#eee7ff}
  [data-mm-theme="dark"] .mm-water-sub,[data-mm-theme="dark"] .mm-water-reset{color:#b9aecb}
  [data-mm-theme="dark"] .mm-water-total{color:#c7b3ff}
  [data-mm-theme="dark"] .mm-water-add{background:#40365a;color:#eee8ff;border-color:#5b4e72}
  [data-mm-theme="dark"] .mm-water-add:hover{background:#59477f}
  [data-mm-theme="dark"] .mm-water-milestone{background:#352e47;border-color:#55496b}
  [data-mm-theme="dark"] .mm-water-milestone.active{background:#46385f;border-color:#9276c7}
  [data-mm-theme="dark"] .mm-water-milestone span{color:#c1b6d1}
  [data-mm-theme="dark"] .mm-water-calendar{background:#40365a;color:#eee8ff;border-color:#5b4e72}
  @media(max-width:650px){.mm-wellness-card{padding:18px}.mm-wellness-grid,.mm-wellness-week{gap:4px}.mm-wellness-day{min-height:70px;padding:5px}.mm-water-milestone{min-width:48px}}
`;
document.head.appendChild(style);

function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function waterAmount(date=todayKey()){const uid=auth.currentUser?.uid;if(!uid)return 0;return Number(localStorage.getItem(WATER_KEY(uid,date))||0)}
function setWater(amount){const uid=auth.currentUser?.uid;if(!uid)return;localStorage.setItem(WATER_KEY(uid,todayKey()),String(Math.max(0,amount)));renderWaterCard()}

function vesselFor(level){
  if(level===1)return "💧";
  if(level===2)return "🥛";
  if(level===3)return "🫗";
  return "🫙";
}

function renderWaterCard(){
  const card=document.querySelector(".insights-card");
  if(!card)return;
  if(card.dataset.waterCard==="1"&&card.querySelector(".mm-water-add")){updateWaterCardValues(card);return}
  card.dataset.waterCard="1";
  card.className="checkin-card insights-card mm-water-card";
  card.innerHTML=`<div class="mm-water-head"><div><h3 class="mm-water-title">Hydration Check 💧</h3><p class="mm-water-sub">Keep a simple record of today's intake.</p></div><div><div class="mm-water-total" data-water-total>0 ml</div><button class="mm-water-reset" data-water-reset>Reset today</button></div></div><div class="mm-water-buttons"><button class="mm-water-add" data-water="250">+250 ml</button><button class="mm-water-add" data-water="500">+500 ml</button><button class="mm-water-add" data-water="1000">+1 L</button></div><div class="mm-water-milestones"><div class="mm-water-milestone" data-level="1"><div class="mm-water-emoji">${vesselFor(1)}</div><span>1L</span></div><div class="mm-water-milestone" data-level="2"><div class="mm-water-emoji">${vesselFor(2)}</div><span>2L</span></div><div class="mm-water-milestone" data-level="3"><div class="mm-water-emoji">${vesselFor(3)}</div><span>3L</span></div><div class="mm-water-milestone" data-level="4"><div class="mm-water-emoji">${vesselFor(4)}</div><span>4L</span></div></div><button class="mm-water-calendar" data-open-water-calendar>📅 View hydration calendar</button>`;
  card.querySelectorAll("[data-water]").forEach(button=>button.addEventListener("click",()=>setWater(waterAmount()+Number(button.dataset.water))));
  card.querySelector("[data-water-reset]").addEventListener("click",()=>setWater(0));
  card.querySelector("[data-open-water-calendar]").addEventListener("click",openWellnessCalendar);
  updateWaterCardValues(card)
}

function updateWaterCardValues(card){
  const total=waterAmount();
  card.querySelector("[data-water-total]").textContent=total>=1000?`${(total/1000).toFixed(total%1000?1:0)} L`:`${total} ml`;
  const level=Math.min(4,Math.floor(total/1000));
  card.querySelectorAll("[data-level]").forEach(item=>item.classList.toggle("active",Number(item.dataset.level)<=level))
}

function closeWellness(){document.querySelector(".mm-wellness-modal")?.remove()}

async function openWellnessCalendar(){
  closeWellness();
  const overlay=document.createElement("div");
  overlay.className="mm-wellness-modal";
  overlay.innerHTML=`<section class="mm-wellness-card"><div class="mm-wellness-head"><div><h2>💧 Hydration Calendar</h2><p>See how much water you recorded each day.</p></div><button class="mm-wellness-close">×</button></div><div class="mm-wellness-nav"><button data-prev>‹</button><strong data-month></strong><button data-next>›</button></div><div class="mm-wellness-week"><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div><div class="mm-wellness-grid" data-grid></div><div class="mm-wellness-legend">💧 1L &nbsp; 🥛 2L &nbsp; 🫗 3L &nbsp; 🫙 4L &nbsp; · = no water logged</div></section>`;
  document.body.appendChild(overlay);
  overlay.querySelector(".mm-wellness-close").onclick=closeWellness;
  overlay.onclick=event=>{if(event.target===overlay)closeWellness()};
  const user=auth.currentUser;if(!user)return;
  let monthDate=new Date();
  const draw=()=>{
    const year=monthDate.getFullYear(),month=monthDate.getMonth();
    overlay.querySelector("[data-month]").textContent=monthDate.toLocaleString("en-IN",{month:"long",year:"numeric"});
    const days=new Date(year,month+1,0).getDate(),start=new Date(year,month,1).getDay(),cells=[];
    for(let i=0;i<start;i++)cells.push(`<div class="mm-wellness-empty"></div>`);
    for(let day=1;day<=days;day++){
      const key=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const water=waterAmount(key),date=new Date(year,month,day),isToday=date.toDateString()===new Date().toDateString();
      const level=Math.min(4,Math.floor(water/1000));
      const icon=level?`<div class="mm-wellness-mood">${vesselFor(level)}</div>`:`<div class="mm-wellness-mood">·</div>`;
      const text=water?`${water>=1000?(water/1000).toFixed(water%1000?1:0)+"L":water+"ml"}`:"";
      cells.push(`<div class="mm-wellness-day ${isToday?"today":""}"><div class="mm-wellness-day-num">${day}</div>${icon}<div class="mm-wellness-water">${text}</div></div>`)
    }
    overlay.querySelector("[data-grid]").innerHTML=cells.join("")
  };
  overlay.querySelector("[data-prev]").onclick=()=>{monthDate=new Date(monthDate.getFullYear(),monthDate.getMonth()-1,1);draw()};
  overlay.querySelector("[data-next]").onclick=()=>{monthDate=new Date(monthDate.getFullYear(),monthDate.getMonth()+1,1);draw()};
  draw()
}

function patchSidebar(){
  document.querySelectorAll(".side-item").forEach(button=>{
    const text=button.textContent.trim();
    if(text.includes("Weekly Reflection"))button.remove();
    if(text.includes("Mood Calendar")&&!button.dataset.wellnessCalendar){
      const replacement=button.cloneNode(true);replacement.dataset.wellnessCalendar="1";replacement.innerHTML=`<span>💧</span> Hydration Calendar`;replacement.addEventListener("click",openWellnessCalendar);button.replaceWith(replacement)
    }
  })
}

function patchStickerToolbar(){
  const sticker=document.querySelector(".placed-sticker.selected"),floating=document.querySelector(".mm-sticker-floating");
  if(!sticker||!floating)return;
  const book=document.querySelector(".book-page");if(!book)return;
  const r=book.getBoundingClientRect(),x=parseFloat(sticker.style.left)||50,y=parseFloat(sticker.style.top)||50;
  floating.style.left=`${Math.max(8,r.left+(x/100)*r.width-floating.offsetWidth/2)}px`;
  floating.style.top=`${Math.max(8,r.top+(y/100)*r.height-42)}px`
}

function start(){
  const observer=new MutationObserver(()=>{patchSidebar();renderWaterCard();patchStickerToolbar()});
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class","style"]});
  patchSidebar();renderWaterCard();setInterval(()=>{patchSidebar();renderWaterCard();patchStickerToolbar()},500)
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
