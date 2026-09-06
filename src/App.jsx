import { useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import "./App.css";

const stickers = [
  "💕", "⭐", "🌸", "🦋", "🎀",
  "🌿", "🌷", "🌻", "☁️", "🌙",
  "☀️", "🌈", "🧸", "🍓", "🍒",
  "☕", "📚", "💌", "✨", "💗",
  "🌱", "🤍", "😊", "🎟️", "💜",
];

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mindmate-dark-mode") === "true");
  const [showStickers, setShowStickers] = useState(false);
  const [pageStickers, setPageStickers] = useState([]);
  const bookRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("mindmate-dark-mode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }

    const q = query(collection(db, "journalEntries"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data.sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return bDate - aDate;
      }));
    });

    return unsubscribe;
  }, [user]);

  function addSticker(emoji) {
    const positions = [
      { x: 10, y: 16 }, { x: 72, y: 15 }, { x: 20, y: 68 },
      { x: 75, y: 70 }, { x: 45, y: 78 }, { x: 55, y: 22 },
    ];
    const position = positions[pageStickers.length % positions.length];

    setPageStickers((current) => [
      ...current,
      { id: `${Date.now()}-${Math.random()}`, emoji, x: position.x, y: position.y },
    ]);
  }

  function startStickerDrag(event, sticker) {
    if (!bookRef.current) return;
    const rect = bookRef.current.getBoundingClientRect();
    const stickerX = rect.left + (sticker.x / 100) * rect.width;
    const stickerY = rect.top + (sticker.y / 100) * rect.height;

    dragRef.current = {
      id: sticker.id,
      offsetX: event.clientX - stickerX,
      offsetY: event.clientY - stickerY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveSticker(event) {
    if (!dragRef.current || !bookRef.current) return;
    const rect = bookRef.current.getBoundingClientRect();
    const drag = dragRef.current;
    const x = ((event.clientX - rect.left - drag.offsetX) / rect.width) * 100;
    const y = ((event.clientY - rect.top - drag.offsetY) / rect.height) * 100;

    setPageStickers((current) => current.map((sticker) =>
      sticker.id === drag.id
        ? { ...sticker, x: Math.max(5, Math.min(92, x)), y: Math.max(5, Math.min(88, y)) }
        : sticker
    ));
  }

  function stopStickerDrag() {
    dragRef.current = null;
  }

  function removeSticker(id) {
    setPageStickers((current) => current.filter((sticker) => sticker.id !== id));
  }

  async function handleAuth() {
    setMessage("");
    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setEmail("");
      setPassword("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveEntry() {
    if (!entry.trim()) {
      setMessage("Please write something first.");
      return;
    }

    try {
      await addDoc(collection(db, "journalEntries"), {
        userId: user.uid,
        text: entry.trim(),
        createdAt: new Date(),
      });
      setEntry("");
      setAnalysis("");
      setPageStickers([]);
      setMessage("Journal entry saved! 💜");
    } catch (error) {
      console.error(error);
      setMessage("Could not save your entry.");
    }
  }

  async function analyzeEntry() {
    if (!entry.trim()) {
      setMessage("Write something first so Gemini can analyze it.");
      return;
    }

    setLoading(true);
    setAnalysis("");
    setMessage("");

    try {
      const response = await fetch("https://mindmate-kuqp.onrender.com/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: entry }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI analysis failed.");
      setAnalysis(data.analysis);
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to Gemini.");
    }
    setLoading(false);
  }

  async function handleLogout() {
    await signOut(auth);
    setEntries([]);
    setPageStickers([]);
    setShowStickers(false);
  }

  function formatDateTime(createdAt) {
    if (!createdAt) return "Date unavailable";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  }

  function formatAnalysis(text) {
    const cleanText = text
      .replace(/\\\*/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s*/g, "")
      .replace(/^\s*[-•]\s*/gm, "•")
      .trim();

    const sections = { mood: "", summary: "", topics: "", suggestion: "" };
    const moodMatch = cleanText.match(/Mood:\s*([\s\S]*?)(?=Summary:|Main topics:|Helpful suggestion:|$)/i);
    const summaryMatch = cleanText.match(/Summary:\s*([\s\S]*?)(?=Main topics:|Helpful suggestion:|$)/i);
    const topicsMatch = cleanText.match(/Main topics:\s*([\s\S]*?)(?=Helpful suggestion:|$)/i);
    const suggestionMatch = cleanText.match(/Helpful suggestion:\s*([\s\S]*?)$/i);

    sections.mood = moodMatch ? moodMatch[1].trim() : "";
    sections.summary = summaryMatch ? summaryMatch[1].trim() : "";
    sections.topics = topicsMatch ? topicsMatch[1].trim() : "";
    sections.suggestion = suggestionMatch ? suggestionMatch[1].trim() : "";
    return sections;
  }

  return (
    <div
      className={`app ${darkMode ? "dark-mode" : ""}`}
      onPointerMove={moveSticker}
      onPointerUp={stopStickerDrag}
      onPointerCancel={stopStickerDrag}
    >
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">♡</div>
          <div>
            <h1>MindMate</h1>
            <span>JOURNAL • REFLECT • GROW</span>
          </div>
        </div>

        <div className="top-actions">
          {user && (
            <button
              className={`icon-button ${showStickers ? "active" : ""}`}
              onClick={() => setShowStickers(!showStickers)}
              title="Stickers"
            >
              🎀
            </button>
          )}
          <button
            className="icon-button"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {showStickers && user && (
          <div className="sticker-panel">
            <div className="sticker-panel-title">
              <div>
                <strong>Stickers</strong>
                <small>Decorate your journal ✨</small>
              </div>
              <button className="close-stickers" onClick={() => setShowStickers(false)}>×</button>
            </div>
            <p className="sticker-help">Click a sticker to add it to your page. Drag it anywhere!</p>
            <div className="sticker-grid">
              {stickers.map((sticker, index) => (
                <button key={`${sticker}-${index}`} className="sticker-choice" onClick={() => addSticker(sticker)}>
                  {sticker}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {!user ? (
        <div className="login-layout">
          <div className="login-card">
            <div className="login-heart">♡</div>
            <h2>{isLogin ? "Welcome Back" : "Create Your Journal"}</h2>
            <p className="login-subtitle">
              {isLogin ? "A quiet little place for your thoughts." : "Your thoughts deserve a safe place."}
            </p>
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleAuth}>{isLogin ? "Open My Journal" : "Create Account"}</button>
            {message && <p className="error">{message}</p>}
            <p className="switch">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button className="link-button" onClick={() => { setIsLogin(!isLogin); setMessage(""); }}>
                {isLogin ? " Sign Up" : " Login"}
              </button>
            </p>
          </div>
        </div>
      ) : (
        <div className="workspace">
          <aside className="sidebar">
            <div className="side-item active"><span>✎</span> New Entry</div>
            <div className="side-item"><span>📖</span> My Journal</div>
            <div className="side-item"><span>♡</span> Little Moments</div>
            <div className="sidebar-bottom">
              <div className="side-item"><span>⚙</span> Settings</div>
              <button className="side-logout" onClick={handleLogout}><span>↪</span> Log Out</button>
            </div>
          </aside>

          <main className="main-content">
            <div className="welcome-row">
              <div>
                <p className="eyebrow">A little space for you</p>
                <h2>How was your day? ✍️</h2>
                <p>Hi, {user.email}. Take a moment and write freely.</p>
              </div>
              <div className="quote-card">“Small thoughts”<br /><strong>Big changes. ♡</strong></div>
            </div>

            <div className="book-shell">
              <div className="book-spine"><span>◦</span><span>◦</span><span>◦</span><span>◦</span><span>◦</span></div>
              <div className="book-page" ref={bookRef}>
                <div className="book-page-top">
                  <div className="book-title">Dear Journal,</div>
                  <div className="today-date">{formatDateTime(new Date())}</div>
                </div>
                <div className="margin-line" />
                <textarea value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Write about your day..." />

                {pageStickers.map((sticker) => (
                  <div
                    key={sticker.id}
                    className="placed-sticker"
                    style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
                    onPointerDown={(event) => startStickerDrag(event, sticker)}
                    onDoubleClick={() => removeSticker(sticker.id)}
                    title="Drag me • Double-click to remove"
                  >
                    {sticker.emoji}
                  </div>
                ))}

                <div className="book-hint">Your thoughts. Your page. Your little world. ♡</div>
              </div>
            </div>

            <div className="action-row">
              <button className="secondary-action" onClick={analyzeEntry}>✨ Analyze with AI</button>
              <button className="primary-action" onClick={saveEntry}>💾 Save Journal Entry</button>
            </div>

            {loading && <p className="message">🤖 Gemini is thinking...</p>}
            {message && <p className="message">{message}</p>}

            {analysis && (
              <div className="analysis">
                <h3>🤖 AI Analysis</h3>
                {(() => {
                  const result = formatAnalysis(analysis);
                  return (
                    <>
                      {result.mood && <div className="analysis-section"><h4>😊 Mood</h4><p>{result.mood}</p></div>}
                      {result.summary && <div className="analysis-section"><h4>📝 Summary</h4><p>{result.summary}</p></div>}
                      {result.topics && <div className="analysis-section"><h4>📌 Main Topics</h4><p>{result.topics}</p></div>}
                      {result.suggestion && <div className="analysis-section"><h4>💡 Helpful Suggestion</h4><p>{result.suggestion}</p></div>}
                    </>
                  );
                })()}
              </div>
            )}

            <section className="journal-history">
              <div className="history-heading">
                <div>
                  <p className="eyebrow">Your memories</p>
                  <h2>Your Journal 📖</h2>
                </div>
                <span>{entries.length} {entries.length === 1 ? "entry" : "entries"}</span>
              </div>

              {entries.length === 0 ? (
                <p className="empty">No entries yet. Write your first one! ✨</p>
              ) : (
                entries.map((item) => (
                  <div className="entry" key={item.id}>
                    <div className="entry-date">📅 {formatDateTime(item.createdAt)}</div>
                    <p>{item.text}</p>
                  </div>
                ))
              )}
            </section>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
