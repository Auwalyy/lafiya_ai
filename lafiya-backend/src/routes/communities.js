const router = require("express").Router();
const Community = require("../models/Community");
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// GET /api/communities
router.get("/", protect, async (req, res) => {
  const { page = 1, limit = 20, category, language } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (language) filter.language = language;
  const total = await Community.countDocuments(filter);
  const data = await Community.find(filter).skip((+page - 1) * +limit).limit(+limit);
  const withJoined = data.map((c) => ({
    ...c.toObject(),
    isJoined: c.members.some((m) => m.toString() === req.user._id.toString()),
  }));
  res.json({ success: true, data: withJoined, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// GET /api/communities/:id
router.get("/:id", protect, async (req, res) => {
  const c = await Community.findById(req.params.id);
  if (!c) return res.status(404).json({ success: false, message: "Community not found" });
  res.json({ success: true, data: { ...c.toObject(), isJoined: c.members.some((m) => m.toString() === req.user._id.toString()) } });
});

// GET /api/communities/:id/members
router.get("/:id/members", protect, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const c = await Community.findById(req.params.id).populate("members", "-password");
  if (!c) return res.status(404).json({ success: false, message: "Not found" });
  const start = (+page - 1) * +limit;
  const data = c.members.slice(start, start + +limit);
  res.json({ success: true, data, pagination: { total: c.members.length, page: +page, limit: +limit, pages: Math.ceil(c.members.length / +limit) } });
});

// POST /api/communities
router.post("/", protect, upload.single("coverImage"), async (req, res) => {
  try {
    const body = { ...req.body, createdBy: req.user._id, members: [req.user._id], memberCount: 1 };
    if (req.file) body.coverImage = `/uploads/${req.file.filename}`;
    if (body.rules && typeof body.rules === "string") body.rules = JSON.parse(body.rules);
    if (body.tags && typeof body.tags === "string") body.tags = JSON.parse(body.tags);
    const community = await Community.create(body);
    res.status(201).json({ success: true, data: community });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/communities/:id
router.put("/:id", protect, upload.single("coverImage"), async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) body.coverImage = `/uploads/${req.file.filename}`;
    const community = await Community.findByIdAndUpdate(req.params.id, body, { new: true });
    res.json({ success: true, data: community });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/communities/:id/join
router.post("/:id/join", protect, async (req, res) => {
  const c = await Community.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { members: req.user._id }, $inc: { memberCount: 1 } },
    { new: true }
  );
  res.json({ success: true, data: c });
});

// POST /api/communities/:id/leave
router.post("/:id/leave", protect, async (req, res) => {
  const c = await Community.findByIdAndUpdate(
    req.params.id,
    { $pull: { members: req.user._id }, $inc: { memberCount: -1 } },
    { new: true }
  );
  res.json({ success: true, data: c });
});

// POST /api/communities/:id/add-doctor
router.post("/:id/add-doctor", protect, async (req, res) => {
  const c = await Community.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { doctors: req.body.doctorId } },
    { new: true }
  );
  res.json({ success: true, data: c });
});

module.exports = router;
