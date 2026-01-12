const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const mongoose = require("mongoose");
const Candidate = require("./models/candidate");

mongoose
  .connect(
    "mongodb+srv://harshithofficial26_db_user:harshith123@cluster0.wcmhsag.mongodb.net/hiringDB?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });



/*
 AI Engineer – Fresher / Beginner Interview
 20 Questions: HR + Programming + AI Basics + Projects
*/

const questions = [
  // HR & ATTITUDE (5)
  { q: "Tell me about yourself", k: ["student", "graduate", "engineer"] },
  { q: "Why do you want to become an AI Engineer?", k: ["ai", "interest", "technology"] },
  { q: "Are you willing to learn new technologies?", k: ["yes", "learn", "willing"] },
  { q: "How do you handle challenges while learning?", k: ["practice", "learn", "try"] },
  { q: "Are you comfortable working in a team?", k: ["team", "yes", "collaborate"] },

  // PROGRAMMING BASICS (5)
  { q: "Which programming language do you know best?", k: ["python", "java", "javascript"] },
  { q: "What is a variable?", k: ["store", "value"] },
  { q: "What is a function?", k: ["reuse", "block", "code"] },
  { q: "What is debugging?", k: ["error", "fix"] },
  { q: "What is Git used for?", k: ["version", "control", "code"] },

  // AI / ML BASICS (5)
  { q: "What is Artificial Intelligence in simple words?", k: ["machine", "intelligence", "data"] },
  { q: "What is Machine Learning?", k: ["learn", "data", "model"] },
  { q: "What is a dataset?", k: ["data", "collection"] },
  { q: "What is model training?", k: ["train", "data"] },
  { q: "What is overfitting?", k: ["over", "fit", "training"] },

  // PROJECT & PRACTICAL (5)
  { q: "Have you worked on any AI or ML project?", k: ["project", "model", "dataset"] },
  { q: "Which libraries have you used?", k: ["numpy", "pandas", "sklearn", "tensorflow"] },
  { q: "How did you evaluate your model?", k: ["accuracy", "test", "validation"] },
  { q: "What challenges did you face in your project?", k: ["problem", "challenge"] },
  { q: "What do you want to learn next in AI?", k: ["deep", "nlp", "vision", "learn"] }
];

// Send questions
app.get("/questions", (req, res) => {
  res.json(questions.map((item, index) => ({
    id: index + 1,
    question: item.q
  })));
});

// Submit answers
app.post("/submit", async (req, res) => {
  try {
    const { name, email, answers } = req.body;

    let score = 0;
    let feedback = [];

    questions.forEach((item, i) => {
      const ans = (answers[i] || "").toLowerCase();
      const matched = item.k.some(word => ans.includes(word));

      if (matched) score++;

      feedback.push({
        question: item.q,
        status: matched ? "Good" : "Needs improvement"
      });
    });

    const percentage = Math.round((score / questions.length) * 100);
    const eligible = percentage >= 50;

    // 🔥 SAVE TO DATABASE (THIS WAS FAILING EARLIER)
    const candidate = new Candidate({
      name,
      email,
      answers,
      score,
      percentage,
      eligible
    });

    await candidate.save();

    res.json({
      result: eligible
        ? "🎉 Eligible for next round"
        : "❌ Not eligible. Improve basics",
      score,
      totalQuestions: questions.length,
      percentage,
      eligible,
      feedback
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "❌ Failed to save candidate",
      error: err.message
    });
  }
});

// 🔐 Admin - Get all candidates
app.get("/admin/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .sort({ createdAt: -1 });

    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔐 Admin - Get single candidate by ID
app.get("/admin/candidate/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    res.json(candidate);
  } catch (err) {
    res.status(404).json({ error: "Candidate not found" });
  }
});
// ADMIN: Get all candidates
app.get("/admin/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
