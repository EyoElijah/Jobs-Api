const mongoose = require("mongoose");

const JobSchema = mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "please provide a company name"],
      maxLength: 50,
    },
    position: {
      type: String,
      required: [true, "please provide a position"],
      maxLength: 100,
    },
    status: {
      type: String,
      enum: ["interview", "declinder", "pending"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
