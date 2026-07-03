const router = require("express").Router();
const Campaign = require("../models/Campaign");
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// GET /api/campaigns
router.get("/", protect, async (req, res) => {
  const { page = 1, limit = 20, type, language } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (language) filter.language = language;
  const total = await Campaign.countDocuments(filter);
  const data = await Campaign.find(filter)
    .populate("author", "firstName lastName")
    .sort({ createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// GET /api/campaigns/:id
router.get("/:id", protect, async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).populate("author", "firstName lastName");
  if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
  res.json({ success: true, data: campaign });
});

// POST /api/campaigns
router.post("/", protect, requireRole("admin"), upload.single("image"), async (req, res) => {
  try {
    const body = { ...req.body, author: req.user._id };
    if (req.file) body.image = `/uploads/${req.file.filename}`;
    const campaign = await Campaign.create(body);
    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/campaigns/:id/publish
router.put("/:id/publish", protect, requireRole("admin"), async (req, res) => {
  const campaign = await Campaign.findByIdAndUpdate(req.params.id, { isPublished: true }, { new: true });
  res.json({ success: true, data: campaign });
});

// DELETE /api/campaigns/:id
router.delete("/:id", protect, requireRole("admin"), async (req, res) => {
  await Campaign.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = router;
