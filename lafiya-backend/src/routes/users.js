const router = require("express").Router();
const User = require("../models/User");
const Community = require("../models/Community");
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

const paginate = (query, page = 1, limit = 20) =>
  query.skip((page - 1) * limit).limit(limit);

// GET /api/users/profile
router.get("/profile", protect, (req, res) => {
  res.json({ success: true, data: req.user });
});

// PUT /api/users/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const allowed = [
      "firstName","lastName","phone","dateOfBirth","gender","preferredLanguage",
      "location","healthConditions","emergencyContact","isAnonymousMode","anonymousName",
    ];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/users/avatar
router.put("/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/me
router.delete("/me", protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });
  res.json({ success: true, message: "Account deactivated" });
});

// GET /api/users/me/communities
router.get("/me/communities", protect, async (req, res) => {
  const communities = await Community.find({ members: req.user._id });
  res.json({ success: true, data: communities });
});

// GET /api/users/:id
router.get("/:id", protect, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user });
});

// GET /api/users
router.get("/", protect, requireRole("admin"), async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const total = await User.countDocuments();
  const data = await paginate(User.find(), +page, +limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
});

module.exports = router;
