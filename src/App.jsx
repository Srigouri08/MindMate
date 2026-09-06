import { useEffect, useState } from "react";
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

  // Dark mode - remember the user's choice
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("mindmate-dark-mode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("mindmate-dark-mode", darkMode);
  }, [darkMode]);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  // Get this user's journal entries
  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }

    const q = query(
      collection(db, "journalEntries"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEntries(data.reverse());
    });

    return unsubscribe;
  }, [user]);

  // Login / Signup
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

  // Save journal entry
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
      setMessage("Journal entry saved! 💜");
    } catch (error) {
      console.error(error);
      setMessage("Could not save your entry.");
    }
  }

  // Analyze journal entry with Gemini
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: entry,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI analysis failed.");
      }

      setAnalysis(data.analysis);
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to Gemini.");
    }

    setLoading(false);
  }

  // Logout
  async function handleLogout() {
    await signOut(auth);
    setEntries([]);
  }

  // Format the date and time stored in Firestore
  function formatDateTime(createdAt) {
    if (!createdAt) return "Date unavailable";

    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // Format Gemini response
  function formatAnalysis(text) {
    const cleanText = text
      .replace(/\\\*/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s*/g, "")
      .replace(/^\s*[-•]\s*/gm, "•")
      .trim();

    const sections = {
      mood: "",
      summary: "",
      topics: "",
      suggestion: "",
    };

    const moodMatch = cleanText.match(
      /Mood:\s*([\s\S]*?)(?=Summary:|Main topics:|Helpful suggestion:|$)/i
    );

    const summaryMatch = cleanText.match(
      /Summary:\s*([\s\S]*?)(?=Main topics:|Helpful suggestion:|$)/i
    );

    const topicsMatch = cleanText.match(
      /Main topics:\s*([\s\S]*?)(?=Helpful suggestion:|$)/i
    );

    const suggestionMatch = cleanText.match(
      /Helpful suggestion:\s*([\s\S]*?)$/i
    );

    sections.mood = moodMatch ? moodMatch[1].trim() : "";
    sections.summary = summaryMatch ? summaryMatch[1].trim() : "";
    sections.topics = topicsMatch ? topicsMatch[1].trim() : "";
    sections.suggestion = suggestionMatch ? suggestionMatch[1].trim() : "";

    return sections;
  }

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      <div className="container">
        <div className="top">
          <div>
            <h1>🧠 MindMate</h1>

            <p className="subtitle">
              {user ? `Welcome, ${user.email}` : "Your personal AI-powered journal"}
            </p>
          </div>

          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {!user ? (
          <div className="card">
            <h2>{isLogin ? "Welcome Back 👋" : "Create Account ✨"}</h2>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleAuth}>
              {isLogin ? "Login" : "Create Account"}
            </button>

            {message && <p className="error">{message}</p>}

            <p className="switch">
              {isLogin ? "Don't have an account?" : "Already have an account?"}

              <button
                className="link-button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage("");
                }}
              >
                {isLogin ? " Sign Up" : " Login"}
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="card">
              <div className="journal-header">
                <h2>How was your day? ✍️</h2>

                <button className="logout" onClick={handleLogout}>
                  Log Out
                </button>
              </div>

              <div className="book-page">
                <div className="book-title">Dear Journal,</div>
                <textarea
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="Write about your day..."
                />
              </div>

              <button onClick={analyzeEntry}>✨ Analyze with AI</button>

              <button onClick={saveEntry}>💾 Save Journal Entry</button>

              {loading && (
                <p className="message">🤖 Gemini is thinking...</p>
              )}

              {message && <p className="message">{message}</p>}

              {analysis && (
                <div className="analysis">
                  <h3>🤖 AI Analysis</h3>

                  {(() => {
                    const result = formatAnalysis(analysis);

                    return (
                      <>
                        {result.mood && (
                          <div className="analysis-section">
                            <h4>😊 Mood</h4>
                            <p>{result.mood}</p>
                          </div>
                        )}

                        {result.summary && (
                          <div className="analysis-section">
                            <h4>📝 Summary</h4>
                            <p>{result.summary}</p>
                          </div>
                        )}

                        {result.topics && (
                          <div className="analysis-section">
                            <h4>📌 Main Topics</h4>
                            <p>{result.topics}</p>
                          </div>
                        )}

                        {result.suggestion && (
                          <div className="analysis-section">
                            <h4>💡 Helpful Suggestion</h4>
                            <p>{result.suggestion}</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <h2 className="previous">Your Journal 📖</h2>

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
          </>
        )}
      </div>
    </div>
  );
}

export default App;
