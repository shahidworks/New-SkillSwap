import skillRequestModel from "../models/skillRequestModel.js";

// Create a skill request
export const createSkillRequest = async (req, res) => {
  try {
    const { receiver, skillOffered, skillRequested, message, timeOffered } =
      req.body;

    if (!receiver || !skillOffered || !skillRequested || !timeOffered) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
    }

    const newRequest = new skillRequestModel({
      sender: req.user.id,
      receiver,
      skillOffered,
      skillRequested,
      message,
      timeOffered,
    });

    const saved = await newRequest.save();

    console.log("Skill request created:", saved);

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error("Error creating skill request:", error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get all requests sent by the current user
export const getSentRequests = async (req, res) => {
  try {
    const requests = await skillRequestModel
      .find({ sender: req.user.id })
      .populate("receiver", "name email");

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Get all requests received by the current user
export const getReceivedRequests = async (req, res) => {
  try {
    const requests = await skillRequestModel
      .find({ receiver: req.user.id })
      .populate("sender", "name email");

    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching received requests:", error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Accept or Reject a skill request
export const updateSkillRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid status provided" });
    }

    const request = await skillRequestModel.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, msg: "Request not found" });
    }

    console.log(`Skill request ${requestId} updated to status: ${status}`);

    res.json({ success: true, data: request });
  } catch (error) {
    console.error("Error updating skill request:", error);
    res.status(500).json({ success: false, msg: error.message });
  }
};
