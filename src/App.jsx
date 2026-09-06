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
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import "./App.css";

const stickerSets = {
  All: ["💕", "⭐", "🌸", "🦋", "🎀", "🌿", "🌷", "🌻", "☁️", "🌙", "☀️", "🌈", "🧸", "🍓", "🍒", "☕", "📚", "💌", "✨", "💗"],
  Nature: ["🌿", "🌸", "🌷", "🌻", "☁️", "🌙", "☀️", "🌈", "🌱", "🍃"],
  Cute: ["🧸", "🍓", "🍒", "💕", "💗", "🎀", "🦋", "😊", "🤍", "🌸"],
  Objects: ["☕", "📚", "💌", "🎟️", "🎀", "🧸", "📖", "✏️", "🎧", "🕯️"],
  Symbols: ["⭐", "✨", "💜", "💕", "💗", "🤍", "🌙", "☀️", "♡", "✦"],
};

const categories = Object.keys(stickerSets);

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
  const [stickerCategory, setStickerCategory] = useState("All");
  const [pageStickers, setPageStickers] = useState([]);
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [screen, setScreen] = useState("new");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [search, setSearch] = useState("");
  const bookRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => localStorage.setItem("mindmate-dark-mode", darkMode), [darkMode]);

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
      const data = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      data.sort((a, b) => getDate(b.createdAt) - getDate(a.createdAt));
      setEntries(data);
    });
    return unsubscribe;
  }, [user]);

  function getDate(createdAt) {
    if (!createdAt) return new Date(0);
    return createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  }

  function formatDateTime(createdAt) {
    if (!createdAt) return "Date unavailable";
    return getDate(createdAt).toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function startNewEntry() {
    setScreen("new");
    setSelectedEntry(null);
    setEntry("");
    setAnalysis("");
    setPageStickers([]);
    setSelectedStickerId(null);
    setMessage("");
    setShowStickers(false);
    setOpenMenuId(null);
  }

  function openJournal() {
    setScreen("journal");
    setSelectedEntry(null);
    setShowStickers(false);
    setOpenMenuId(null);
  }

  function viewEntry(item) {
    setSelectedEntry(item);
    setEntry(item.text || "");
    setPageStickers(item.stickers || []);
    setSelectedStickerId(null);
    setAnalysis("");
    setMessage("");
    setScreen("view");
    setShowStickers(false);
    setOpenMenuId(null);
  }

  function editEntry(item) {
    setSelectedEntry(item);
    setEntry(item.text || "");
    setPageStickers(item.stickers || []);
    setSelectedStickerId(null);
    setAnalysis("");
    setMessage("");
    setScreen("edit");
    setShowStickers(false);
    setOpenMenuId(null);
  }

  async function deleteEntry(item) {
    const confirmed = window.confirm("Delete this journal entry? This cannot be undone.");
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "journalEntries", item.id));
      setOpenMenuId(null);
      if (selectedEntry?.id === item.id) startNewEntry();
      setMessage("Journal entry deleted.");
    } catch (error) {
      console.error(error);
      setMessage("Could not delete the entry.");
    }
  }

  function addSticker(emoji) {
    const positions = [
      { x: 12, y: 22 }, { x: 78, y: 20 }, { x: 20, y: 70 },
      { x: 76, y: 70 }, { x: 47, y: 80 }, { x: 58, y: 30 },
    ];
    const position = positions[pageStickers.length % positions.length];
    const newSticker = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x: position.x,
      y: position.y,
      size: 44,
      rotation: 0,
    };
    setPageStickers((current) => [...current, newSticker]);
    setSelectedStickerId(newSticker.id);
  }

  function updateSelectedSticker(changes) {
    setPageStickers((current) => current.map((sticker) =>
      sticker.id === selectedStickerId ? { ...sticker, ...changes } : sticker
    ));
  }

  function resizeSticker(amount) {
    const sticker = pageStickers.find((item) => item.id === selectedStickerId);
    if (!sticker) return;
    updateSelectedSticker({ size: Math.max(24, Math.min(90, sticker.size + amount)) });
  }

  function rotateSticker(amount) {
    const sticker = pageStickers.find((item) => item.id === selectedStickerId);
    if (!sticker) return;
    updateSelectedSticker({ rotation: sticker.rotation + amount });
  }

  function removeSelectedSticker() {
    if (!selectedStickerId) return;
    setPageStickers((current) => current.filter((sticker) => sticker.id !== selectedStickerId));
    setSelectedStickerId(null);
  }

  function startStickerDrag(event, sticker) {
    if (screen === "view") return;
    if (!bookRef.current) return;
    event.stopPropagation();
    setSelectedStickerId(sticker.id);
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
        ? { ...sticker, x: Math.max(5, Math.min(94, x)), y: Math.max(7, Math.min(88, y)) }
        : sticker
    ));
  }

  function stopStickerDrag() { dragRef.current = null; }

  async function handleAuth() {
    setMessage("");
    if (!email || !password) return setMessage("Please enter email and password.");
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveEntry() {
    if (!entry.trim()) return setMessage("Please write something first.");
    try {
      if (screen === "edit" && selectedEntry) {
        await updateDoc(doc(db, "journalEntries", selectedEntry.id), {
          text: entry.trim(),
          stickers: pageStickers,
        });
        setMessage("Your journal entry was updated! 💜");
        setSelectedEntry((current) => current ? { ...current, text: entry.trim(), stickers: pageStickers } : current);
        setScreen("view");
      } else {
        await addDoc(collection(db, "journalEntries"), {
          userId: user.uid,
          text: entry.trim(),
          createdAt: new Date(),
          stickers: pageStickers,
        });
        setEntry("");
        setAnalysis("");
        setPageStickers([]);
        setSelectedStickerId(null);
        setMessage("Journal entry saved! 💜");
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not save your entry.");
    }
  }

  async function analyzeEntry() {
    if (!entry.trim()) return setMessage("Write something first so Gemini can analyze it.");
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
    setScreen("new");
  }

  function formatAnalysis(text) {
    const cleanText = text.replace(/\\\*/g, "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/#{1,6}\s*/g, "").replace(/^\s*[-•]\s*/gm, "•").trim();
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

  const isViewScreen = screen === "view" && selectedEntry;
  const isEditable = screen === "new" || screen === "edit";
  const displayedDate = isViewScreen ? selectedEntry.createdAt : (screen === "edit" ? selectedEntry.createdAt : new Date());
  const filteredEntries = entries.filter((item) => (item.text || "").toLowerCase().includes(search.toLowerCase()));
  const selectedSticker = pageStickers.find((item) => item.id === selectedStickerId);

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`} onPointerMove={moveSticker} onPointerUp={stopStickerDrag} onPointerCancel={stopStickerDrag} onClick={() => setOpenMenuId(null)}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon"><span>🧠</span><b>♡</b></div>
          <div><h1>MindMate</h1><span>JOURNAL • REFLECT • GROW</span></div>
        </div>
        <div className="top-actions">
          {user && <button className={`icon-button ${showStickers ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); setShowStickers(!showStickers); }} title="Add stickers">🎀</button>}
          <button className="icon-button" onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">{darkMode ? "☀️" : "🌙"}</button>
          {user && <div className="profile-pill"><span>{user.email?.[0]?.toUpperCase() || "S"}</span><strong>{user.email?.split("@")[0]}</strong></div>}
        </div>
      </header>

      {!user ? (
        <div className="login-layout">
          <div className="login-card">
            <div className="login-heart">♡</div>
            <h2>{isLogin ? "Welcome Back" : "Create Your Journal"}</h2>
            <p className="login-subtitle">{isLogin ? "A quiet little place for your thoughts." : "Your thoughts deserve a safe place."}</p>
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleAuth}>{isLogin ? "Open My Journal" : "Create Account"}</button>
            {message && <p className="error">{message}</p>}
            <p className="switch">{isLogin ? "Don't have an account?" : "Already have an account?"}<button className="link-button" onClick={() => { setIsLogin(!isLogin); setMessage(""); }}>{isLogin ? " Sign Up" : " Login"}</button></p>
          </div>
        </div>
      ) : (
        <div className="workspace">
          <aside className="sidebar">
            <button className={`side-item ${screen === "new" ? "active" : ""}`} onClick={startNewEntry}><span>✎</span> New Entry</button>
            <button className={`side-item ${screen === "journal" || screen === "view" || screen === "edit" ? "active" : ""}`} onClick={openJournal}><span>📖</span> My Journal</button>
            <button className="side-item" onClick={startNewEntry}><span>♡</span> Little Moments</button>
            <div className="sidebar-bottom">
              <button className="side-item" onClick={() => setDarkMode(!darkMode)}><span>⚙</span> {darkMode ? "Light Mode" : "Dark Mode"}</button>
              <button className="side-logout" onClick={handleLogout}><span>↪</span> Log Out</button>
            </div>
          </aside>

          <main className="main-content">
            {screen === "journal" ? (
              <section className="journal-list-screen">
                <div className="section-intro"><p className="eyebrow">Your memories</p><h2>My Journal 📖</h2><p>Your journey, one entry at a time.</p></div>
                <div className="journal-search"><span>⌕</span><input placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <div className="date-list">
                  {filteredEntries.length === 0 ? (
                    <div className="empty-journal"><div>📖</div><h3>{entries.length ? "No matching entries." : "Your journal is waiting."}</h3><p>{entries.length ? "Try a different search." : "Write your first entry and come back to find it here."}</p>{!entries.length && <button onClick={startNewEntry}>✎ Write an Entry</button>}</div>
                  ) : filteredEntries.map((item) => (
                    <div className="date-entry" key={item.id}>
                      <div className="date-entry-icon">📅</div>
                      <div className="date-entry-info"><strong>{formatDateTime(item.createdAt)}</strong><span>{item.text?.slice(0, 90)}{item.text?.length > 90 ? "…" : ""}</span></div>
                      <button className="view-entry-button" onClick={() => viewEntry(item)}>View Entry →</button>
                      <div className="entry-menu-wrap" onClick={(e) => e.stopPropagation()}>
                        <button className="dots-button" onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}>⋮</button>
                        {openMenuId === item.id && <div className="entry-menu"><button onClick={() => editEntry(item)}>✎ Edit</button><button className="delete-option" onClick={() => deleteEntry(item)}>🗑 Delete</button></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <>
                <div className="welcome-row">
                  <div>
                    <p className="eyebrow">{isViewScreen ? "A saved memory" : screen === "edit" ? "Edit your memory" : "A little space for you"}</p>
                    <h2>{isViewScreen ? "Your journal entry 📖" : screen === "edit" ? "Make it yours ✨" : "How was your day? ✍️"}</h2>
                    <p>{isViewScreen || screen === "edit" ? formatDateTime(selectedEntry.createdAt) : `Hi, ${user.email}. Take a moment and write freely.`}</p>
                  </div>
                  <div className="quote-card">“Small thoughts”<br /><strong>Big changes. ♡</strong></div>
                </div>

                <div className="book-area">
                  <div className="book-shell">
                    <div className="book-spine"><span>◦</span><span>◦</span><span>◦</span><span>◦</span><span>◦</span></div>
                    <div className="book-page" ref={bookRef} onClick={() => setSelectedStickerId(null)}>
                      <div className="book-page-top"><div className="book-title">Dear Journal,</div><div className="today-date">{formatDateTime(displayedDate)}</div></div>
                      <div className="margin-line" />
                      <textarea value={entry} onChange={(e) => isEditable && setEntry(e.target.value)} readOnly={!isEditable} placeholder="Write about your day..." />

                      {pageStickers.map((sticker) => (
                        <div key={sticker.id} className={`placed-sticker ${selectedStickerId === sticker.id ? "selected" : ""}`} style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, fontSize: `${sticker.size}px`, transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)` }} onPointerDown={(event) => startStickerDrag(event, sticker)} onClick={(event) => { event.stopPropagation(); setSelectedStickerId(sticker.id); }}>
                          {sticker.emoji}
                          {selectedStickerId === sticker.id && isEditable && (
                            <div className="sticker-controls" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => resizeSticker(-5)}>−</button><button onClick={() => resizeSticker(5)}>+</button><button onClick={() => rotateSticker(-15)}>↺</button><button onClick={() => rotateSticker(15)}>↻</button><button className="remove-sticker" onClick={removeSelectedSticker}>×</button>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="book-hint">Your thoughts. Your page. Your little world. ♡</div>
                    </div>

                    {showStickers && isEditable && (
                      <div className="sticker-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="sticker-panel-title"><div><strong>Stickers ✨</strong><small>Make your page yours</small></div><button className="close-stickers" onClick={() => setShowStickers(false)}>×</button></div>
                        <div className="sticker-tabs">{categories.map((category) => <button key={category} className={stickerCategory === category ? "active" : ""} onClick={() => setStickerCategory(category)}>{category}</button>)}</div>
                        <div className="sticker-grid">{stickerSets[stickerCategory].map((sticker, index) => <button key={`${sticker}-${index}`} className="sticker-choice" onClick={() => addSticker(sticker)}>{sticker}</button>)}</div>
                        <p className="sticker-help">Click to add. Drag to move. Select a sticker for resize, rotate and remove.</p>
                      </div>
                    )}
                  </div>
                </div>

                {isViewScreen ? (
                  <div className="action-row three-actions"><button className="secondary-action" onClick={() => editEntry(selectedEntry)}>✎ Edit Entry</button><button className="primary-action" onClick={openJournal}>← My Journal</button><button className="danger-action" onClick={() => deleteEntry(selectedEntry)}>🗑 Delete</button></div>
                ) : (
                  <>
                    <div className="action-row"><button className="secondary-action" onClick={analyzeEntry}>✨ Analyze with AI</button><button className="primary-action" onClick={saveEntry}>{screen === "edit" ? "💾 Save Changes" : "💾 Save Entry"}</button></div>
                    {screen === "edit" && <button className="cancel-edit" onClick={() => viewEntry(selectedEntry)}>Cancel editing</button>}
                    {loading && <p className="message">🤖 Gemini is thinking...</p>}
                    {message && <p className="message">{message}</p>}
                    {analysis && <div className="analysis"><h3>🤖 AI Analysis</h3>{(() => { const result = formatAnalysis(analysis); return <><div className="analysis-section"><h4>😊 Mood</h4><p>{result.mood}</p></div><div className="analysis-section"><h4>📝 Summary</h4><p>{result.summary}</p></div><div className="analysis-section"><h4>📌 Main Topics</h4><p>{result.topics}</p></div><div className="analysis-section"><h4>💡 Helpful Suggestion</h4><p>{result.suggestion}</p></div></>; })()}</div>}
                  </>
                )}
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
