import skillRequestModel from "../models/skillrequestModel.js";

// Create a skill request
export const createSkillRequest = async (req, res) => {
  try {
    const { receiver, skillOffered, skillRequested, message, timeOffered = 1 } = req.body;
    const senderId = req.user.id;

    console.log("skillRequestController: Creating new skill exchange request", {
      senderId,
      receiver,
      skillOffered,
      skillRequested,
      timeOffered
    });

    // Validate receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      console.error("skillRequestController: Receiver not found");
      return res.status(404).json({ success: false, msg: "Receiver not found" });
    }

    // Get sender's skill details
    const senderUser = await User.findById(senderId);
    const offeredSkill = senderUser.skillsOffered.find(s => s._id.toString() === skillOffered);
    if (!offeredSkill) {
      console.error("skillRequestController: Offered skill not found in user's profile");
      return res.status(400).json({ success: false, msg: "Invalid offered skill" });
    }

    // Create skill request
    const newRequest = new skillRequestModel({
      sender: senderId,
      receiver,
      skillOffered: offeredSkill.name,
      skillRequested,
      message,
      timeOffered
    });

    const saved = await newRequest.save();
    console.log("skillRequestController: Skill request saved:", saved);

    // Create initial message with status
    const chatId = [senderId, receiver].sort().join('_');
    const initialMessage = new Message({
      sender: senderId,
      recipient: receiver,
      chatId,
      content: message,
      status: "pending",
      skill: null // optional: link to skill
    });

    await initialMessage.save();
    console.log("skillRequestController: Initial message created for chat");

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error("skillRequestController: Error creating skill request:", error);
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
