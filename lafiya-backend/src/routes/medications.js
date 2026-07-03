const router = require("express").Router();
const Medication = require("../models/Medication");
const { protect } = require("../middleware/auth");

// GET /api/medications/today
router.get("/today", protect, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const meds = await Medication.find({ user: req.user._id, isActive: true });
  const data = meds.map((med) => {
    const doses = med.times.map((time) => {
      const [h, m] = time.split(":").map(Number);
      const scheduledAt = new Date(today);
      scheduledAt.setHours(h, m, 0, 0);
      const log = med.doseLogs.find(
        (l) => Math.abs(new Date(l.scheduledAt) - scheduledAt) < 60000
      );
      return { time, taken: log?.status === "taken", scheduledAt, logId: log?._id };
    });
    return { ...med.toObject(), doses };
  });
  res.json({ success: true, data });
});

// GET /api/medications
router.get("/", protect, async (req, res) => {
  const { page = 1, limit = 20, isActive } = req.query;
  const filter = { user: req.user._id };
  if (isActive !== undefined) filter.isActive = isActive === "true";
  const total = await Medication.countDocuments(filter);
  const data = await Medication.find(filter).skip((+page - 1) * +limit).limit(+limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// GET /api/medications/:id/adherence
router.get("/:id/adherence", protect, async (req, res) => {
  const med = await Medication.findById(req.params.id);
  if (!med) return res.status(404).json({ success: false, message: "Not found" });
  const logs = med.doseLogs;
  const taken = logs.filter((l) => l.status === "taken").length;
  const total = logs.length || 1;
  const rate = Math.round((taken / total) * 100);
  let streak = 0;
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].status === "taken") streak++;
    else break;
  }
  res.json({ success: true, data: { rate, taken, missed: total - taken, streak } });
});

// GET /api/medications/:id
router.get("/:id", protect, async (req, res) => {
  const med = await Medication.findById(req.params.id);
  if (!med) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data: med });
});

// POST /api/medications
router.post("/", protect, async (req, res) => {
  try {
    const med = await Medication.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: med });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/medications/:id
router.put("/:id", protect, async (req, res) => {
  const med = await Medication.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: med });
});

// DELETE /api/medications/:id
router.delete("/:id", protect, async (req, res) => {
  await Medication.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// POST /api/medications/:id/log
router.post("/:id/log", protect, async (req, res) => {
  const med = await Medication.findById(req.params.id);
  if (!med) return res.status(404).json({ success: false, message: "Not found" });
  med.doseLogs.push({ ...req.body, takenAt: req.body.status === "taken" ? new Date() : undefined });
  await med.save();
  res.json({ success: true, data: med });
});

module.exports = router;
