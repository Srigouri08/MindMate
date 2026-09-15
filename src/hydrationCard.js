import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const WATER_KEY = (uid, date) => `mindmate-water-${uid}-${date}`;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function waterAmount(date = todayKey()) {
  const uid = auth.currentUser?.uid;
  if (!uid) return 0;
  return Number(localStorage.getItem(WATER_KEY(uid, date)) || 0);
}

function vesselFor(level) {
  if (level === 1) return "💧";
  if (level === 2) return "🥛";
  if (level === 3) return "🫗";
  return "🫙";
}

function addStyles() {
  if (document.getElementById("mindmate-hydration-styles")) return;
  const style = document.createElement("style");
  style.id = "mindmate-hydration-styles";
  style.textContent = `
    .mindmate-hydration-card{background:rgba(255,255,255,.76);border:1px solid #ddd2f1;border-radius:20px;padding:20px;box-shadow:0 10px 30px rgba(72,49,130,.08);min-height:205px;color:#403361}
    .mindmate-hydration-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}
    .mindmate-hydration-title{margin:0 0 4px;color:#382a63;font-size:18px}
    .mindmate-hydration-sub{margin:0;color:#827697;font-size:13px}
    .mindmate-hydration-total{font-size:26px;font-weight:800;color:#6548a5;white-space:nowrap}
    .mindmate-hydration-reset{border:0;background:transparent;color:#88799b;font-size:11px;cursor:pointer;padding:0}
    .mindmate-hydration-reset:hover{color:#684d9c;text-decoration:underline}
    .mindmate-hydration-buttons{display:flex;gap:7px;flex-wrap:wrap;margin:14px 0 12px}
    .mindmate-hydration-add{border:1px solid #d9cef0;background:#f5f0ff;color:#59427f;border-radius:11px;padding:8px 10px;font-size:12px;font-weight:700;cursor:pointer}
    .mindmate-hydration-add:hover{background:#e9ddff;border-color:#b9a1e2}
    .mindmate-hydration-milestones{display:flex;gap:7px;align-items:stretch;flex-wrap:wrap}
    .mindmate-hydration-milestone{flex:1;min-width:58px;text-align:center;padding:8px 4px 7px;border:1px solid #e1d7f0;border-radius:12px;background:#faf8ff;opacity:.55;transition:.2s}
    .mindmate-hydration-milestone.active{opacity:1;border-color:#a98cdb;background:#f0e8ff;transform:translateY(-1px)}
    .mindmate-hydration-emoji{font-size:28px;line-height:31px;height:31px}
    .mindmate-hydration-milestone-label{display:block;font-size:11px;color:#7d7191;margin-top:5px;font-weight:700}
    .mindmate-hydration-calendar{margin-top:11px;width:100%;border:1px solid #ded4ef;border-radius:11px;padding:8px;background:#f4efff;color:#59427f;font-size:11px;font-weight:700;cursor:pointer}
    .mindmate-hydration-calendar:hover{background:#e9ddff}
    .mindmate-hydration-modal{position:fixed;inset:0;z-index:12001;display:grid;place-items:center;padding:22px;background:rgba(35,24,60,.28);backdrop-filter:blur(5px)}
    .mindmate-hydration-modal-card{width:min(820px,100%);max-height:88vh;overflow:auto;padding:25px;border:1px solid #ddd1f3;border-radius:24px;background:#fff;color:#403361;box-shadow:0 24px 70px rgba(45,30,85,.25);font-family:Arial,sans-serif}
    .mindmate-hydration-modal-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px}
    .mindmate-hydration-modal-head h2{margin:0 0 5px;color:#38266f;font-size:25px}
    .mindmate-hydration-modal-head p{margin:0;color:#857999;font-size:13px}
    .mindmate-hydration-close,.mindmate-hydration-nav button{border:1px solid #ddd2ef;border-radius:9px;background:#f5f0ff;color:#5b4780;cursor:pointer}
    .mindmate-hydration-close{width:36px;height:36px;font-size:23px}
    .mindmate-hydration-nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
    .mindmate-hydration-nav button{width:35px;height:35px;font-size:21px}
    .mindmate-hydration-nav strong{font-size:17px;color:#49376f}
    .mindmate-hydration-week,.mindmate-hydration-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px}
    .mindmate-hydration-week{margin-bottom:6px}
    .mindmate-hydration-week div{text-align:center;font-size:10px;color:#978aa5;font-weight:700}
    .mindmate-hydration-day{min-height:82px;padding:7px;border:1px solid #e2d9f1;border-radius:12px;background:#fff}
    .mindmate-hydration-day.today{border-color:#8b6bd0;box-shadow:0 0 0 2px #eee7ff}
    .mindmate-hydration-day-num{font-size:11px;color:#9185a0}
    .mindmate-hydration-day-icon{margin-top:6px;font-size:20px}
    .mindmate-hydration-day-water{margin-top:4px;font-size:11px;color:#5f79a0;font-weight:800}
    .mindmate-hydration-legend{margin-top:13px;padding:11px 13px;border-radius:12px;background:#f6f1ff;color:#77698c;font-size:11px;line-height:1.5}

    .app.dark-mode .mindmate-hydration-card{background:rgba(42,36,60,.86);border-color:#4b4262;color:#eee7ff}
    .app.dark-mode .mindmate-hydration-title{color:#eee7ff}
    .app.dark-mode .mindmate-hydration-sub,.app.dark-mode .mindmate-hydration-reset{color:#b9aecb}
    .app.dark-mode .mindmate-hydration-total{color:#c7b3ff}
    .app.dark-mode .mindmate-hydration-add{background:#40365a;color:#eee8ff;border-color:#5b4e72}
    .app.dark-mode .mindmate-hydration-add:hover{background:#59477f}
    .app.dark-mode .mindmate-hydration-milestone{background:#352e47;border-color:#55496b}
    .app.dark-mode .mindmate-hydration-milestone.active{background:#46385f;border-color:#9276c7}
    .app.dark-mode .mindmate-hydration-milestone-label{color:#c1b6d1}
    .app.dark-mode .mindmate-hydration-calendar{background:#40365a;color:#eee8ff;border-color:#5b4e72}
    .app.dark-mode .mindmate-hydration-modal{background:rgba(8,6,18,.58)}
    .app.dark-mode .mindmate-hydration-modal-card{background:#2d273d;border-color:#514667;color:#eee8ff}
    .app.dark-mode .mindmate-hydration-modal-head h2,.app.dark-mode .mindmate-hydration-nav strong{color:#f1eaff}
    .app.dark-mode .mindmate-hydration-modal-head p{color:#b9aecb}
    .app.dark-mode .mindmate-hydration-close,.app.dark-mode .mindmate-hydration-nav button{background:#40365a;color:#eee8ff;border-color:#5b4e72}
    .app.dark-mode .mindmate-hydration-day{background:#352e47;border-color:#55496b}
    .app.dark-mode .mindmate-hydration-day-num{color:#b7acc9}
    .app.dark-mode .mindmate-hydration-legend{background:#40365a;color:#c4b8d7}
    @media(max-width:650px){.mindmate-hydration-modal-card{padding:18px}.mindmate-hydration-grid,.mindmate-hydration-week{gap:4px}.mindmate-hydration-day{min-height:70px;padding:5px}.mindmate-hydration-milestone{min-width:48px}}
  `;
  document.head.appendChild(style);
}

function closeCalendar() {
  document.querySelector(".mindmate-hydration-modal")?.remove();
}

function openCalendar() {
  closeCalendar();
  const overlay = document.createElement("div");
  overlay.className = "mindmate-hydration-modal";
  overlay.innerHTML = `<section class="mindmate-hydration-modal-card"><div class="mindmate-hydration-modal-head"><div><h2>💧 Hydration Calendar</h2><p>See how much water you recorded each day.</p></div><button class="mindmate-hydration-close">×</button></div><div class="mindmate-hydration-nav"><button data-prev>‹</button><strong data-month></strong><button data-next>›</button></div><div class="mindmate-hydration-week"><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div><div class="mindmate-hydration-grid" data-grid></div><div class="mindmate-hydration-legend">💧 1L &nbsp; 🥛 2L &nbsp; 🫗 3L &nbsp; 🫙 4L &nbsp; · = no water logged</div></section>`;
  document.body.appendChild(overlay);
  overlay.querySelector(".mindmate-hydration-close").onclick = closeCalendar;
  overlay.onclick = (event) => { if (event.target === overlay) closeCalendar(); };

  let monthDate = new Date();
  const draw = () => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    overlay.querySelector("[data-month]").textContent = monthDate.toLocaleString("en-IN", { month: "long", year: "numeric" });
    const days = new Date(year, month + 1, 0).getDate();
    const start = new Date(year, month, 1).getDay();
    const cells = [];
    for (let i = 0; i < start; i += 1) cells.push(`<div></div>`);
    for (let day = 1; day <= days; day += 1) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const water = waterAmount(key);
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const level = Math.min(4, Math.floor(water / 1000));
      const icon = level ? vesselFor(level) : "·";
      const text = water >= 1000 ? `${(water / 1000).toFixed(water % 1000 ? 1 : 0)}L` : water ? `${water}ml` : "";
      cells.push(`<div class="mindmate-hydration-day ${isToday ? "today" : ""}"><div class="mindmate-hydration-day-num">${day}</div><div class="mindmate-hydration-day-icon">${icon}</div><div class="mindmate-hydration-day-water">${text}</div></div>`);
    }
    overlay.querySelector("[data-grid]").innerHTML = cells.join("");
  };

  overlay.querySelector("[data-prev]").onclick = () => { monthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1); draw(); };
  overlay.querySelector("[data-next]").onclick = () => { monthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1); draw(); };
  draw();
}

function updateCard(card) {
  const total = waterAmount();
  card.querySelector("[data-hydration-total]").textContent = total >= 1000 ? `${(total / 1000).toFixed(total % 1000 ? 1 : 0)} L` : `${total} ml`;
  const level = Math.min(4, Math.floor(total / 1000));
  card.querySelectorAll("[data-hydration-level]").forEach((item) => item.classList.toggle("active", Number(item.dataset.hydrationLevel) <= level));
}

function createCard() {
  const card = document.createElement("section");
  card.className = "mindmate-hydration-card";
  card.innerHTML = `<div class="mindmate-hydration-head"><div><h3 class="mindmate-hydration-title">Hydration Check 💧</h3><p class="mindmate-hydration-sub">Keep a simple record of today's intake.</p></div><div><div class="mindmate-hydration-total" data-hydration-total>0 ml</div><button class="mindmate-hydration-reset" type="button">Reset today</button></div></div><div class="mindmate-hydration-buttons"><button class="mindmate-hydration-add" type="button" data-add="250">+250 ml</button><button class="mindmate-hydration-add" type="button" data-add="500">+500 ml</button><button class="mindmate-hydration-add" type="button" data-add="1000">+1 L</button></div><div class="mindmate-hydration-milestones"><div class="mindmate-hydration-milestone" data-hydration-level="1"><div class="mindmate-hydration-emoji">💧</div><span class="mindmate-hydration-milestone-label">1L</span></div><div class="mindmate-hydration-milestone" data-hydration-level="2"><div class="mindmate-hydration-emoji">🥛</div><span class="mindmate-hydration-milestone-label">2L</span></div><div class="mindmate-hydration-milestone" data-hydration-level="3"><div class="mindmate-hydration-emoji">🫗</div><span class="mindmate-hydration-milestone-label">3L</span></div><div class="mindmate-hydration-milestone" data-hydration-level="4"><div class="mindmate-hydration-emoji">🫙</div><span class="mindmate-hydration-milestone-label">4L</span></div></div><button class="mindmate-hydration-calendar" type="button">📅 View hydration calendar</button>`;

  card.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      localStorage.setItem(WATER_KEY(uid, todayKey()), String(waterAmount() + Number(button.dataset.add)));
      updateCard(card);
    });
  });
  card.querySelector(".mindmate-hydration-reset").addEventListener("click", () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    localStorage.setItem(WATER_KEY(uid, todayKey()), "0");
    updateCard(card);
  });
  card.querySelector(".mindmate-hydration-calendar").addEventListener("click", openCalendar);
  updateCard(card);
  return card;
}

function mountHydrationCard() {
  const featureRow = document.querySelector(".mindmate-feature-row");
  const oldInsights = featureRow?.querySelector(".insights-card");
  if (!featureRow || !oldInsights) return;
  if (featureRow.querySelector(".mindmate-hydration-card")) return;

  oldInsights.remove();
  featureRow.appendChild(createCard());
}

function start() {
  addStyles();
  const observer = new MutationObserver(() => mountHydrationCard());
  observer.observe(document.body, { childList: true, subtree: true });
  mountHydrationCard();
  onAuthStateChanged(auth, () => mountHydrationCard());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
