# 🧠 MindMate

MindMate is a simple AI-powered journal application that helps users write private journal entries and get an AI-generated reflection on their mood, summary, main topics, and a helpful suggestion.

## 🚀 Live Demo

https://mindmate-1sxd.onrender.com

## ✨ Features

- 🔐 Email/password authentication with Firebase Authentication
- 📖 Private journal entries stored in Cloud Firestore
- 🤖 AI-powered journal analysis using Google Gemini
- 😊 Mood analysis
- 📝 Short journal summary
- 📌 Main topics extracted from the entry
- 💡 Supportive AI suggestion
- 🌐 Publicly deployed web application

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Firebase Authentication
- Cloud Firestore

### Backend
- Node.js
- Express
- Google Gemini API using `@google/genai`
- CORS

### Deployment
- Frontend: Render Static Site
- Backend: Render Web Service

## 🏗️ Project Structure

```text
MindMate/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── firebase.js
├── backend/
│   ├── server.js
│   └── package.json
├── package.json
├── .gitignore
└── README.md
```

## 🔒 Security

- The Gemini API key is stored as an environment variable and is not committed to GitHub.
- `.env` is included in `.gitignore`.
- Firestore rules restrict journal access to the authenticated user's own entries.
- The frontend does not directly contain the Gemini API secret.

## ⚙️ Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Srigouri08/MindMate.git
cd MindMate
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Create the environment file

Create a `.env` file in the project root:

```text
GEMINI_API_KEY=your_gemini_api_key
```

Do not commit this file to GitHub.

### 4. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 5. Run the backend

From the `backend` folder:

```bash
node server.js
```

### 6. Run the frontend

In another terminal, from the project root:

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

## 🔥 Firebase Setup

1. Create a Firebase project.
2. Enable Email/Password sign-in under Firebase Authentication.
3. Create a Cloud Firestore database.
4. Register a web application and add its Firebase configuration to `src/firebase.js`.
5. Add Firestore security rules so users can only access their own journal entries.

## 🤖 Gemini Setup

1. Create a Gemini API key in Google AI Studio.
2. Store the key as `GEMINI_API_KEY` in the backend environment.
3. The backend sends journal text to Gemini for analysis through the `/analyze` endpoint.

## 🌐 Deployment

### Frontend on Render

- Build command: `npm run build`
- Publish directory: `dist`

### Backend on Render

- Root directory: `backend`
- Build command: `npm install`
- Start command: `node server.js`
- Environment variable: `GEMINI_API_KEY`

## 🎯 Purpose

MindMate was built as a beginner-friendly AI application demonstrating authentication, private cloud data storage, a Gemini-powered AI feature, and public deployment.

## 👩‍💻 Author

Srigouri Siddani

## 📌 Challenge Hashtag

#AccelerateAIwithCloudRun
