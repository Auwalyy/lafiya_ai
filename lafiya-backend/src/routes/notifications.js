const router = require("express").Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

// GET /api/notifications
router.get("/", protect, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const filter = { user: req.user._id };
  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);
  res.json({ success: true, unreadCount, notifications, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// PUT /api/notifications/read-all
router.put("/read-all", protect, async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true });
});

// DELETE /api/notifications/clear-all
router.delete("/clear-all", protect, async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  res.json({ success: true });
});

// PUT /api/notifications/:id/read
router.put("/:id/read", protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
});

// DELETE /api/notifications/:id
router.delete("/:id", protect, async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = router;
