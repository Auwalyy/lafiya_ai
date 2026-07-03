const router = require("express").Router();
const Pregnancy = require("../models/Pregnancy");
const { protect } = require("../middleware/auth");

const calcWeekAndTrimester = (lmp) => {
  const weeks = Math.floor((Date.now() - new Date(lmp)) / (7 * 24 * 60 * 60 * 1000));
  const trimester = weeks <= 12 ? 1 : weeks <= 27 ? 2 : 3;
  const dueDate = new Date(new Date(lmp).getTime() + 280 * 24 * 60 * 60 * 1000);
  return { currentWeek: weeks, trimester, dueDate };
};

const MILESTONES = [
  { week: 4, title: "Implantation", description: "Embryo implants in uterine wall", babySize: "Poppy seed" },
  { week: 8, title: "Heartbeat", description: "Baby's heart is beating", babySize: "Raspberry" },
  { week: 12, title: "End of First Trimester", description: "Major organs formed", babySize: "Lime" },
  { week: 16, title: "Movement", description: "Baby may start moving", babySize: "Avocado" },
  { week: 20, title: "Halfway There", description: "Anatomy scan week", babySize: "Banana" },
  { week: 24, title: "Viability", description: "Baby can survive outside womb with support", babySize: "Corn" },
  { week: 28, title: "Third Trimester", description: "Baby opens eyes", babySize: "Eggplant" },
  { week: 32, title: "Rapid Growth", description: "Baby gaining weight fast", babySize: "Squash" },
  { week: 36, title: "Full Term Soon", description: "Baby is almost ready", babySize: "Honeydew" },
  { week: 40, title: "Due Date", description: "Baby is ready to be born", babySize: "Watermelon" },
];

// GET /api/pregnancy/milestones
router.get("/milestones", protect, (req, res) => {
  res.json({ success: true, data: MILESTONES });
});

// GET /api/pregnancy/my
router.get("/my", protect, async (req, res) => {
  const pregnancy = await Pregnancy.findOne({ user: req.user._id, isActive: true });
  if (!pregnancy) return res.status(404).json({ success: false, message: "No active pregnancy" });
  const { currentWeek, trimester } = calcWeekAndTrimester(pregnancy.lastMenstrualPeriod);
  pregnancy.currentWeek = currentWeek;
  pregnancy.trimester = trimester;
  res.json({ success: true, data: pregnancy });
});

// GET /api/pregnancy/history
router.get("/history", protect, async (req, res) => {
  const data = await Pregnancy.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data });
});

// POST /api/pregnancy
router.post("/", protect, async (req, res) => {
  try {
    await Pregnancy.updateMany({ user: req.user._id }, { isActive: false });
    const { currentWeek, trimester, dueDate } = calcWeekAndTrimester(req.body.lastMenstrualPeriod);
    const pregnancy = await Pregnancy.create({
      ...req.body,
      user: req.user._id,
      currentWeek,
      trimester,
      dueDate,
    });
    res.status(201).json({ success: true, data: pregnancy });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/pregnancy/:id
router.put("/:id", protect, async (req, res) => {
  const pregnancy = await Pregnancy.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: pregnancy });
});

// POST /api/pregnancy/:id/antenatal-visit
router.post("/:id/antenatal-visit", protect, async (req, res) => {
  const pregnancy = await Pregnancy.findByIdAndUpdate(
    req.params.id,
    { $push: { antenatalVisits: req.body } },
    { new: true }
  );
  res.json({ success: true, data: pregnancy });
});

// POST /api/pregnancy/:id/symptom
router.post("/:id/symptom", protect, async (req, res) => {
  const pregnancy = await Pregnancy.findByIdAndUpdate(
    req.params.id,
    { $push: { symptoms: { ...req.body, date: new Date() } } },
    { new: true }
  );
  res.json({ success: true, data: pregnancy });
});

// POST /api/pregnancy/:id/vaccination
router.post("/:id/vaccination", protect, async (req, res) => {
  const pregnancy = await Pregnancy.findByIdAndUpdate(
    req.params.id,
    { $push: { vaccinations: req.body } },
    { new: true }
  );
  res.json({ success: true, data: pregnancy });
});

module.exports = router;
