import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "./firebase";

const MOODS = {
  great: "😄",
  good: "😌",
  okay: "😐",
  low: "😔",
  rough: "😣",
};

function dateOf(value) {
  if (!value) return new Date(0);
  return value.toDate ? value.toDate() : new Date(value);
}

function addStyles() {
  if (document.getElementById("mindmate-sidebar-features-style")) return;
  const style = document.createElement("style");
  style.id = "mindmate-sidebar-features-style";
  style.textContent = `
    .mm-sidebar-feature-item{font:inherit!important}
    .mm-mood-calendar-modal{position:fixed;inset:0;z-index:12010;display:grid;place-items:center;padding:22px;background:rgba(35,24,60,.28);backdrop-filter:blur(5px)}
    .mm-mood-calendar-card{width:min(820px,100%);max-height:88vh;overflow:auto;padding:25px;border:1px solid #ddd1f3;border-radius:24px;background:#fff;color:#403361;box-shadow:0 24px 70px rgba(45,30,85,.25);font-family:Arial,sans-serif}
    .mm-mood-calendar-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px}
    .mm-mood-calendar-head h2{margin:0 0 5px;color:#38266f;font-size:25px}
    .mm-mood-calendar-head p{margin:0;color:#857999;font-size:13px}
    .mm-mood-close,.mm-mood-nav button{border:1px solid #ddd2ef;border-radius:9px;background:#f5f0ff;color:#5b4780;cursor:pointer}
    .mm-mood-close{width:36px;height:36px;font-size:23px}
    .mm-mood-nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
    .mm-mood-nav button{width:35px;height:35px;font-size:21px}
    .mm-mood-nav strong{font-size:17px;color:#49376f}
    .mm-mood-week,.mm-mood-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px}
    .mm-mood-week{margin-bottom:6px}.mm-mood-week div{text-align:center;font-size:10px;color:#978aa5;font-weight:700}
    .mm-mood-day{min-height:82px;padding:7px;border:1px solid #e2d9f1;border-radius:12px;background:#fff}
    .mm-mood-day.today{border-color:#8b6bd0;box-shadow:0 0 0 2px #eee7ff}
    .mm-mood-day-num{font-size:11px;color:#9185a0}.mm-mood-day-icon{margin-top:8px;font-size:24px}.mm-mood-day-count{margin-top:4px;font-size:10px;color:#8b7e9c}
    .mm-mood-legend{margin-top:13px;padding:11px 13px;border-radius:12px;background:#f6f1ff;color:#77698c;font-size:11px;line-height:1.6}
    .app.dark-mode .mm-mood-calendar-modal{background:rgba(8,6,18,.58)}
    .app.dark-mode .mm-mood-calendar-card{background:#2d273d;border-color:#514667;color:#eee8ff}
    .app.dark-mode .mm-mood-calendar-head h2,.app.dark-mode .mm-mood-nav strong{color:#f1eaff}
    .app.dark-mode .mm-mood-calendar-head p{color:#b9aecb}
    .app.dark-mode .mm-mood-close,.app.dark-mode .mm-mood-nav button{background:#40365a;color:#eee8ff;border-color:#5b4e72}
    .app.dark-mode .mm-mood-day{background:#352e47;border-color:#55496b}
    .app.dark-mode .mm-mood-day-num,.app.dark-mode .mm-mood-day-count{color:#b7acc9}
    .app.dark-mode .mm-mood-legend{background:#40365a;color:#c4b8d7}
    @media(max-width:650px){.mm-mood-calendar-card{padding:18px}.mm-mood-grid,.mm-mood-week{gap:4px}.mm-mood-day{min-height:70px;padding:5px}}
  `;
  document.head.appendChild(style);
}

function closeMoodCalendar() {
  document.querySelector(".mm-mood-calendar-modal")?.remove();
}

async function openMoodCalendar() {
  closeMoodCalendar();
  const overlay = document.createElement("div");
  overlay.className = "mm-mood-calendar-modal";
  overlay.innerHTML = `<section class="mm-mood-calendar-card"><div class="mm-mood-calendar-head"><div><h2>📊 Mood Calendar</h2><p>See your saved journal moods across the month.</p></div><button class="mm-mood-close" type="button">×</button></div><div class="mm-mood-nav"><button data-prev type="button">‹</button><strong data-month>Loading...</strong><button data-next type="button">›</button></div><div class="mm-mood-week"><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div><div class="mm-mood-grid" data-grid></div><div class="mm-mood-legend">😄 Great &nbsp; 😌 Good &nbsp; 😐 Okay &nbsp; 😔 Low &nbsp; 😣 Rough<br>Each day shows the first saved mood and the number of journal entries for that day.</div></section>`;
  document.body.appendChild(overlay);
  overlay.querySelector(".mm-mood-close").onclick = closeMoodCalendar;
  overlay.onclick = (event) => { if (event.target === overlay) closeMoodCalendar(); };

  let entries = [];
  if (auth.currentUser) {
    try {
      const q = query(collection(db, "journalEntries"), where("userId", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      entries = snap.docs.map((item) => item.data());
    } catch (error) {
      console.error("Could not load mood calendar entries", error);
    }
  }

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
      const sameDay = entries.filter((item) => {
        const date = dateOf(item.createdAt);
        return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
      });
      const mood = sameDay.map((item) => item.mood).find(Boolean);
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      cells.push(`<div class="mm-mood-day ${isToday ? "today" : ""}"><div class="mm-mood-day-num">${day}</div><div class="mm-mood-day-icon">${MOODS[mood] || "·"}</div><div class="mm-mood-day-count">${sameDay.length ? `${sameDay.length} ${sameDay.length === 1 ? "entry" : "entries"}` : ""}</div></div>`);
    }
    overlay.querySelector("[data-grid]").innerHTML = cells.join("");
  };

  overlay.querySelector("[data-prev]").onclick = () => { monthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1); draw(); };
  overlay.querySelector("[data-next]").onclick = () => { monthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1); draw(); };
  draw();
}

function clickLittleMomentsToolbar() {
  const button = document.querySelector('.mm-toolbar .mm-tool[title="Little Moments"]');
  if (button) button.click();
}

function addSideButton(sidebar, label, icon, onClick) {
  const existing = [...sidebar.querySelectorAll(".side-item")].find((item) => item.dataset.mmSidebarLabel === label || item.textContent.includes(label));
  if (existing) {
    existing.dataset.mmSidebarFeature = "1";
    return existing;
  }
  const button = document.createElement("button");
  button.type = "button";
  button.className = "side-item mm-sidebar-feature-item";
  button.dataset.mmSidebarLabel = label;
  button.innerHTML = `<span>${icon}</span> ${label}`;
  button.addEventListener("click", (event) => { event.preventDefault(); onClick(); });
  const bottom = sidebar.querySelector(".sidebar-bottom");
  if (bottom) sidebar.insertBefore(button, bottom);
  else sidebar.appendChild(button);
  return button;
}

function wireSidebar() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;
  addStyles();

  const littleMoments = [...sidebar.querySelectorAll(".side-item")].find((item) => item.textContent.includes("Little Moments"));
  if (littleMoments) littleMoments.dataset.mmLittleMoments = "1";

  addSideButton(sidebar, "Hydration Calendar", "💧", () => window.mindmateOpenHydrationCalendar?.());
  addSideButton(sidebar, "Mood Calendar", "📊", openMoodCalendar);

  const toolbarButton = document.querySelector('.mm-toolbar .mm-tool[title="Little Moments"]');
  if (toolbarButton) toolbarButton.style.display = "none";
}

function interceptLittleMoments(event) {
  const item = event.target.closest?.('.sidebar .side-item');
  if (!item || !item.textContent.includes("Little Moments")) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  clickLittleMomentsToolbar();
}

function start() {
  addStyles();
  document.addEventListener("click", interceptLittleMoments, true);
  const observer = new MutationObserver(() => requestAnimationFrame(wireSidebar));
  observer.observe(document.body, { childList: true, subtree: true });
  wireSidebar();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();
