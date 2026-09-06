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

Analyze the journal entry below.

Return EXACTLY these four sections:

Mood:
Write one short sentence describing the main mood.

Summary:
Write a short summary of the journal entry.

Main topics:
Write 2 or 3 topics separated by commas.

Helpful suggestion:
Give one simple supportive suggestion.

IMPORTANT:
- Use plain text only.
- Do NOT use Markdown.
- Do NOT use asterisks.
- Do NOT use hashtags.
- Do NOT use bullet points.
- Do NOT add emojis.
- Do NOT put any section inside bold formatting.
- Do NOT add any introduction or conclusion.
- Use exactly the section names shown above.

Journal entry:
${text}
`,

      generation_config: {
        thinking_level: "low",
      },
    });

    console.log("✅ Gemini responded!");

    // Extra safety: remove Markdown characters if Gemini adds them anyway.
    const cleanAnalysis = interaction.output_text
      .replace(/\\\*/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s*/g, "")
      .trim();

    res.json({
      analysis: cleanAnalysis,
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