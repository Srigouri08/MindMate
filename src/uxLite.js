import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "./firebase";

const API = "https://mindmate-kuqp.onrender.com";
const PROMPTS = [
  "What made you smile today?",
  "What is something you are proud of today?",
  "What has been on your mind lately?",
  "What is one small thing you want to do for yourself tomorrow?",
  "Describe a moment today that you want to remember.",
  "If today had a title, what would you call it?",
  "What are you grateful for right now?",
];
const MOODS = { great: "😄", good: "😌", okay: "😐", low: "😔", rough: "😣" };

const style = document.createElement("style");
style.textContent = `
.mm-ux-inline{margin-top:16px;padding:18px;border:1px solid #ddd2f1;border-radius:18px;background:rgba(255,255,255,.8);box-shadow:0 8px 25px rgba(72,49,130,.08)}
.mm-ux-inline h3{margin:0 0 6px;color:#382a63}.mm-ux-inline p{color:#827697;font-size:13px}.mm-ux-ask{display:flex;gap:8px}.mm-ux-ask input{flex:1;padding:11px;border:1px solid #d8ccea;border-radius:11px}.mm-ux-ask button,.mm-ux-back{border:0;border-radius:11px;padding:10px 14px;background:#7655d3;color:#fff;font-weight:700;cursor:pointer}
.mm-ux-answer{margin-top:12px;padding:12px;border-radius:11px;background:#f2ecff;white-space:pre-wrap;color:#574777;font-size:13px}
.mm-ux-section{animation:mmUxFade .18s ease}.mm-ux-section-head{display:flex;justify-content:space-between;align-items:flex-start;gap:15px;margin-bottom:20px}.mm-ux-section h2{margin:0;color:#382a63}.mm-ux-section-head p{margin:5px 0;color:#827697}.mm-ux-card{padding:20px;border:1px solid #ddd2f1;border-radius:20px;background:rgba(255,255,255,.82);box-shadow:0 8px 25px rgba(72,49,130,.08)}.mm-ux-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.mm-ux-stat{font-size:30px;font-weight:800;color:#7655d3}.mm-ux-days{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin-top:14px}.mm-ux-day{min-height:64px;padding:7px;border:1px solid #e4dbf1;border-radius:10px;background:#fff;font-size:11px}.mm-ux-day strong{display:block;margin-bottom:5px;color:#4c3b68}.mm-ux-day small{display:block;margin-top:3px;color:#756986}.mm-ux-month{display:flex;justify-content:center;align-items:center;gap:12px}.mm-ux-month button{border:1px solid #d8ccea;background:#f4efff;color:#5a4387;border-radius:8px;width:30px;height:28px}.mm-ux-month strong{min-width:130px;text-align:center;color:#4c3b68}
.mm-ux-prompt{position:fixed;right:78px;top:50%;transform:translateY(-50%);z-index:10060;width:320px;max-height:70vh;overflow:auto;padding:18px;border:1px solid #ddd0f5;border-radius:20px;background:#fffafc;box-shadow:0 22px 55px rgba(50,30,100,.25)}.mm-ux-prompt h3{margin:0 0 5px;color:#46366c}.mm-ux-prompt button{width:100%;margin:5px 0;padding:11px;border:1px solid #ded4ef;border-radius:11px;background:#fff;text-align:left;color:#594582;cursor:pointer}.mm-ux-prompt .close{width:auto;float:right;border:0;background:transparent;font-size:22px;padding:0}
.dark-mode .mm-ux-inline,.dark-mode .mm-ux-card{background:#2d273d;border-color:#514667}.dark-mode .mm-ux-inline h3,.dark-mode .mm-ux-section h2,.dark-mode .mm-ux-day strong,.dark-mode .mm-ux-month strong{color:#eee8ff}.dark-mode .mm-ux-inline p,.dark-mode .mm-ux-section-head p,.dark-mode .mm-ux-day,.dark-mode .mm-ux-day small{color:#b8aecb}.dark-mode .mm-ux-ask input{background:#383049;color:#eee8ff;border-color:#5a4d70}.dark-mode .mm-ux-answer{background:#40345b;color:#eee8ff}.dark-mode .mm-ux-prompt{background:#2d273d;border-color:#514667}.dark-mode .mm-ux-prompt h3{color:#eee8ff}.dark-mode .mm-ux-prompt button{background:#39314a;color:#eee8ff;border-color:#5a4d70}
@keyframes mmUxFade{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
@media(max-width:850px){.mm-ux-grid{grid-template-columns:1fr}.mm-ux-ask{flex-direction:column}.mm-ux-prompt{right:58px;width:280px}}
`;
document.head.appendChild(style);

function sidebar(label){
  return [...document.querySelectorAll(".sidebar .side-item")].find((b) =>
    (b.textContent || "").replace(/\s+/g, " ").trim().toLowerCase().includes(label.toLowerCase())
  );
}

function cleanNav(){
  document.querySelectorAll(".sidebar .side-item").forEach((b) => {
    if (/Memory Search|Weekly Reflection|Ask MindMate/i.test(b.textContent || "")) b.remove();
  });
}

function getEntries(){
  const u = auth.currentUser;
  if (!u) return Promise.resolve([]);
  return getDocs(query(collection(db, "journalEntries"), where("userId", "==", u.uid)))
    .then((s) => s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => date(b) - date(a)));
}

function date(e){
  return e?.createdAt?.toDate?.() || new Date(e?.createdAt || 0);
}

function showMain(el){
  const main = document.querySelector(".main-content");
  if (!main) return;
  main.innerHTML = "";
  main.appendChild(el);
}

function backToJournal(){
  sidebar("My Journal")?.click();
}

function askPanel(){
  const heading = [...document.querySelectorAll(".main-content h2")].find((h) =>
    (h.textContent || "").includes("My Journal")
  );
  if (!heading || heading.dataset.mmAsk) return;

  heading.dataset.mmAsk = "1";
  const row = heading.parentElement;
  if (!row) return;
  row.style.display = "flex";
  row.style.alignItems = "center";
  row.style.gap = "10px";

  const b = document.createElement("button");
  b.className = "mm-ux-ask-button mm-ux-back";
  b.textContent = "🧠 Ask MindMate";
  row.appendChild(b);

  b.onclick = () => {
    let box = document.querySelector(".mm-ux-inline[data-ask]");
    if (box) {
      box.remove();
      return;
    }

    box = document.createElement("div");
    box.className = "mm-ux-inline";
    box.dataset.ask = "1";
    box.innerHTML = `<h3>🧠 Ask MindMate</h3><p>Ask something about your saved journal entries.</p><div class="mm-ux-ask"><input placeholder="What has been making me happy lately?"><button>Ask</button></div><div class="mm-ux-answer" hidden></div>`;

    const parent = heading.parentElement?.parentElement;
    if (!parent) return;
    parent.appendChild(box);

    const input = box.querySelector("input");
    const ask = box.querySelector("button");
    const answer = box.querySelector(".mm-ux-answer");

    const run = async () => {
      if (!input.value.trim()) return;
      ask.disabled = true;
      ask.textContent = "Thinking…";
      answer.hidden = false;
      answer.textContent = "MindMate is thinking…";
      try {
        const entries = await getEntries();
        const r = await fetch(`${API}/ask`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: input.value.trim(),
            entries: entries.slice(0, 25).map((e) => ({
              text: e.text,
              date: date(e).toISOString(),
              mood: e.mood || null,
            })),
          }),
        });
        const d = await r.json();
        if (!r.ok) throw Error();
        answer.textContent = d.answer || "I couldn't answer that right now.";
      } catch {
        answer.textContent = "MindMate couldn't answer right now. Please try again in a moment.";
      }
      ask.disabled = false;
      ask.textContent = "Ask";
    };

    ask.onclick = run;
    input.onkeydown = (e) => {
      if (e.key === "Enter") run();
    };
  };
}

function showGrowth(){
  const el = document.createElement("section");
  el.className = "mm-ux-section";
  el.innerHTML = `<div class="mm-ux-section-head"><div><p class="eyebrow">Look back gently</p><h2>🌱 Your Growth</h2><p>A simple picture of how your journaling has grown.</p></div><button class="mm-ux-back">← My Journal</button></div><div class="mm-ux-grid"><div class="mm-ux-card"><h3>Total entries</h3><div class="mm-ux-stat" data-total>—</div></div><div class="mm-ux-card"><h3>Most common mood</h3><div class="mm-ux-stat" data-mood>—</div></div><div class="mm-ux-card"><h3>Journaling streak</h3><div class="mm-ux-stat" data-streak>—</div></div><div class="mm-ux-card"><h3>Recent themes</h3><p data-themes>Loading…</p></div></div>`;
  showMain(el);
  el.querySelector("button").onclick = backToJournal;

  getEntries().then((es) => {
    el.querySelector("[data-total]").textContent = es.length;
    const c = es.filter((e) => e.mood).reduce((a, e) => {
      a[e.mood] = (a[e.mood] || 0) + 1;
      return a;
    }, {});
    const m = Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0];
    el.querySelector("[data-mood]").textContent = m ? `${MOODS[m]} ${m}` : "Not enough data";

    const keys = [...new Set(es.map((e) => {
      const d = date(e);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    }))];
    let streak = 0;
    const n = new Date();
    n.setHours(0, 0, 0, 0);
    for (;;) {
      const k = `${n.getFullYear()}-${n.getMonth() + 1}-${n.getDate()}`;
      if (!keys.includes(k)) break;
      streak++;
      n.setDate(n.getDate() - 1);
    }
    el.querySelector("[data-streak]").textContent = `${streak} day${streak === 1 ? "" : "s"}`;

    const words = {
      Studies: ["study", "exam", "college", "class", "coding"],
      Friends: ["friend", "friends"],
      Family: ["family", "mom", "dad", "sister", "brother"],
      Growth: ["learn", "goal", "growth", "future"],
      SelfCare: ["sleep", "rest", "walk", "health", "calm"],
    };
    const text = es.map((e) => e.text || "").join(" ").toLowerCase();
    const themes = Object.entries(words)
      .filter(([, w]) => w.some((x) => text.includes(x)))
      .map(([k]) => k);
    el.querySelector("[data-themes]").textContent = themes.join(" • ") || "Everyday life";
  }).catch(() => {});
}

function showWellness(){
  const el = document.createElement("section");
  el.className = "mm-ux-section";
  el.innerHTML = `<div class="mm-ux-section-head"><div><p class="eyebrow">Your everyday check-in</p><h2>🌿 Wellness Calendar</h2><p>See your mood and water habit together.</p></div><button class="mm-ux-back">← My Journal</button></div><div class="mm-ux-card"><div class="mm-ux-month"><button data-p>‹</button><strong data-title></strong><button data-n>›</button></div><div class="mm-ux-days" data-days></div></div>`;
  showMain(el);
  el.querySelector(".mm-ux-back").onclick = backToJournal;

  let cur = new Date();
  cur.setDate(1);

  getEntries().then((es) => {
    const render = () => {
      const days = el.querySelector("[data-days]");
      const title = el.querySelector("[data-title]");
      title.textContent = cur.toLocaleString("en-IN", { month: "long", year: "numeric" });
      days.innerHTML = "";

      const first = new Date(cur.getFullYear(), cur.getMonth(), 1).getDay();
      const count = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
      for (let i = 0; i < first; i++) days.appendChild(document.createElement("div"));

      for (let d = 1; d <= count; d++) {
        const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const e = es.find((x) => {
          const q = date(x);
          return `${q.getFullYear()}-${String(q.getMonth() + 1).padStart(2, "0")}-${String(q.getDate()).padStart(2, "0")}` === iso;
        });
        const water = Number(localStorage.getItem(`mindmate-water-${auth.currentUser?.uid}-${iso}`) || 0);
        const c = document.createElement("div");
        c.className = "mm-ux-day";
        c.innerHTML = `<strong>${d}</strong><span>${e?.mood ? MOODS[e.mood] : "·"}</span><small>💧 ${water ? water / 1000 : 0}L</small>`;
        days.appendChild(c);
      }
    };

    el.querySelector("[data-p]").onclick = () => {
      cur.setMonth(cur.getMonth() - 1);
      render();
    };
    el.querySelector("[data-n]").onclick = () => {
      cur.setMonth(cur.getMonth() + 1);
      render();
    };
    render();
  }).catch(() => {});
}

function sectionButtons(){
  const m = sidebar("Mood Calendar");
  const g = sidebar("Your Growth");
  if (m && !m.dataset.mmUx) {
    m.dataset.mmUx = "1";
    m.onclick = (e) => {
      e.stopPropagation();
      showWellness();
    };
  }
  if (g && !g.dataset.mmUx) {
    g.dataset.mmUx = "1";
    g.onclick = (e) => {
      e.stopPropagation();
      showGrowth();
    };
  }
}

function promptButton(){
  const t = document.querySelector('.mm-toolbar[data-mm-final]');
  if (!t || t.querySelector('[data-mm-writing-prompt]')) return;

  const b = document.createElement('button');
  b.className = 'mm-tool';
  b.dataset.mmWritingPrompt = '1';
  b.title = 'Writing prompts';
  b.textContent = '✍️';
  t.appendChild(b);

  b.onclick = (e) => {
    e.stopPropagation();
    document.querySelector('.mm-ux-prompt')?.remove();
    const p = document.createElement('div');
    p.className = 'mm-ux-prompt';
    p.innerHTML = '<button class="close">×</button><h3>✍️ Writing Prompts</h3><p>Pick one to start writing.</p>';
    document.body.appendChild(p);

    PROMPTS.forEach((text) => {
      const x = document.createElement('button');
      x.textContent = text;
      x.onclick = () => {
        const ta = document.querySelector('.book-page textarea');
        if (ta) {
          const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
          set?.call(ta, text);
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.focus();
        }
        p.remove();
      };
      p.appendChild(x);
    });

    p.querySelector('.close').onclick = () => p.remove();
  };
}

function littleMoments(){
  const b = sidebar("Little Moments");
  if (!b || b.dataset.mmUx) return;
  b.dataset.mmUx = "1";
  b.onclick = (e) => {
    e.stopPropagation();
    sidebar("My Journal")?.click();
    setTimeout(() => {
      const photo = [...document.querySelectorAll('.mm-toolbar[data-mm-final] .mm-tool')].find(
        (x) => /photo/i.test(x.title || "") || (x.textContent || "").includes('📸')
      );
      photo?.click();
    }, 250);
  };
}

function patch(){
  if (!auth.currentUser || !document.querySelector('.workspace')) return;
  cleanNav();
  sectionButtons();
  askPanel();
  promptButton();
  littleMoments();
}

let timer = null;
let observer = null;

function start(){
  if (timer) return;
  patch();
  timer = setInterval(patch, 700);
  observer = new MutationObserver(patch);
  observer.observe(document.body, { childList: true, subtree: true });
}

function stop(){
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

auth.onAuthStateChanged((user) => {
  if (user) setTimeout(start, 0);
  else stop();
});
