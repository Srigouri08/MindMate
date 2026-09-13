import { onAuthStateChanged } from "firebase/auth";
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

let currentUser = null;
let entries = [];
let activePanel = null;

const style = document.createElement("style");
style.textContent = `
  .mm-feature-modal{position:fixed;inset:0;z-index:12000;background:rgba(35,24,60,.28);backdrop-filter:blur(5px);display:grid;place-items:center;padding:22px}
  .mm-feature-card{width:min(760px,100%);max-height:86vh;overflow:auto;background:#fff;border:1px solid #ddd1f3;border-radius:24px;box-shadow:0 24px 70px rgba(45,30,85,.25);padding:26px;color:#403361;font-family:Arial,sans-serif}
  .mm-feature-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:20px}.mm-feature-head h2{margin:0 0 5px;font-size:25px;color:#38266f}.mm-feature-head p{margin:0;color:#857999;font-size:13px}.mm-feature-close{width:36px;height:36px;border:1px solid #ddd2ef;border-radius:10px;background:#f8f5ff;color:#65557e;font-size:23px}
  .mm-feature-input{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid #d9cfee;border-radius:12px;outline:0;background:#fcfbff;color:#433663}.mm-feature-input:focus{border-color:#9476d2;box-shadow:0 0 0 3px #eee7ff}
  .mm-feature-primary{border:0;border-radius:12px;padding:12px 17px;background:#7653d7;color:#fff;font-weight:700;cursor:pointer}.mm-feature-primary:hover{background:#6845c7}.mm-feature-secondary{border:1px solid #d9cfee;border-radius:12px;padding:11px 15px;background:#f3edff;color:#57417f;font-weight:700;cursor:pointer}
  .mm-feature-answer{margin-top:16px;padding:17px;border:1px solid #e2d9f1;border-radius:16px;background:#faf8ff;line-height:1.65;color:#594c70;white-space:pre-wrap}.mm-feature-empty{padding:25px;border:1px dashed #d4c7e8;border-radius:16px;text-align:center;color:#8a7e9c;background:#fcfaff}
  .mm-mood-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin:16px 0}.mm-day{min-height:74px;border:1px solid #e2d9f1;border-radius:12px;padding:7px;background:#fff}.mm-day-num{font-size:11px;color:#9185a0}.mm-day-mood{font-size:24px;margin-top:8px}.mm-day-count{font-size:9px;color:#9589a4;margin-top:2px}.mm-calendar-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.mm-calendar-head strong{font-size:17px}.mm-calendar-head button{width:34px;height:34px;border:1px solid #ddd2ef;border-radius:9px;background:#f5f0ff;color:#5b4780}
  .mm-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px}.mm-stat{padding:17px;border:1px solid #e1d7f0;border-radius:16px;background:#faf8ff}.mm-stat strong{display:block;font-size:24px;color:#6045a0}.mm-stat span{font-size:11px;color:#877a98}.mm-bar-row{display:grid;grid-template-columns:95px 1fr 35px;align-items:center;gap:9px;margin:10px 0;font-size:12px}.mm-bar{height:9px;border-radius:99px;background:#eee7f8;overflow:hidden}.mm-bar i{display:block;height:100%;background:#8b6bd0;border-radius:99px}
  .mm-result{padding:15px;border:1px solid #e2d9f1;border-radius:15px;background:#fff;margin-top:10px;cursor:pointer}.mm-result strong{display:block;color:#49376f}.mm-result span{display:block;margin-top:5px;color:#817593;font-size:12px;line-height:1.45}.mm-prompt-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:11px}.mm-prompt{min-height:105px;text-align:left;border:1px solid #e0d5f0;border-radius:16px;background:#faf8ff;padding:16px;color:#59467d;font-weight:600;cursor:pointer}.mm-prompt:hover{background:#f1eaff;border-color:#b49bdd;transform:translateY(-1px)}
  .dark-mode .mm-feature-card{background:#2d273d;border-color:#514667;color:#eee8ff}.dark-mode .mm-feature-head h2{color:#eee8ff}.dark-mode .mm-feature-head p,.dark-mode .mm-feature-empty,.dark-mode .mm-result span{color:#b9aecb}.dark-mode .mm-feature-input{background:#252031;color:#eee8ff;border-color:#554a69}.dark-mode .mm-feature-answer,.dark-mode .mm-stat,.dark-mode .mm-result,.dark-mode .mm-day,.dark-mode .mm-prompt{background:#352e47;border-color:#55496b;color:#eee8ff}.dark-mode .mm-feature-secondary,.dark-mode .mm-calendar-head button{background:#40365a;color:#eee8ff;border-color:#5b4e72}.dark-mode .mm-day-num,.dark-mode .mm-day-count{color:#b7acc9}.dark-mode .mm-bar{background:#4b4260}
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

function closePanel() {
  document.querySelector(".mm-feature-modal")?.remove();
  activePanel = null;
}

function modal(title, subtitle, body) {
  closePanel();
  const overlay = document.createElement("div");
  overlay.className = "mm-feature-modal";
  overlay.innerHTML = `<section class="mm-feature-card"><div class="mm-feature-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="mm-feature-close">×</button></div><div class="mm-feature-body">${body}</div></section>`;
  overlay.querySelector(".mm-feature-close").onclick = closePanel;
  overlay.onclick = (event) => { if (event.target === overlay) closePanel(); };
  document.body.appendChild(overlay);
  return overlay.querySelector(".mm-feature-body");
}

function recentEntries() {
  return [...entries].sort((a, b) => dateOf(b.createdAt) - dateOf(a.createdAt));
}

async function refreshEntries() {
  if (!currentUser) { entries = []; return; }
  const q = query(collection(db, "journalEntries"), where("userId", "==", currentUser.uid));
  const snap = await getDocs(q);
  entries = snap.docs.map((item) => ({ id: item.id, ...item.data() }));
  entries.sort((a, b) => dateOf(b.createdAt) - dateOf(a.createdAt));
}

function askMindMate() {
  const body = modal("🧠 Ask MindMate", "Ask a question about patterns, feelings, or moments in your journal.", `<input class="mm-feature-input" id="mm-ask-input" placeholder="e.g. What has been making me happiest lately?"><div style="margin-top:11px"><button class="mm-feature-primary" id="mm-ask-btn">Ask MindMate</button></div><div id="mm-ask-answer"></div>`);
  body.querySelector("#mm-ask-btn").onclick = async () => {
    const question = body.querySelector("#mm-ask-input").value.trim();
    const answer = body.querySelector("#mm-ask-answer");
    if (!question) return;
    answer.innerHTML = `<div class="mm-feature-answer">🤖 MindMate is thinking...</div>`;
    try {
      const response = await fetch(`${API}/ask`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, entries: recentEntries().slice(0, 25) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      answer.innerHTML = `<div class="mm-feature-answer">${esc(data.answer)}</div>`;
    } catch (error) {
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
      const moods = sameDay.map((item) => item.mood).filter(Boolean);
      const moodKey = moods[0];
      cells.push(`<div class="mm-day"><div class="mm-day-num">${day}</div><div class="mm-day-mood">${MOODS[moodKey]?.emoji || "·"}</div><div class="mm-day-count">${sameDay.length ? `${sameDay.length} ${sameDay.length === 1 ? "entry" : "entries"}` : ""}</div></div>`);
    }
    body.querySelector("#mm-calendar").innerHTML = cells.join("");
  };
  body.querySelector("#mm-prev").onclick = () => { calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1); draw(); };
  body.querySelector("#mm-next").onclick = () => { calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1); draw(); };
  draw();
}

function growth() {
  const sorted = recentEntries();
  const moodCounts = sorted.reduce((acc, item) => { if (item.mood) acc[item.mood] = (acc[item.mood] || 0) + 1; return acc; }, {});
  const commonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const monthCounts = sorted.reduce((acc, item) => { const d = dateOf(item.createdAt); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
  const months = Object.entries(monthCounts).sort().slice(-6);
  const max = Math.max(1, ...months.map(([, count]) => count));
  let streak = 0;
  const uniqueDays = [...new Set(sorted.map((item) => dateOf(item.createdAt).toDateString()))];
  let cursor = new Date();
  while (uniqueDays.includes(cursor.toDateString())) { streak++; cursor.setDate(cursor.getDate() - 1); }
  const body = modal("🌱 Your Growth", "A simple look at how consistently you have been showing up for yourself.", `<div class="mm-stat-grid"><div class="mm-stat"><strong>${sorted.length}</strong><span>Total entries</span></div><div class="mm-stat"><strong>${streak}</strong><span>Day streak</span></div><div class="mm-stat"><strong>${commonMood ? MOODS[commonMood[0]]?.emoji || "💜" : "—"}</strong><span>Most common mood</span></div></div><h3 style="margin:5px 0 12px">Entries over time</h3><div>${months.length ? months.map(([key, count]) => { const [y, m] = key.split("-"); const label = new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-IN", { month: "short" }); return `<div class="mm-bar-row"><span>${label} ${y}</span><div class="mm-bar"><i style="width:${Math.round(count / max * 100)}%"></i></div><b>${count}</b></div>`; }).join("") : `<div class="mm-feature-empty">Save a few journal entries and your growth view will appear here.</div>`}</div>`);
}

function weeklyReflection() {
  const recent = recentEntries().slice(0, 7);
  const body = modal("💭 Weekly Reflection", "Turn your recent entries into one calm, useful reflection.", `<button class="mm-feature-primary" id="mm-reflect">Create My Reflection</button><div id="mm-reflection"></div>`);
  body.querySelector("#mm-reflect").onclick = async () => {
    const target = body.querySelector("#mm-reflection");
    if (!recent.length) { target.innerHTML = `<div class="mm-feature-empty">Write at least one journal entry first.</div>`; return; }
    target.innerHTML = `<div class="mm-feature-answer">🤖 Looking across your week...</div>`;
    try {
      const response = await fetch(`${API}/ask`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: "Give me a warm weekly reflection based only on these journal entries. Mention recurring themes, positive moments, something I handled well, and one gentle focus for next week. Keep it concise and do not diagnose me.", entries: recent }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      target.innerHTML = `<div class="mm-feature-answer">${esc(data.answer)}</div>`;
    } catch { target.innerHTML = `<div class="mm-feature-answer">The reflection could not be created right now. Please try again later.</div>`; }
  };
}

function memorySearch() {
  const body = modal("🔍 Memory Search", "Find old journal moments without scrolling through every entry.", `<input class="mm-feature-input" id="mm-memory-input" placeholder="Search words like exam, friends, birthday..." autofocus><div id="mm-memory-results" style="margin-top:14px"></div>`);
  const run = () => {
    const term = body.querySelector("#mm-memory-input").value.trim().toLowerCase();
    const results = term ? recentEntries().filter((item) => String(item.text || "").toLowerCase().includes(term)) : recentEntries();
    body.querySelector("#mm-memory-results").innerHTML = results.length ? results.slice(0, 20).map((item) => `<div class="mm-result" data-id="${esc(item.id)}"><strong>${dateLabel(item.createdAt)} ${item.mood ? `• ${MOODS[item.mood]?.emoji || ""}` : ""}</strong><span>${esc(String(item.text || "").slice(0, 180))}${String(item.text || "").length > 180 ? "…" : ""}</span></div>`).join("") : `<div class="mm-feature-empty">No matching memories found.</div>`;
  };
  body.querySelector("#mm-memory-input").oninput = run;
  run();
}

function writingPrompts() {
  const prompts = [
    "What made you smile recently, even for a moment?",
    "What is something you handled better than you expected?",
    "If today had a color, what would it be and why?",
    "What are you looking forward to right now?",
    "Write a note to yourself for a difficult day.",
    "What is one small thing you want to improve this week?",
    "Describe a place where you feel completely comfortable.",
    "What is a memory you never want to forget?",
    "What would you tell your past self from one year ago?",
    "What are three things you are grateful for today?",
  ];
  const body = modal("📝 Writing Prompts", "A little inspiration for days when the blank page feels too blank.", `<div class="mm-prompt-grid">${prompts.map((prompt, i) => `<button class="mm-prompt" data-prompt="${i}">${esc(prompt)}</button>`).join("")}</div><div id="mm-prompt-message" style="margin-top:15px;color:#796c8d;font-size:12px"></div>`);
  body.querySelectorAll(".mm-prompt").forEach((button) => button.onclick = () => {
    body.querySelector("#mm-prompt-message").textContent = `Prompt selected: ${prompts[Number(button.dataset.prompt)]}`;
  });
}

function addSidebarItem(label, icon, key, handler) {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar || sidebar.querySelector(`[data-mm-feature="${key}"]`)) return;
  const button = document.createElement("button");
  button.className = "side-item";
  button.dataset.mmFeature = key;
  button.innerHTML = `<span>${icon}</span> ${label}`;
  button.onclick = (event) => { event.stopPropagation(); document.querySelectorAll(".side-item").forEach((item) => item.classList.remove("mm-feature-active")); button.classList.add("mm-feature-active"); handler(); };
  const bottom = sidebar.querySelector(".sidebar-bottom");
  sidebar.insertBefore(button, bottom || null);
}

function setupSidebar() {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return false;
  document.querySelectorAll("[data-mm-old-insights],.mindmate-insights-button,.mindmate-insights-btn").forEach((item) => item.remove());
  addSidebarItem("Ask MindMate", "🧠", "ask", askMindMate);
  addSidebarItem("Mood Calendar", "📊", "calendar", moodCalendar);
  addSidebarItem("Your Growth", "🌱", "growth", growth);
  addSidebarItem("Weekly Reflection", "💭", "weekly", weeklyReflection);
  addSidebarItem("Memory Search", "🔍", "memory", memorySearch);
  addSidebarItem("Writing Prompts", "📝", "prompts", writingPrompts);
  return true;
}

function observeApp() {
  setupSidebar();
  const observer = new MutationObserver(() => setupSidebar());
  observer.observe(document.body, { childList: true, subtree: true });
}

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (!user) { entries = []; closePanel(); return; }
  try { await refreshEntries(); } catch (error) { console.error("MindMate feature data error:", error); }
});

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", observeApp, { once: true });
else observeApp();
