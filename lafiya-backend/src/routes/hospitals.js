const router = require("express").Router();
const Hospital = require("../models/Hospital");
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// GET /api/hospitals/nearby
router.get("/nearby", protect, async (req, res) => {
  const { lat, lng, maxDistance = 10000 } = req.query;
  let data;
  if (lat && lng) {
    data = await Hospital.find({
      isActive: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [+lng, +lat] },
          $maxDistance: +maxDistance,
        },
      },
    }).limit(20);
  } else {
    data = await Hospital.find({ isActive: true }).limit(20);
  }
  res.json({ success: true, data });
});

// GET /api/hospitals
router.get("/", protect, async (req, res) => {
  const { page = 1, limit = 20, state, type } = req.query;
  const filter = { isActive: true };
  if (state) filter.state = new RegExp(state, "i");
  if (type) filter.type = type;
  const total = await Hospital.countDocuments(filter);
  const data = await Hospital.find(filter).skip((+page - 1) * +limit).limit(+limit);
  res.json({ success: true, data, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
});

// GET /api/hospitals/:id
router.get("/:id", protect, async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found" });
  res.json({ success: true, data: hospital });
});

// POST /api/hospitals
router.post("/", protect, requireRole("admin"), upload.single("image"), async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) body.image = `/uploads/${req.file.filename}`;
    if (body.phone && typeof body.phone === "string") body.phone = JSON.parse(body.phone);
    if (body.services && typeof body.services === "string") body.services = JSON.parse(body.services);
    if (body.specialties && typeof body.specialties === "string") body.specialties = JSON.parse(body.specialties);
    if (body.coordinates) {
      const [lng, lat] = JSON.parse(body.coordinates);
      body.location = { type: "Point", coordinates: [lng, lat] };
    }
    const hospital = await Hospital.create(body);
    res.status(201).json({ success: true, data: hospital });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/hospitals/:id
router.put("/:id", protect, requireRole("admin"), upload.single("image"), async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) body.image = `/uploads/${req.file.filename}`;
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, body, { new: true });
    res.json({ success: true, data: hospital });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/hospitals/:id
router.delete("/:id", protect, requireRole("admin"), async (req, res) => {
  await Hospital.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: "Hospital deactivated" });
});

// POST /api/hospitals/:id/rate
router.post("/:id/rate", protect, async (req, res) => {
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) return res.status(404).json({ success: false, message: "Not found" });
  const newCount = hospital.ratingCount + 1;
  hospital.rating = ((hospital.rating * hospital.ratingCount) + req.body.rating) / newCount;
  hospital.ratingCount = newCount;
  await hospital.save();
  res.json({ success: true, data: hospital });
});

module.exports = router;
