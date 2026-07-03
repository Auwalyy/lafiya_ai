const router = require("express").Router();
const HealthRecord = require("../models/HealthRecord");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// GET /api/health-records/vitals/timeline
router.get("/vitals/timeline", protect, async (req, res) => {
  const data = await HealthRecord.find({ user: req.user._id, type: "vitals" }).sort({ date: 1 });
  res.json({ success: true, data });
});

// GET /api/health-records/patient/:userId
router.get("/patient/:userId", protect, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const filter = { user: req.params.userId };
  const total = await HealthRecord.countDocuments(filter);
  const data = await HealthRecord.find(filter).sort({ date: -1 }).skip((+page - 1) * +limit).limit(+limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// GET /api/health-records
router.get("/", protect, async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  const filter = { user: req.user._id };
  if (type) filter.type = type;
  const total = await HealthRecord.countDocuments(filter);
  const data = await HealthRecord.find(filter).sort({ date: -1 }).skip((+page - 1) * +limit).limit(+limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// GET /api/health-records/:id
router.get("/:id", protect, async (req, res) => {
  const record = await HealthRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ success: false, message: "Record not found" });
  res.json({ success: true, data: record });
});

// POST /api/health-records
router.post("/", protect, upload.array("files", 5), async (req, res) => {
  try {
    const body = { ...req.body, user: req.user._id };
    if (req.files?.length) body.files = req.files.map((f) => `/uploads/${f.filename}`);
    if (body.vitals && typeof body.vitals === "string") body.vitals = JSON.parse(body.vitals);
    const record = await HealthRecord.create(body);
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/health-records/:id
router.put("/:id", protect, async (req, res) => {
  const record = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: record });
});

// DELETE /api/health-records/:id
router.delete("/:id", protect, async (req, res) => {
  await HealthRecord.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// POST /api/health-records/:id/share
router.post("/:id/share", protect, async (req, res) => {
  const record = await HealthRecord.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { sharedWith: req.body.doctorId } },
    { new: true }
  );
  res.json({ success: true, data: record });
});

module.exports = router;
