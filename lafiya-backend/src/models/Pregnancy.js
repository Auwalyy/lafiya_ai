const mongoose = require("mongoose");

const pregnancySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastMenstrualPeriod: { type: Date, required: true },
    dueDate: Date,
    currentWeek: { type: Number, default: 0 },
    trimester: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    isHighRisk: { type: Boolean, default: false },
    riskFactors: [String],
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    antenatalVisits: [
      {
        date: Date,
        week: Number,
        weight: Number,
        bloodPressure: { systolic: Number, diastolic: Number },
        fetalHeartRate: Number,
        fundalHeight: Number,
        notes: String,
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
      },
    ],
    symptoms: [{ symptom: String, severity: String, date: Date, notes: String }],
    vaccinations: [{ vaccine: String, date: Date }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pregnancy", pregnancySchema);
