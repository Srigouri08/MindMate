require("dotenv").config({
  path: "../.env",
});

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Gemini API key was not found!");
} else {
  console.log("✅ Gemini API key loaded!");
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

app.get("/", (req, res) => {
  res.send("MindMate AI backend is running!");
});

app.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Journal entry is empty.",
      });
    }

    console.log("🤖 Sending journal entry to Gemini...");

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",

      input: `
You are MindMate, an empathetic AI journal assistant.

Analyze this journal entry.

Give:

Mood:
The main mood in one short sentence.

Summary:
A short summary.

Main topics:
List 2 or 3 important topics.

Helpful suggestion:
Give one simple supportive suggestion.

Keep the response short and friendly.

Journal entry:
${text}
`,

      generation_config: {
        thinking_level: "low",
      },
    });

    console.log("✅ Gemini responded!");

    res.json({
      analysis: interaction.output_text,
    });

  } catch (error) {
    console.error("❌ Gemini error:", error);

    res.status(500).json({
      error: "Gemini could not analyze the journal entry.",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 MindMate backend running on port ${PORT}`);
});