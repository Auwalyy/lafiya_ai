const router = require("express").Router();
const Comment = require("../models/Comment");
const { protect } = require("../middleware/auth");

// GET /api/comments?post=:postId
router.get("/", protect, async (req, res) => {
  const { post, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (post) filter.post = post;
  const total = await Comment.countDocuments(filter);
  const data = await Comment.find(filter)
    .populate("author", "-password")
    .sort({ createdAt: 1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// POST /api/comments
router.post("/", protect, async (req, res) => {
  try {
    const comment = await Comment.create({ ...req.body, author: req.user._id });
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/comments/:id
router.put("/:id", protect, async (req, res) => {
  const comment = await Comment.findByIdAndUpdate(req.params.id, { content: req.body.content }, { new: true });
  res.json({ success: true, data: comment });
});

// DELETE /api/comments/:id
router.delete("/:id", protect, async (req, res) => {
  await Comment.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// POST /api/comments/:id/like
router.post("/:id/like", protect, async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
  const liked = comment.likes.some((l) => l.toString() === req.user._id.toString());
  if (liked) comment.likes.pull(req.user._id);
  else comment.likes.push(req.user._id);
  await comment.save();
  res.json({ success: true, data: comment });
});

module.exports = router;
