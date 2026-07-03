const router = require("express").Router();
const AISession = require("../models/AISession");
const { protect } = require("../middleware/auth");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const SYSTEM_PROMPT = `You are Lafiya AI, a compassionate health assistant focused on Nigerian healthcare.
You provide helpful health information, symptom guidance, and connect users to appropriate care.
Always recommend professional medical consultation for serious symptoms.
Be empathetic, clear, and culturally sensitive to Nigerian context.
For emergencies, always advise calling 112 immediately.`;

async function getAIReply(messages, language = "en") {
  if (!genAI) {
    return {
      reply: "AI service is not configured. Please add your Gemini API key to enable AI chat.",
      urgencyLevel: "low",
    };
  }

  const systemInstruction =
    language === "ha"
      ? SYSTEM_PROMPT + " Respond in Hausa language when the user writes in Hausa."
      : SYSTEM_PROMPT;

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    systemInstruction,
  });

  // Convert messages to Gemini format (roles: user / model)
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessage(lastMessage);
  const reply = result.response.text();

  const lower = reply.toLowerCase();
  let urgencyLevel = "low";
  if (/emergency|call 112|ambulance|immediately|severe|critical/.test(lower)) urgencyLevel = "emergency";
  else if (/urgent|hospital|doctor now|serious/.test(lower)) urgencyLevel = "high";
  else if (/consult|see a doctor|medical attention/.test(lower)) urgencyLevel = "moderate";

  return { reply, urgencyLevel };
}

// POST /api/ai/chat
router.post("/chat", protect, async (req, res) => {
  try {
    const { message, sessionId, language = "en" } = req.body;

    let session;
    if (sessionId) session = await AISession.findById(sessionId);
    if (!session) {
      session = await AISession.create({
        user: req.user._id,
        language,
        title: message.slice(0, 50),
        messages: [],
      });
    }

    session.messages.push({ role: "user", content: message });

    const history = session.messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
    const { reply, urgencyLevel } = await getAIReply(history, language);

    session.messages.push({ role: "assistant", content: reply });
    await session.save();

    res.json({ success: true, sessionId: session._id, reply, urgencyLevel });
  } catch (err) {
    console.error("AI chat error:", err.message);
    const msg = err.message?.includes("API_KEY_INVALID") || err.message?.includes("API key")
      ? "Invalid Gemini API key. Please update GEMINI_API_KEY in your .env file."
      : err.message || "AI service error";
    res.status(500).json({ success: false, message: msg });
  }
});

// POST /api/ai/symptom-check
router.post("/symptom-check", protect, async (req, res) => {
  try {
    const { symptoms, age, gender, language = "en" } = req.body;
    const prompt = `Patient info: age=${age || "unknown"}, gender=${gender || "unknown"}.
Symptoms: ${symptoms.join(", ")}.
Provide: 1) Brief analysis 2) Possible conditions (list) 3) Urgency level (low/medium/high) 4) Recommendations (list).
Respond ONLY with valid JSON in this exact format: { "analysis": "", "possibleConditions": [], "urgency": "", "recommendations": [] }`;

    let data;
    if (genAI) {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-8b",
        systemInstruction: SYSTEM_PROMPT,
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, "").trim();
      data = JSON.parse(text);
    } else {
      data = {
        analysis: "AI service not configured. Please consult a healthcare professional.",
        possibleConditions: [],
        urgency: "medium",
        recommendations: ["Please see a doctor for proper diagnosis"],
      };
    }

    const session = await AISession.create({
      user: req.user._id,
      language,
      title: `Symptom check: ${symptoms.slice(0, 2).join(", ")}`,
      messages: [
        { role: "user", content: `Symptom check: ${symptoms.join(", ")}` },
        { role: "assistant", content: JSON.stringify(data) },
      ],
    });

    res.json({ success: true, data: { ...data, sessionId: session._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/ai/sessions
router.get("/sessions", protect, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const total = await AISession.countDocuments({ user: req.user._id });
  const data = await AISession.find({ user: req.user._id })
    .select("-messages")
    .sort({ createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// GET /api/ai/sessions/:sessionId
router.get("/sessions/:sessionId", protect, async (req, res) => {
  const session = await AISession.findById(req.params.sessionId);
  if (!session) return res.status(404).json({ success: false, message: "Session not found" });
  res.json({ success: true, data: session });
});

// DELETE /api/ai/sessions/:sessionId
router.delete("/sessions/:sessionId", protect, async (req, res) => {
  await AISession.findByIdAndDelete(req.params.sessionId);
  res.status(204).send();
});

module.exports = router;
