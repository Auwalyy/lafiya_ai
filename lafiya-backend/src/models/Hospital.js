const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, default: "general" },
    address: { type: String, required: true },
    lga: String,
    state: String,
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    phone: [String],
    email: String,
    services: [String],
    specialties: [String],
    emergencyAvailable: { type: Boolean, default: false },
    emergencyPhone: String,
    acceptsTelemedicine: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    image: String,
  },
  { timestamps: true }
);

hospitalSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Hospital", hospitalSchema);
