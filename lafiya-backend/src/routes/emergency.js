const router = require("express").Router();
const Hospital = require("../models/Hospital");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

const EMERGENCY_CONTACTS = [
  { name: "Nigeria Emergency", number: "112", description: "National emergency number" },
  { name: "Police", number: "199", description: "Nigeria Police Force" },
  { name: "Fire Service", number: "01-7944079", description: "Lagos Fire Service" },
  { name: "NEMA", number: "0800-CALL-NEMA", description: "National Emergency Management Agency" },
  { name: "Red Cross Nigeria", number: "01-4618820", description: "Nigerian Red Cross Society" },
];

const FIRST_AID = {
  choking: {
    condition: "Choking",
    steps: [
      "Ask 'Are you choking?' — if they can't speak, act immediately",
      "Give 5 firm back blows between shoulder blades",
      "Give 5 abdominal thrusts (Heimlich maneuver)",
      "Alternate back blows and abdominal thrusts",
      "Call emergency services if object not dislodged",
    ],
    warning: "Do not perform blind finger sweeps in the mouth",
  },
  bleeding: {
    condition: "Severe Bleeding",
    steps: [
      "Apply direct pressure with clean cloth",
      "Keep pressure for at least 10 minutes",
      "Elevate the injured area above heart level",
      "Do not remove cloth — add more if soaked",
      "Call emergency services for severe bleeding",
    ],
    warning: "Use gloves if available to prevent infection",
  },
  burns: {
    condition: "Burns",
    steps: [
      "Cool the burn under cool running water for 20 minutes",
      "Remove jewelry near the burn",
      "Cover loosely with cling film or clean plastic bag",
      "Do not use ice, butter, or toothpaste",
      "Seek medical attention for large or deep burns",
    ],
    warning: "Do not burst blisters",
  },
  seizure: {
    condition: "Seizure",
    steps: [
      "Keep calm and time the seizure",
      "Clear the area of hard objects",
      "Cushion the head",
      "Do not restrain the person",
      "Place in recovery position after seizure ends",
      "Call emergency if seizure lasts more than 5 minutes",
    ],
    warning: "Never put anything in the person's mouth",
  },
  heartattack: {
    condition: "Heart Attack",
    steps: [
      "Call emergency services immediately",
      "Have the person sit or lie down comfortably",
      "Loosen tight clothing",
      "Give aspirin if available and not allergic",
      "Begin CPR if person becomes unresponsive",
    ],
    warning: "Do not leave the person alone",
  },
};

// GET /api/emergency/contacts
router.get("/contacts", protect, (req, res) => {
  res.json({ success: true, data: EMERGENCY_CONTACTS });
});

// GET /api/emergency/nearby-hospitals
router.get("/nearby-hospitals", protect, async (req, res) => {
  const { lat, lng } = req.query;
  let data;
  if (lat && lng) {
    data = await Hospital.find({
      isActive: true,
      emergencyAvailable: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [+lng, +lat] },
          $maxDistance: 20000,
        },
      },
    }).limit(10);
  } else {
    data = await Hospital.find({ isActive: true, emergencyAvailable: true }).limit(10);
  }
  res.json({ success: true, data });
});

// GET /api/emergency/first-aid/:condition
router.get("/first-aid/:condition", protect, (req, res) => {
  const guide = FIRST_AID[req.params.condition.toLowerCase()];
  if (!guide) return res.status(404).json({ success: false, message: "Guide not found" });
  res.json({ success: true, data: guide });
});

// POST /api/emergency/alert
router.post("/alert", protect, async (req, res) => {
  await Notification.create({
    user: req.user._id,
    title: "Emergency Alert Sent",
    message: req.body.message || "Emergency alert has been triggered",
    type: "emergency",
  });
  res.json({ success: true, message: "Emergency alert sent" });
});

module.exports = router;
