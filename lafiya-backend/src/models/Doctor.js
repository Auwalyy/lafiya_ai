const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialization: { type: String, required: true },
    subSpecialization: String,
    licenseNumber: String,
    yearsOfExperience: { type: Number, default: 0 },
    qualifications: [{ degree: String, institution: String, year: Number }],
    bio: String,
    languages: [String],
    consultationFee: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isAvailableForTelemedicine: { type: Boolean, default: false },
    availability: [{ day: String, startTime: String, endTime: String }],
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    location: String,
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    profileImage: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
