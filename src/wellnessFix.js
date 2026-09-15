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
  /* Dark template cards: same structure/function, clearer visual separation. */
  [data-mm-theme="dark"] .mm-template-grid .mm-t-floral { background: #4b3652 !important; border-color: #8c648e !important; }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-dreamy { background: #35415a !important; border-color: #667fa8 !important; }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-nature { background: #354a3d !important; border-color: #668b70 !important; }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-night { background: #44365e !important; border-color: #8068a4 !important; }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-cute { background: #513b49 !important; border-color: #9a6e87 !important; }
  [data-mm-theme="dark"] .mm-template-grid .mm-t-minimal { background: #41404d !important; border-color: #777487 !important; }
  [data-mm-theme="dark"] .mm-template-grid .mm-final-choice:hover { filter: brightness(1.08); }

  .mm-water-card { min-height: 190px; }
  .mm-water-head { display:flex; justify-content:space-between; align-items:flex-start; gap:14px; }
  .mm-water-title { margin:0 0 4px; color:#382a63; font-size:18px; }
  .mm-water-sub { margin:0; color:#827697; font-size:13px; }
  .mm-water-total { font-size:26px; font-weight:800; color:#6548a5; white-space:nowrap; }
  .mm-water-buttons { display:flex; gap:7px; flex-wrap:wrap; margin:14px 0 12px; }
  .mm-water-add { border:1px solid #d9cef0; background:#f5f0ff; color:#59427f; border-radius:11px; padding:8px 10px; font-size:12px; font-weight:700; cursor:pointer; }
  .mm-water-add:hover { background:#e9ddff; border-color:#b9a1e2; }
  .mm-water-milestones { display:flex; gap:7px; align-items:flex-end; flex-wrap:wrap; }
  .mm-water-milestone { flex:1; min-width:58px; text-align:center; padding:7px 4px 6px; border:1px solid #e1d7f0; border-radius:12px; background:#faf8ff; opacity:.58; }
  .mm-water-milestone.active { opacity:1; border-color:#a98cdb; background:#f0e8ff; }
  .mm-water-milestone span { display:block; font-size:11px; color:#7d7191; margin-top:4px; }
  .mm-vessel { width:25px; height:31px; margin:auto; border:2px solid #8b74ba; border-radius:5px 5px 8px 8px; position:relative; overflow:hidden; background:rgba(255,255,255,.35); }
  .mm-vessel:after { content:""; position:absolute; left:0; right:0; bottom:0; background:#9ccdf2; height:45%; }
  .mm-vessel.full:after { height:88%; }
  .mm-water-emoji { font-size:27px; line-height:31px; }
  .mm-water-reset { border:0; background:transparent; color:#88799b; font-size:11px; cursor:pointer; padding:0; }
  .mm-water-reset:hover { color:#684d9c; text-decoration:underline; }
  [data-mm-theme="dark"] .mm-water-title { color:#eee7ff; }
  [data-mm-theme="dark"] .mm-water-sub { color:#b9aecb; }
  [data-mm-theme="dark"] .mm-water-total { color:#c7b3ff; }
  [data-mm-theme="dark"] .mm-water-add { background:#40365a; color:#eee8ff; border-color:#5b4e72; }
  [data-mm-theme="dark"] .mm-water-add:hover { background:#59477f; }
  [data-mm-theme="dark"] .mm-water-milestone { background:#352e47; border-color:#55496b; }
  [data-mm-theme="dark"] .mm-water-milestone.active { background:#46385f; border-color:#9276c7; }
  [data-mm-theme="dark"] .mm-water-milestone span { color:#c1b6d1; }

  .mm-wellness-modal { position:fixed; inset:0; z-index:12001; display:grid; place-items:center; padding:22px; background:rgba(35,24,60,.28); backdrop-filter:blur(5px); }
  .mm-wellness-card { width:min(820px,100%); max-height:88vh; overflow:auto; padding:25px; border:1px solid #ddd1f3; border-radius:24px; background:#fff; color:#403361; box-shadow:0 24px 70px rgba(45,30,85,.25); font-family:Arial,sans-serif; }
  .mm-wellness-head { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-bottom:18px; }
  .mm-wellness-head h2 { margin:0 0 5px; color:#38266f; font-size:25px; }
  .mm-wellness-head p { margin:0; color:#857999; font-size:13px; }
  .mm-wellness-close { width:36px; height:36px; border:1px solid #ddd2ef; border-radius:10px; background:#f8f5ff; color:#65557e; font-size:23px; }
  .mm-wellness-nav { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
  .mm-wellness-nav button { width:35px; height:35px; border:1px solid #ddd2ef; border-radius:9px; background:#f5f0ff; color:#5b4780; font-size:21px; }
  .mm-wellness-nav strong { font-size:17px; color:#49376f; }
  .mm-wellness-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:7px; }
  .mm-wellness-day { min-height:82px; padding:7px; border:1px solid #e2d9f1; border-radius:12px; background:#fff; }
  .mm-wellness-day-num { font-size:11px; color:#9185a0; }
  .mm-wellness-mood { margin-top:7px; font-size:20px; }
  .mm-wellness-water { margin-top:4px; font-size:10px; color:#5f79a0; font-weight:700; }
  .mm-wellness-empty { padding:8px; }
  [data-mm-theme="dark"] .mm-wellness-modal { background:rgba(8,6,18,.58); }
  [data-mm-theme="dark"] .mm-wellness-card { background:#2d273d; border-color:#514667; color:#eee8ff; box-shadow:0 24px 70px rgba(0,0,0,.45); }
  [data-mm-theme="dark"] .mm-wellness-head h2 { color:#f1eaff; }
  [data-mm-theme="dark"] .mm-wellness-head p { color:#b9aecb; }
  [data-mm-theme="dark"] .mm-wellness-close,.dark-mode .mm-wellness-nav button { background:#40365a; color:#eee8ff; border-color:#5b4e72; }
  [data-mm-theme="dark"] .mm-wellness-nav strong { color:#eee8ff; }
  [data-mm-theme="dark"] .mm-wellness-day { background:#352e47; border-color:#55496b; }
  [data-mm-theme="dark"] .mm-wellness-day-num { color:#b7acc9; }
  @media(max-width:650px){.mm-wellness-card{padding:18px}.mm-wellness-grid{gap:4px}.mm-wellness-day{min-height:70px;padding:5px}.mm-water-milestone{min-width:48px}}
`;
document.head.appendChild(style);

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function waterAmount() {
  const uid = auth.currentUser?.uid;
  if (!uid) return 0;
  return Number(localStorage.getItem(WATER_KEY(uid, todayKey())) || 0);
}

function setWater(amount) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  localStorage.setItem(WATER_KEY(uid, todayKey()), String(Math.max(0, amount)));
  renderWaterCard();
}

function waterMilestone(total) {
  if (total >= 4000) return { icon:"🫙", label:"4L+", level:4 };
  if (total >= 3000) return { icon:"🫗", label:"3L", level:3 };
  if (total >= 2000) return { icon:"full", label:"2L", level:2 };
  if (total >= 1000) return { icon:"half", label:"1L", level:1 };
  return { icon:"💧", label:"Starting", level:0 };
}

function vessel(icon) {
  if (icon === "half") return `<div class="mm-vessel"></div>`;
  if (icon === "full") return `<div class="mm-vessel full"></div>`;
  return `<div class="mm-water-emoji">${icon}</div>`;
}

function renderWaterCard() {
  const card = document.querySelector(".insights-card");
  if (!card) return;
  if (card.dataset.waterCard === "1" && card.querySelector(".mm-water-add")) {
    updateWaterCardValues(card);
    return;
  }
  card.dataset.waterCard = "1";
  card.className = "checkin-card insights-card mm-water-card";
  card.innerHTML = `<div class="mm-water-head"><div><h3 class="mm-water-title">Water tracker 💧</h3><p class="mm-water-sub">Keep a simple record of today's intake.</p></div><div><div class="mm-water-total" data-water-total>0 ml</div><button class="mm-water-reset" data-water-reset>Reset today</button></div></div><div class="mm-water-buttons"><button class="mm-water-add" data-water="250">+250 ml</button><button class="mm-water-add" data-water="500">+500 ml</button><button class="mm-water-add" data-water="1000">+1 L</button></div><div class="mm-water-milestones"><div class="mm-water-milestone" data-level="1">${vessel("half")}<span>1L</span></div><div class="mm-water-milestone" data-level="2">${vessel("full")}<span>2L</span></div><div class="mm-water-milestone" data-level="3">${vessel("🫗")}<span>3L</span></div><div class="mm-water-milestone" data-level="4">${vessel("🫙")}<span>4L+</span></div></div>`;
  card.querySelectorAll("[data-water]").forEach((button) => button.addEventListener("click", () => setWater(waterAmount() + Number(button.dataset.water))));
  card.querySelector("[data-water-reset]").addEventListener("click", () => setWater(0));
  updateWaterCardValues(card);
}

function updateWaterCardValues(card) {
  const total = waterAmount();
  card.querySelector("[data-water-total]").textContent = total >= 1000 ? `${(total/1000).toFixed(total%1000 ? 1 : 0)} L` : `${total} ml`;
  const level = Math.min(4, Math.floor(total / 1000));
  card.querySelectorAll("[data-level]").forEach((item) => item.classList.toggle("active", Number(item.dataset.level) <= level));
}

function closeWellness() {
  document.querySelector(".mm-wellness-modal")?.remove();
}

async function openWellnessCalendar() {
  closeWellness();
  const overlay = document.createElement("div");
  overlay.className = "mm-wellness-modal";
  overlay.innerHTML = `<section class="mm-wellness-card"><div class="mm-wellness-head"><div><h2>🌿 Wellness Calendar</h2><p>See your mood and water intake together, day by day.</p></div><button class="mm-wellness-close">×</button></div><div class="mm-wellness-nav"><button data-prev>‹</button><strong data-month></strong><button data-next>›</button></div><div class="mm-wellness-grid" data-grid></div></section>`;
  document.body.appendChild(overlay);
  overlay.querySelector(".mm-wellness-close").onclick = closeWellness;
  overlay.onclick = (event) => { if (event.target === overlay) closeWellness(); };

  const user = auth.currentUser;
  if (!user) return;
  const q = query(collection(db, "journalEntries"), where("userId", "==", user.uid));
  const snap = await getDocs(q);
  const entries = snap.docs.map((doc) => doc.data());
  let monthDate = new Date();

  const draw = () => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    overlay.querySelector("[data-month]").textContent = monthDate.toLocaleString("en-IN", { month:"long", year:"numeric" });
    const days = new Date(year, month + 1, 0).getDate();
    const start = new Date(year, month, 1).getDay();
    const cells = [];
    for (let i=0;i<start;i++) cells.push(`<div class="mm-wellness-empty"></div>`);
    for (let day=1;day<=days;day++) {
      const date = new Date(year, month, day);
      const key = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const dayEntries = entries.filter((item) => { const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt); return d.getFullYear()===year && d.getMonth()===month && d.getDate()===day; });
      const mood = dayEntries.map((item)=>item.mood).find(Boolean);
      const uid = auth.currentUser?.uid;
      const water = Number(localStorage.getItem(WATER_KEY(uid, key)) || 0);
      const waterText = water ? `💧 ${water >= 1000 ? `${(water/1000).toFixed(water%1000 ? 1 : 0)}L` : `${water}ml`}` : "";
      cells.push(`<div class="mm-wellness-day"><div class="mm-wellness-day-num">${day}</div><div class="mm-wellness-mood">${MOODS[mood] || "·"}</div><div class="mm-wellness-water">${waterText}</div></div>`);
    }
    overlay.querySelector("[data-grid]").innerHTML = cells.join("");
  };
  overlay.querySelector("[data-prev]").onclick = () => { monthDate = new Date(monthDate.getFullYear(), monthDate.getMonth()-1, 1); draw(); };
  overlay.querySelector("[data-next]").onclick = () => { monthDate = new Date(monthDate.getFullYear(), monthDate.getMonth()+1, 1); draw(); };
  draw();
}

function patchSidebar() {
  document.querySelectorAll(".side-item").forEach((button) => {
    const text = button.textContent.trim();
    if (text.includes("Weekly Reflection")) button.remove();
    if (text.includes("Mood Calendar") && !button.dataset.wellnessCalendar) {
      const replacement = button.cloneNode(true);
      replacement.dataset.wellnessCalendar = "1";
      replacement.innerHTML = `<span>🌿</span> Wellness Calendar`;
      replacement.addEventListener("click", openWellnessCalendar);
      button.replaceWith(replacement);
    }
  });
}

function patchStickerToolbar() {
  const sticker = document.querySelector(".placed-sticker.selected");
  const floating = document.querySelector(".mm-sticker-floating");
  if (!sticker || !floating) return;
  const book = document.querySelector(".book-page");
  if (!book) return;
  const bookRect = book.getBoundingClientRect();
  const x = parseFloat(sticker.style.left) || 50;
  const y = parseFloat(sticker.style.top) || 50;
  const left = bookRect.left + (x / 100) * bookRect.width;
  const top = bookRect.top + (y / 100) * bookRect.height - 42;
  floating.style.left = `${Math.max(8, left - floating.offsetWidth / 2)}px`;
  floating.style.top = `${Math.max(8, top)}px`;
}

function start() {
  const observer = new MutationObserver(() => {
    patchSidebar();
    renderWaterCard();
    patchStickerToolbar();
  });
  observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:["class","style"] });
  patchSidebar();
  renderWaterCard();
  setInterval(() => { patchSidebar(); renderWaterCard(); patchStickerToolbar(); }, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
else start();
