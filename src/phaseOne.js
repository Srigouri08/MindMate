import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "./firebase";

const API = "https://mindmate-kuqp.onrender.com";
const MOODS = {
  great: { emoji: "😄", label: "Great" },
  good: { emoji: "😌", label: "Good" },
  okay: { emoji: "😐", label: "Okay" },
  low: { emoji: "😔", label: "Low" },
  rough: { emoji: "😣", label: "Rough" },
};

const prompts = [
  "What made you smile today?",
  "What is something you are proud of yourself for?",
  "What has been on your mind lately?",
  "What is one small thing you want to do for yourself tomorrow?",
  "Describe a moment today that you want to remember.",
  "If today had a title, what would you call it?",
  "What are you grateful for right now?",
  "What would you tell yourself if you were your own best friend?",
];

let entries = [];
let activePanel = null;
let promptIndex = 0;

const style = document.createElement("style");
style.textContent = `
  .mm-feature-modal{position:fixed;inset:0;z-index:12000;background:rgba(35,24,60,.28);backdrop-filter:blur(5px);display:grid;place-items:center;padding:22px}
  .mm-feature-card{width:min(760px,100%);max-height:86vh;overflow:auto;background:#fff;border:1px solid #ddd1f3;border-radius:24px;box-shadow:0 24px 70px rgba(45,30,85,.25);padding:26px;color:#403361;font-family:Arial,sans-serif}
  .mm-feature-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:20px}.mm-feature-head h2{margin:0 0 6px;font-size:25px;color:#38266f}.mm-feature-head p{margin:0;color:#857999;font-size:13px;line-height:1.5}.mm-feature-close{width:36px;height:36px;border:1px solid #ddd2ef;border-radius:10px;background:#f8f5ff;color:#65557e;font-size:23px;flex:0 0 auto}
  .mm-feature-input{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid #d9cfee;border-radius:12px;outline:0;background:#fcfbff;color:#433663}.mm-feature-input:focus{border-color:#9476d2;box-shadow:0 0 0 3px #eee7ff}
  .mm-feature-primary{border:0;border-radius:12px;padding:12px 17px;background:#7653d7;color:#fff;font-weight:700;cursor:pointer}.mm-feature-primary:hover{background:#6845c7}.mm-feature-secondary{border:1px solid #d9cfee;border-radius:12px;padding:11px 15px;background:#f3edff;color:#57417f;font-weight:700;cursor:pointer}
  .mm-feature-answer{margin-top:16px;padding:17px;border:1px solid #e2d9f1;border-radius:16px;background:#faf8ff;line-height:1.65;color:#594c70;white-space:pre-wrap}.mm-feature-empty{padding:25px;border:1px dashed #d4c7e8;border-radius:16px;text-align:center;color:#8a7e9c;background:#fcfaff}
  .mm-mood-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin:16px 0}.mm-day{min-height:74px;border:1px solid #e2d9f1;border-radius:12px;padding:7px;background:#fff}.mm-day-num{font-size:11px;color:#9185a0}.mm-day-mood{font-size:24px;margin-top:8px}.mm-day-count{font-size:9px;color:#9589a4;margin-top:2px}.mm-calendar-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.mm-calendar-head strong{font-size:17px}.mm-calendar-head button{width:34px;height:34px;border:1px solid #ddd2ef;border-radius:9px;background:#f5f0ff;color:#5b4780}
  .mm-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px}.mm-stat{padding:17px;border:1px solid #e1d7f0;border-radius:16px;background:#faf8ff}.mm-stat strong{display:block;font-size:24px;color:#6045a0}.mm-stat span{font-size:11px;color:#877a98}.mm-bar-row{display:grid;grid-template-columns:95px 1fr 35px;align-items:center;gap:9px;margin:10px 0;font-size:12px}.mm-bar{height:9px;border-radius:99px;background:#eee7f8;overflow:hidden}.mm-bar i{display:block;height:100%;background:#8b6bd0;border-radius:99px}
  .mm-result{padding:15px;border:1px solid #e2d9f1;border-radius:15px;background:#fff;margin-top:10px;cursor:pointer}.mm-result strong{display:block;color:#49376f}.mm-result span{display:block;margin-top:5px;color:#817593;font-size:12px;line-height:1.45}.mm-prompt-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:11px}.mm-prompt{min-height:105px;text-align:left;border:1px solid #e0d5f0;border-radius:16px;background:#faf8ff;padding:16px;color:#59467d;font-weight:600;cursor:pointer;line-height:1.45}.mm-prompt:hover{background:#f1eaff;border-color:#b49bdd;transform:translateY(-1px)}
  .mm-prompt-hint{margin-top:14px;padding:12px 14px;border-radius:12px;background:#f4efff;color:#76658f;font-size:12px;line-height:1.5}
  [data-mm-theme="dark"] .mm-feature-modal{background:rgba(8,6,18,.58)}
  [data-mm-theme="dark"] .mm-feature-card{background:#2d273d;border-color:#514667;color:#eee8ff;box-shadow:0 24px 70px rgba(0,0,0,.45)}
  [data-mm-theme="dark"] .mm-feature-head h2{color:#f1eaff}[data-mm-theme="dark"] .mm-feature-head p,[data-mm-theme="dark"] .mm-feature-empty,[data-mm-theme="dark"] .mm-result span{color:#b9aecb}
  [data-mm-theme="dark"] .mm-feature-input{background:#252031;color:#eee8ff;border-color:#554a69}[data-mm-theme="dark"] .mm-feature-input:focus{border-color:#9a7fe0;box-shadow:0 0 0 3px #40365a}
  [data-mm-theme="dark"] .mm-feature-answer,[data-mm-theme="dark"] .mm-stat,[data-mm-theme="dark"] .mm-result,[data-mm-theme="dark"] .mm-day,[data-mm-theme="dark"] .mm-prompt{background:#352e47;border-color:#55496b;color:#eee8ff}
  [data-mm-theme="dark"] .mm-feature-secondary,[data-mm-theme="dark"] .mm-calendar-head button{background:#40365a;color:#eee8ff;border-color:#5b4e72}[data-mm-theme="dark"] .mm-day-num,[data-mm-theme="dark"] .mm-day-count{color:#b7acc9}[data-mm-theme="dark"] .mm-bar{background:#4b4260}
  [data-mm-theme="dark"] .mm-prompt-hint{background:#40365a;color:#c4b8d7}[data-mm-theme="dark"] .mm-feature-close{background:#352e47;color:#ddd2ed;border-color:#5b4e72}
  @media(max-width:650px){.mm-feature-card{padding:19px}.mm-mood-grid{grid-template-columns:repeat(4,1fr)}.mm-stat-grid{grid-template-columns:1fr}.mm-prompt-grid{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

function esc(value) {
  return String(value ?? "").replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
}

function dateOf(value) {
  if (!value) return new Date(0);
  return value.toDate ? value.toDate() : new Date(value);
}

function dateLabel(value) {
  return dateOf(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function syncTheme() {
  const app = document.querySelector(".app");
  document.body.dataset.mmTheme = app?.classList.contains("dark-mode") ? "dark" : "light";
}

function closePanel() {
  document.querySelector(".mm-feature-modal")?.remove();
  activePanel = null;
}

function modal(title, subtitle, body) {
  closePanel();
  const overlay = document.createElement("div");
  overlay.className = "mm-feature-modal";
  overlay.innerHTML = `<section class="mm-feature-card"><div class="mm-feature-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="mm-feature-close" aria-label="Close">×</button></div><div class="mm-feature-body">${body}</div></section>`;
  overlay.querySelector(".mm-feature-close").onclick = closePanel;
  overlay.onclick = (event) => { if (event.target === overlay) closePanel(); };
  document.body.appendChild(overlay);
  syncTheme();
  activePanel = overlay;
  return overlay.querySelector(".mm-feature-body");
}

async function refreshEntries() {
  if (!auth.currentUser) { entries = []; return; }
  const q = query(collection(db, "journalEntries"), where("userId", "==", auth.currentUser.uid));
  const snap = await getDocs(q);
  entries = snap.docs.map((item) => ({ id: item.id, ...item.data() }));
  entries.sort((a, b) => dateOf(b.createdAt) - dateOf(a.createdAt));
}

function askMindMate() {
  const body = modal("🧠 Ask MindMate", "Ask a question about patterns, feelings, or moments in your journal.", `<input class="mm-feature-input" id="mm-ask-input" placeholder="What has been making me happiest lately?"><div style="margin-top:11px"><button class="mm-feature-primary" id="mm-ask-btn">Ask MindMate</button></div><div id="mm-ask-answer"></div>`);
  body.querySelector("#mm-ask-btn").onclick = async () => {
    const question = body.querySelector("#mm-ask-input").value.trim();
    const answer = body.querySelector("#mm-ask-answer");
    if (!question) return;
    answer.innerHTML = `<div class="mm-feature-answer">🤖 MindMate is thinking...</div>`;
    try {
      const response = await fetch(`${API}/ask`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, entries: entries.slice(0, 25) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      answer.innerHTML = `<div class="mm-feature-answer">${esc(data.answer)}</div>`;
    } catch {
      answer.innerHTML = `<div class="mm-feature-answer">MindMate could not answer right now. Please try again in a little while.</div>`;
    }
  };
}

let calendarDate = new Date();
function moodCalendar() {
  const body = modal("📊 Mood Calendar", "See your journal moods across the month at a glance.", `<div class="mm-calendar-head"><button id="mm-prev">‹</button><strong id="mm-month"></strong><button id="mm-next">›</button></div><div class="mm-mood-grid" id="mm-calendar"></div><p style="color:#887b99;font-size:12px">Each day shows your saved mood and the number of journal entries for that day.</p>`);
  const draw = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    body.querySelector("#mm-month").textContent = calendarDate.toLocaleString("en-IN", { month: "long", year: "numeric" });
    const days = new Date(year, month + 1, 0).getDate();
    const start = new Date(year, month, 1).getDay();
    const cells = [];
    for (let i = 0; i < start; i++) cells.push(`<div></div>`);
    for (let day = 1; day <= days; day++) {
      const sameDay = entries.filter((item) => { const d = dateOf(item.createdAt); return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day; });
      const moodKey = sameDay.map((item) => item.mood).find(Boolean);
      cells.push(`<div class="mm-day"><div class="mm-day-num">${day}</div><div class="mm-day-mood">${MOODS[moodKey]?.emoji || "·"}</div><div class="mm-day-count">${sameDay.length ? `${sameDay.length} ${sameDay.length === 1 ? "entry" : "entries"}` : ""}</div></div>`);
    }
    body.querySelector("#mm-calendar").innerHTML = cells.join("");
  };
  body.querySelector("#mm-prev").onclick = () => { calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1); draw(); };
  body.querySelector("#mm-next").onclick = () => { calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1); draw(); };
  draw();
}

function growth() {
  const sorted = [...entries].sort((a, b) => dateOf(b.createdAt) - dateOf(a.createdAt));
  const moodCounts = sorted.reduce((acc, item) => { if (item.mood) acc[item.mood] = (acc[item.mood] || 0) + 1; return acc; }, {});
  const commonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const monthCounts = sorted.reduce((acc, item) => { const d = dateOf(item.createdAt); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
  const months = Object.entries(monthCounts).sort().slice(-6);
  const max = Math.max(1, ...months.map(([, count]) => count));
  let streak = 0;
  const uniqueDays = [...new Set(sorted.map((item) => dateOf(item.createdAt).toDateString()))];
  let cursor = new Date();
  while (uniqueDays.includes(cursor.toDateString())) { streak++; cursor.setDate(cursor.getDate() - 1); }
  modal("🌱 Your Growth", "A simple look at how consistently you have been showing up for yourself.", `<div class="mm-stat-grid"><div class="mm-stat"><strong>${sorted.length}</strong><span>Total entries</span></div><div class="mm-stat"><strong>${streak}</strong><span>Day streak</span></div><div class="mm-stat"><strong>${commonMood ? MOODS[commonMood[0]]?.emoji || "💜" : "—"}</strong><span>Most common mood</span></div></div><h3 style="margin:5px 0 12px">Entries over time</h3><div>${months.length ? months.map(([key, count]) => { const [y, m] = key.split("-"); const label = new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-IN", { month: "short" }); return `<div class="mm-bar-row"><span>${label} ${y}</span><div class="mm-bar"><i style="width:${Math.round(count / max * 100)}%"></i></div><b>${count}</b></div>`; }).join("") : `<div class="mm-feature-empty">Save a few journal entries and your growth view will appear here.</div>`}</div>`);
}

function memorySearch() {
  const body = modal("🔍 Memory Search", "Find old journal moments without scrolling through every entry.", `<input class="mm-feature-input" id="mm-memory-input" placeholder="Search words like exam, friends, birthday..."><div id="mm-memory-results" style="margin-top:14px"></div>`);
  const run = () => {
    const term = body.querySelector("#mm-memory-input").value.trim().toLowerCase();
    const results = term ? entries.filter((item) => String(item.text || "").toLowerCase().includes(term)) : entries;
    body.querySelector("#mm-memory-results").innerHTML = results.length ? results.slice(0, 12).map((item) => `<div class="mm-result" data-id="${esc(item.id)}"><strong>${dateLabel(item.createdAt)}</strong><span>${esc(String(item.text || "").slice(0, 180))}${String(item.text || "").length > 180 ? "…" : ""}</span></div>`).join("") : `<div class="mm-feature-empty">No matching memories yet.</div>`;
    body.querySelectorAll(".mm-result").forEach((result) => result.onclick = () => openEntry(result.dataset.id));
  };
  body.querySelector("#mm-memory-input").oninput = run;
  run();
}

function openEntry(id) {
  closePanel();
  const item = entries.find((entry) => String(entry.id) === String(id));
  if (!item) return;
  const buttons = [...document.querySelectorAll("button")];
  const journalButton = buttons.find((button) => button.textContent.includes("My Journal"));
  journalButton?.click();
  setTimeout(() => {
    const viewButton = [...document.querySelectorAll("button")].find((button) => button.textContent.includes("View Entry") && button.closest(".date-entry")?.textContent.includes(dateLabel(item.createdAt)));
    viewButton?.click();
  }, 150);
}

function writingPrompts() {
  const body = modal("📝 Writing Prompts", "A little nudge for the days when the words do not come easily.", `<div class="mm-prompt-grid">${prompts.map((prompt, index) => `<button class="mm-prompt" data-prompt="${esc(prompt)}">${index + 1}. ${esc(prompt)}</button>`).join("")}</div><div class="mm-prompt-hint">Tip: you can also leave a prompt as the soft watermark on your journal page. It disappears as soon as you start typing.</div>`);
  body.querySelectorAll(".mm-prompt").forEach((button) => button.onclick = () => { setJournalPrompt(button.dataset.prompt); closePanel(); });
}

function setJournalPrompt(prompt) {
  const textarea = document.querySelector(".book-page textarea");
  if (!textarea) return;
  textarea.placeholder = prompt;
  textarea.focus();
}

function updatePromptWatermark() {
  const textarea = document.querySelector(".book-page textarea");
  if (!textarea || textarea.value.trim()) return;
  if (!textarea.dataset.mmPrompt) {
    textarea.dataset.mmPrompt = "true";
    textarea.placeholder = prompts[promptIndex % prompts.length];
  }
}

function cyclePrompt() {
  promptIndex = (promptIndex + 1) % prompts.length;
  setJournalPrompt(prompts[promptIndex]);
}

function addNavItem(label, icon, onClick) {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar || [...sidebar.querySelectorAll(".mm-phase-item")].some((item) => item.dataset.label === label)) return;
  const button = document.createElement("button");
  button.className = "side-item mm-phase-item";
  button.dataset.label = label;
  button.innerHTML = `<span>${icon}</span> ${label}`;
  button.onclick = async (event) => { event.stopPropagation(); await refreshEntries(); onClick(); };
  const bottom = sidebar.querySelector(".sidebar-bottom");
  sidebar.insertBefore(button, bottom || null);
}

function wire() {
  syncTheme();
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;
  addNavItem("Ask MindMate", "🧠", askMindMate);
  addNavItem("Mood Calendar", "📊", moodCalendar);
  addNavItem("Your Growth", "🌱", growth);
  addNavItem("Memory Search", "🔍", memorySearch);
  addNavItem("Writing Prompts", "📝", writingPrompts);
  updatePromptWatermark();
}

let started = false;
function start() {
  if (started) return;
  started = true;
  wire();
  const observer = new MutationObserver(() => requestAnimationFrame(wire));
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "value"] });
  setInterval(wire, 900);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();
