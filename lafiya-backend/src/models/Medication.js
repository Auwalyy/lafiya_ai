const mongoose = require("mongoose");

const doseLogSchema = new mongoose.Schema({
  scheduledAt: Date,
  status: { type: String, enum: ["taken", "missed", "skipped"], default: "missed" },
  takenAt: Date,
});

const medicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    form: String,
    frequency: { type: String, required: true },
    times: [String],
    startDate: { type: Date, required: true },
    endDate: Date,
    prescribedBy: String,
    instructions: String,
    sideEffects: [String],
    pillsRemaining: Number,
    isActive: { type: Boolean, default: true },
    doseLogs: [doseLogSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medication", medicationSchema);
