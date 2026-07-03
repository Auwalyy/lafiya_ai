const router = require("express").Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

// GET /api/appointments/me
router.get("/me", protect, async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = { patient: req.user._id };
  if (status) filter.status = status;
  const total = await Appointment.countDocuments(filter);
  const data = await Appointment.find(filter)
    .populate({ path: "doctor", populate: { path: "user", select: "-password" } })
    .sort({ scheduledAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// GET /api/appointments/doctor
router.get("/doctor", protect, async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
  const { page = 1, limit = 20, status } = req.query;
  const filter = { doctor: doctor._id };
  if (status) filter.status = status;
  const total = await Appointment.countDocuments(filter);
  const data = await Appointment.find(filter)
    .populate("patient", "-password")
    .sort({ scheduledAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// GET /api/appointments/:id
router.get("/:id", protect, async (req, res) => {
  const appt = await Appointment.findById(req.params.id)
    .populate("patient", "-password")
    .populate({ path: "doctor", populate: { path: "user", select: "-password" } });
  if (!appt) return res.status(404).json({ success: false, message: "Appointment not found" });
  res.json({ success: true, data: appt });
});

// POST /api/appointments
router.post("/", protect, async (req, res) => {
  try {
    const appt = await Appointment.create({ ...req.body, patient: req.user._id });
    await Notification.create({
      user: req.user._id,
      title: "Appointment Booked",
      message: `Your appointment has been booked for ${new Date(req.body.scheduledAt).toLocaleString()}`,
      type: "appointment",
    });
    res.status(201).json({ success: true, data: appt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/appointments/:id/confirm
router.put("/:id/confirm", protect, async (req, res) => {
  const appt = await Appointment.findByIdAndUpdate(req.params.id, { status: "confirmed" }, { new: true });
  res.json({ success: true, data: appt });
});

// PUT /api/appointments/:id/cancel
router.put("/:id/cancel", protect, async (req, res) => {
  const appt = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: "cancelled", cancelReason: req.body.reason },
    { new: true }
  );
  res.json({ success: true, data: appt });
});

// PUT /api/appointments/:id/complete
router.put("/:id/complete", protect, async (req, res) => {
  const appt = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: "completed", ...req.body },
    { new: true }
  );
  res.json({ success: true, data: appt });
});

module.exports = router;
