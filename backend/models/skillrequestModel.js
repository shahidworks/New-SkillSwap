import mongoose from "mongoose";

const skillRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skillOffered: {
      type: String,
      required: true,
    },
    skillRequested: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    timeOffered: {
      type: Number, // in hours
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true, // includes createdAt and updatedAt
  }
);

const skillRequestModel =
  mongoose.models.SkillRequest ||
  mongoose.model("SkillRequest", skillRequestSchema);

export default skillRequestModel;
