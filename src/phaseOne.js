import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "./firebase";

const API = "https://mindmate-kuqp.onrender.com";
const MOODS = { great:"😄", good:"😌", okay:"😐", low:"😔", rough:"😣" };
const LABELS = { great:"Great", good:"Good", okay:"Okay", low:"Low", rough:"Rough" };

const css = document.createElement("style");
css.textContent = `
.mm-insights-btn{width:100%;margin:8px 0;padding:14px 17px;border:0;border-radius:14px;background:#e6dcff;color:#443477;text-align:left;font-size:15px;font-weight:700;cursor:pointer}.mm-insights-btn:hover{background:#d9c9ff}
.mm-i-overlay{position:fixed;inset:0;z-index:10030;background:rgba(25,18,42,.62);display:grid;place-items:center;padding:20px}.mm-i-modal{width:min(900px,96vw);max-height:88vh;overflow:auto;padding:24px;border-radius:24px;background:#fffafc;box-shadow:0 25px 70px rgba(20,10,45,.4);color:#403267;font-family:Arial,sans-serif}.mm-i-head{display:flex;justify-content:space-between}.mm-i-head h2{margin:0 0 5px}.mm-i-head p{margin:0;color:#887b9d;font-size:13px}.mm-i-close{border:0;background:none;font-size:26px;color:#756986;cursor:pointer}.mm-i-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0 16px}.mm-i-tab{border:1px solid #ddd2f1;border-radius:12px;padding:9px 14px;background:#fff;color:#5c4787;font-weight:700;cursor:pointer}.mm-i-tab.active{background:#7655d3;color:#fff}.mm-i-card{padding:18px;border:1px solid #e0d6f0;border-radius:18px;background:#fff}.mm-i-card h3{margin-top:0}.mm-i-input{width:100%;box-sizing:border-box;min-height:90px;padding:13px;border:1px solid #d9cfee;border-radius:13px;resize:vertical;outline:none}.mm-i-primary{margin-top:10px;padding:11px 16px;border:0;border-radius:12px;background:#7655d3;color:#fff;font-weight:700;cursor:pointer}.mm-i-answer{margin-top:15px;padding:15px;border-radius:14px;background:#f3edff;color:#55476f;line-height:1.6;white-space:pre-wrap}.mm-i-suggest{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}.mm-i-suggest button{border:1px solid #ddd2f1;background:#faf8ff;color:#624d8c;border-radius:999px;padding:7px 10px;cursor:pointer;font-size:12px}
.mm-cal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.mm-cal-head button{border:0;background:#eee7ff;border-radius:9px;padding:7px 11px;color:#594582;font-weight:700;cursor:pointer}.mm-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}.mm-cal-name{text-align:center;font-size:11px;color:#9589a7;padding:4px}.mm-day{min-height:65px;border:1px solid #e5ddf0;border-radius:10px;padding:6px;background:#fff}.mm-day.empty{background:#faf8fc}.mm-day.today{border-color:#8c6bda;box-shadow:inset 0 0 0 1px #8c6bda}.mm-day-num{font-size:11px;color:#887b9d}.mm-day-mood{display:block;text-align:center;font-size:24px;margin-top:5px}.mm-day-count{font-size:9px;color:#8b7d9d;text-align:center}.mm-growth-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}.mm-stat{padding:15px;border-radius:15px;background:#f5f0ff}.mm-stat strong{display:block;font-size:23px;color:#5a4194}.mm-stat span{font-size:11px;color:#887b9d}.mm-bars{height:220px;display:flex;align-items:flex-end;gap:10px;padding:10px;border-bottom:1px solid #ddd4eb}.mm-bar-wrap{flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:5px}.mm-bar{width:min(42px,70%);min-height:6px;border-radius:9px 9px 2px 2px;background:linear-gradient(to top,#7655d3,#bba2ef)}.mm-bar-label{font-size:10px;color:#887b9d}.mm-note{margin-top:14px;padding:13px;border-radius:13px;background:#fff5e8;color:#735c43;font-size:13px;line-height:1.5}.dark-mode .mm-i-modal{background:#241f32;color:#eee7ff}.dark-mode .mm-i-card,.dark-mode .mm-day{background:#2d273c;border-color:#4b4262}.dark-mode .mm-i-input{background:#302a40;color:#eee7ff;border-color:#514668}.dark-mode .mm-i-answer{background:#38304b;color:#e9e0ff}.dark-mode .mm-i-tab{background:#302a40;color:#ddd1f4;border-color:#514668}.dark-mode .mm-i-tab.active{background:#7655d3;color:#fff}.dark-mode .mm-stat{background:#38304b}
@media(max-width:650px){.mm-i-modal{padding:17px}.mm-growth-stats{grid-template-columns:1fr}.mm-day{min-height:55px}}
`;
document.head.appendChild(css);

let user = null;
let entries = [];
let modal = null;
let tab = "ask";
let calDate = new Date();

const dOf = (x) => x?.createdAt?.toDate ? x.createdAt.toDate() : new Date(x?.createdAt || 0);
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dateText = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

async function load() {
  if (!user) { entries = []; return; }
  try {
    const q = query(collection(db, "journalEntries"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    entries = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => dOf(b) - dOf(a));
  } catch (error) {
    console.error("Phase 1 load error", error);
    entries = [];
  }
}

function addButton() {
  const side = document.querySelector(".sidebar");
  if (!side) return;
  if (!user) {
    document.querySelector(".mm-insights-btn")?.remove();
    return;
  }
  if (document.querySelector(".mm-insights-btn")) return;
  const button = document.createElement("button");
  button.className = "mm-insights-btn";
  button.textContent = "🧠 MindMate Insights";
  button.onclick = () => openInsights();
  side.insertBefore(button, side.querySelector(".sidebar-bottom") || null);
}

function closeInsights() {
  modal?.remove();
  modal = null;
}

function openInsights(nextTab = "ask") {
  tab = nextTab;
  closeInsights();
  modal = document.createElement("div");
  modal.className = "mm-i-overlay";
  modal.innerHTML = `
    <div class="mm-i-modal">
      <div class="mm-i-head">
        <div><h2>🧠 MindMate Insights</h2><p>Understand your journal, moods, and patterns.</p></div>
        <button class="mm-i-close">×</button>
      </div>
      <div class="mm-i-tabs">
        <button class="mm-i-tab" data-t="ask">🧠 Ask MindMate</button>
        <button class="mm-i-tab" data-t="calendar">📊 Mood Calendar</button>
        <button class="mm-i-tab" data-t="growth">🌱 Your Growth</button>
      </div>
      <div class="mm-i-content"></div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector(".mm-i-close").onclick = closeInsights;
  modal.addEventListener("click", (event) => { if (event.target === modal) closeInsights(); });
  modal.querySelectorAll("[data-t]").forEach((button) => {
    button.onclick = () => { tab = button.dataset.t; render(); };
  });
  render();
}

function render() {
  if (!modal) return;
  modal.querySelectorAll(".mm-i-tab").forEach((button) => button.classList.toggle("active", button.dataset.t === tab));
  const content = modal.querySelector(".mm-i-content");
  if (tab === "ask") ask(content);
  else if (tab === "calendar") calendar(content);
  else growth(content);
}

function ask(content) {
  content.innerHTML = `
    <div class="mm-i-card">
      <h3>Ask anything about your journal 💜</h3>
      <p style="color:#887b9d;font-size:13px">MindMate uses your saved entries to answer questions about themes, memories, and patterns.</p>
      <div class="mm-i-suggest">
        <button>What has been on my mind lately?</button>
        <button>What makes me happiest?</button>
        <button>What patterns do you notice?</button>
      </div>
      <textarea class="mm-i-input" id="mm-q" placeholder="Ask MindMate something..."></textarea>
      <button class="mm-i-primary" id="mm-ask">✨ Ask MindMate</button>
      <div id="mm-a"></div>
    </div>`;
  const questionBox = modal.querySelector("#mm-q");
  modal.querySelectorAll(".mm-i-suggest button").forEach((button) => { button.onclick = () => { questionBox.value = button.textContent; }; });
  modal.querySelector("#mm-ask").onclick = async () => {
    const question = questionBox.value.trim();
    const answerBox = modal.querySelector("#mm-a");
    if (!question) return;
    answerBox.innerHTML = '<div class="mm-i-answer">Thinking about your journal... ✨</div>';
    try {
      const payload = entries.slice(0, 25).map((item) => ({ text: (item.text || "").slice(0, 1200), mood: item.mood || null, date: dateText(dOf(item)) }));
      const response = await fetch(`${API}/ask`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, entries: payload }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Request failed");
      answerBox.innerHTML = `<div class="mm-i-answer">${escapeHtml(result.answer)}</div>`;
    } catch (error) {
      console.error(error);
      answerBox.innerHTML = '<div class="mm-i-answer">MindMate could not answer right now. Please try again.</div>';
    }
  };
}

function escapeHtml(value) {
  const box = document.createElement("div");
  box.textContent = value || "";
  return box.innerHTML;
}

function calendar(content) {
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const start = first.getDay();
  const map = {};
  entries.forEach((item) => {
    const itemKey = key(dOf(item));
    (map[itemKey] ||= []).push(item);
  });

  let html = `<div class="mm-i-card"><div class="mm-cal-head"><button id="mm-cprev">‹</button><strong>${calDate.toLocaleString("en-IN", { month: "long", year: "numeric" })}</strong><button id="mm-cnext">›</button></div><div class="mm-cal">`;
  html += ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((name) => `<div class="mm-cal-name">${name}</div>`).join("");
  for (let i = 0; i < start; i++) html += '<div class="mm-day empty"></div>';
  for (let day = 1; day <= days; day++) {
    const current = new Date(year, month, day);
    const list = map[key(current)] || [];
    const mood = list.find((item) => item.mood)?.mood;
    const today = key(current) === key(new Date());
    html += `<div class="mm-day ${today ? "today" : ""}"><span class="mm-day-num">${day}</span>${mood ? `<span class="mm-day-mood">${MOODS[mood] || "💜"}</span>` : ""}${list.length ? `<div class="mm-day-count">${list.length} ${list.length === 1 ? "entry" : "entries"}</div>` : ""}</div>`;
  }
  html += '</div><p style="color:#887b9d;font-size:12px;margin-bottom:0">Each emoji represents the mood recorded for that day.</p></div>';
  content.innerHTML = html;
  modal.querySelector("#mm-cprev").onclick = () => { calDate = new Date(year, month - 1, 1); render(); };
  modal.querySelector("#mm-cnext").onclick = () => { calDate = new Date(year, month + 1, 1); render(); };
}

function streak() {
  const days = [...new Set(entries.map((item) => key(dOf(item))))].sort();
  let best = 0;
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    if (i && Math.round((new Date(days[i]) - new Date(days[i - 1])) / 86400000) !== 1) run = 0;
    run += 1;
    best = Math.max(best, run);
  }
  return best;
}

function growth(content) {
  const monthMap = {};
  entries.forEach((item) => {
    const date = dOf(item);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    monthMap[monthKey] ||= { date: new Date(date.getFullYear(), date.getMonth(), 1), count: 0, moods: [] };
    monthMap[monthKey].count += 1;
    if (item.mood) monthMap[monthKey].moods.push(item.mood);
  });
  const months = Object.values(monthMap).sort((a, b) => a.date - b.date).slice(-6);
  const max = Math.max(...months.map((item) => item.count), 1);
  const counts = {};
  entries.forEach((item) => { if (item.mood) counts[item.mood] = (counts[item.mood] || 0) + 1; });
  const common = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];

  content.innerHTML = `
    <div class="mm-i-card">
      <h3>🌱 Your Growth Timeline</h3>
      <p style="color:#887b9d;font-size:13px">See how your journaling habit is building over time.</p>
      <div class="mm-growth-stats">
        <div class="mm-stat"><strong>${entries.length}</strong><span>Total entries</span></div>
        <div class="mm-stat"><strong>${common ? MOODS[common] : "—"}</strong><span>${common ? LABELS[common] : "No mood yet"}</span></div>
        <div class="mm-stat"><strong>${streak()}</strong><span>Best day streak</span></div>
      </div>
      ${months.length ? `<div class="mm-bars">${months.map((item) => `<div class="mm-bar-wrap"><span>${item.moods.length ? MOODS[item.moods[0]] : ""}</span><div class="mm-bar" style="height:${Math.max(8, item.count / max * 155)}px"></div><span class="mm-bar-label">${item.date.toLocaleString("en-IN", { month: "short" })}</span></div>`).join("")}</div>` : ""}
      <div class="mm-note">${entries.length < 3 ? "Keep writing. Your growth timeline becomes more useful as you build your journal." : `You have ${entries.length} saved entries. Keep checking in with yourself — the changes become clearer over time. 💜`}</div>
    </div>`;
}

onAuthStateChanged(auth, async (currentUser) => {
  user = currentUser;
  await load();
  addButton();
});

new MutationObserver(() => addButton()).observe(document.body, { childList: true, subtree: true });
