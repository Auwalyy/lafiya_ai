const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    type: String,
    content: { type: String, required: true },
    language: { type: String, default: "en" },
    targetAudience: String,
    startDate: Date,
    endDate: Date,
    sponsor: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: false },
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
