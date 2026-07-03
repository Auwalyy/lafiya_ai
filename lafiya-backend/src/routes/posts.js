const router = require("express").Router();
const Post = require("../models/Post");
const Community = require("../models/Community");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// GET /api/posts
router.get("/", protect, async (req, res) => {
  const { page = 1, limit = 20, community, type } = req.query;
  const filter = {};
  if (community) filter.community = community;
  if (type) filter.type = type;
  const total = await Post.countDocuments(filter);
  const data = await Post.find(filter)
    .populate("author", "-password")
    .populate("community", "name")
    .sort({ createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// GET /api/posts/:id
router.get("/:id", protect, async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", "-password").populate("community", "name");
  if (!post) return res.status(404).json({ success: false, message: "Post not found" });
  res.json({ success: true, data: post });
});

// POST /api/posts
router.post("/", protect, upload.array("media", 5), async (req, res) => {
  try {
    const body = { ...req.body, author: req.user._id };
    if (req.files?.length) body.media = req.files.map((f) => `/uploads/${f.filename}`);
    if (body.tags && typeof body.tags === "string") body.tags = JSON.parse(body.tags);
    const post = await Post.create(body);
    await Community.findByIdAndUpdate(body.community, { $inc: { postCount: 1 } });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/posts/:id
router.put("/:id", protect, async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: post });
});

// DELETE /api/posts/:id
router.delete("/:id", protect, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// POST /api/posts/:id/like
router.post("/:id/like", protect, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: "Post not found" });
  const liked = post.likes.some((l) => l.toString() === req.user._id.toString());
  if (liked) post.likes.pull(req.user._id);
  else post.likes.push(req.user._id);
  await post.save();
  res.json({ success: true, data: post });
});

// POST /api/posts/:id/save
router.post("/:id/save", protect, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: "Post not found" });
  const saved = post.savedBy?.some((s) => s.toString() === req.user._id.toString());
  if (saved) post.savedBy.pull(req.user._id);
  else post.savedBy.push(req.user._id);
  await post.save();
  res.json({ success: true, data: post });
});

// POST /api/posts/:id/flag
router.post("/:id/flag", protect, async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { isFlagged: true, flagReason: req.body.reason },
    { new: true }
  );
  res.json({ success: true, data: post });
});

// POST /api/posts/:id/pin
router.post("/:id/pin", protect, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: "Post not found" });
  post.isPinned = !post.isPinned;
  await post.save();
  res.json({ success: true, data: post });
});

module.exports = router;
