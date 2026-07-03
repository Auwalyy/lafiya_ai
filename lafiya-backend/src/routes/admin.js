const router = require("express").Router();
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Post = require("../models/Post");
const Appointment = require("../models/Appointment");
const { protect, requireRole } = require("../middleware/auth");

const isAdmin = [protect, requireRole("admin")];

// GET /api/admin/stats
router.get("/stats", ...isAdmin, async (req, res) => {
  const [totalUsers, totalDoctors, totalPosts, totalAppointments, pendingDoctors, flaggedPosts] =
    await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Post.countDocuments(),
      Appointment.countDocuments(),
      Doctor.countDocuments({ isVerified: false }),
      Post.countDocuments({ isFlagged: true }),
    ]);
  res.json({ success: true, data: { totalUsers, totalDoctors, totalPosts, totalAppointments, pendingDoctors, flaggedPosts } });
});

// GET /api/admin/doctors/pending
router.get("/doctors/pending", ...isAdmin, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const filter = { isVerified: false };
  const total = await Doctor.countDocuments(filter);
  const data = await Doctor.find(filter)
    .populate("user", "-password")
    .skip((+page - 1) * +limit)
    .limit(+limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// PUT /api/admin/doctors/:id/verify
router.put("/doctors/:id/verify", ...isAdmin, async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { isVerified: req.body.isVerified },
    { new: true }
  ).populate("user", "-password");
  res.json({ success: true, data: doctor });
});

// GET /api/admin/posts/flagged
router.get("/posts/flagged", ...isAdmin, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const filter = { isFlagged: true };
  const total = await Post.countDocuments(filter);
  const data = await Post.find(filter)
    .populate("author", "-password")
    .skip((+page - 1) * +limit)
    .limit(+limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// PUT /api/admin/posts/:id/approve
router.put("/posts/:id/approve", ...isAdmin, async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, { isFlagged: false }, { new: true });
  res.json({ success: true, data: post });
});

// DELETE /api/admin/posts/:id
router.delete("/posts/:id", ...isAdmin, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// PUT /api/admin/users/:id/toggle-active
router.put("/users/:id/toggle-active", ...isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, data: user });
});

// PUT /api/admin/users/:id/role
router.put("/users/:id/role", ...isAdmin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  res.json({ success: true, data: user });
});

// GET /api/admin/activity-logs
router.get("/activity-logs", ...isAdmin, async (req, res) => {
  // Placeholder — extend with a real ActivityLog model if needed
  res.json({ success: true, data: [] });
});

module.exports = router;
