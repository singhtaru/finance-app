import Group from "../models/Group.js";

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    // 1. Validate
    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    // 2. Generate simple invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // 3. Create group
    const group = await Group.create({
      name,
      createdBy: req.user._id,
      members: [req.user._id],
      inviteCode,
    });

    res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("CREATE GROUP ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Join group via invite code
// @route   POST /api/groups/join
// @access  Private
export const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ message: "Invite code is required" });
    }

    // 1. Find group by invite code
    const group = await Group.findOne({ inviteCode });

    if (!group) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    // 2. Check if user already in group
    const isMember = group.members.includes(req.user._id);
    if (isMember) {
      return res.status(400).json({ message: "User already in group" });
    }

    // 3. Add user to members
    group.members.push(req.user._id);
    await group.save();

    res.status(200).json({
      message: "Joined group successfully",
      group,
    });

  } catch (error) {
    console.error("JOIN GROUP ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Get groups of logged-in user
// @route   GET /api/groups
// @access  Private
export const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user._id,
    }).populate("members", "name email");

    res.status(200).json(groups);
  } catch (error) {
    console.error("GET GROUPS ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
};
