const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, default: "en" },
    isPrivate: { type: Boolean, default: false },
    rules: [String],
    tags: [String],
    coverImage: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }],
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Community", communitySchema);
