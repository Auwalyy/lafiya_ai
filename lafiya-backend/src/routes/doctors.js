const router = require("express").Router();
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// GET /api/doctors
router.get("/", protect, async (req, res) => {
  const { page = 1, limit = 20, specialization, isVerified } = req.query;
  const filter = {};
  if (specialization) filter.specialization = new RegExp(specialization, "i");
  if (isVerified !== undefined) filter.isVerified = isVerified === "true";
  const total = await Doctor.countDocuments(filter);
  const data = await Doctor.find(filter)
    .populate("user", "-password")
    .skip((+page - 1) * +limit)
    .limit(+limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// GET /api/doctors/me
router.get("/me", protect, async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "-password");
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
  res.json({ success: true, data: doctor });
});

// GET /api/doctors/:id/availability
router.get("/:id/availability", protect, async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
  res.json({ success: true, data: doctor.availability || [] });
});

// GET /api/doctors/:id
router.get("/:id", protect, async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate("user", "-password");
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
  res.json({ success: true, data: doctor });
});

// POST /api/doctors/register
router.post("/register", protect, upload.single("profileImage"), async (req, res) => {
  try {
    const exists = await Doctor.findOne({ user: req.user._id });
    if (exists) return res.status(400).json({ success: false, message: "Doctor profile already exists" });

    const body = { ...req.body, user: req.user._id };
    if (req.file) body.profileImage = `/uploads/${req.file.filename}`;
    if (body.qualifications && typeof body.qualifications === "string")
      body.qualifications = JSON.parse(body.qualifications);
    if (body.availability && typeof body.availability === "string")
      body.availability = JSON.parse(body.availability);
    if (body.languages && typeof body.languages === "string")
      body.languages = JSON.parse(body.languages);

    const doctor = await Doctor.create(body);
    await User.findByIdAndUpdate(req.user._id, { role: "doctor" });
    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/doctors/me
router.put("/me", protect, async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate({ user: req.user._id }, req.body, { new: true });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/doctors/:id/rate
router.post("/:id/rate", protect, async (req, res) => {
  try {
    const { rating } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    const newCount = doctor.reviewCount + 1;
    const newRating = ((doctor.rating * doctor.reviewCount) + rating) / newCount;
    doctor.rating = Math.round(newRating * 10) / 10;
    doctor.reviewCount = newCount;
    await doctor.save();
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
