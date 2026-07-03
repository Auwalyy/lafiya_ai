const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    type: { type: String, default: "in-person" },
    scheduledAt: { type: Date, required: true },
    reason: { type: String, required: true },
    symptoms: [String],
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    doctorNotes: String,
    prescription: String,
    cancelReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
