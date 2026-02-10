const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { verifyToken, verifyAuthorization, verifyAdmin } = require("../middleware/auth");
const { uploadProfile, uploadCover } = require("../config/cloudinary");

// UPDATE USER - Protected route (user can update own account or admin can update any)
router.put("/:id", verifyAuthorization, async (req, res) => {
  if (req.body.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    } catch (err) {
      console.log("Error hashing password: ", err.message);
      return res.status(500).json({ 
        error: "Password update failed",
        message: err.message 
      });
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: "Account has been updated",
      user: updatedUser
    });
  } catch (err) {
    console.log("Error updating user: ", err.message);
    return res.status(500).json({ 
      error: "Update failed",
      message: err.message 
    });
  }
});

// UPLOAD PROFILE PICTURE - Protected route
router.post("/:id/upload-profile", verifyAuthorization, uploadProfile.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: "No file uploaded",
        message: "Please select an image file" 
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { profilePicture: req.file.path },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      imageUrl: req.file.path,
      user: updatedUser
    });
  } catch (err) {
    console.log("Error uploading profile picture: ", err.message);
    return res.status(500).json({ 
      error: "Upload failed",
      message: err.message 
    });
  }
});

// UPLOAD COVER PICTURE - Protected route
router.post("/:id/upload-cover", verifyAuthorization, uploadCover.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: "No file uploaded",
        message: "Please select an image file" 
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { coverPicture: req.file.path },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: "Cover picture uploaded successfully",
      imageUrl: req.file.path,
      user: updatedUser
    });
  } catch (err) {
    console.log("Error uploading cover picture: ", err.message);
    return res.status(500).json({ 
      error: "Upload failed",
      message: err.message 
    });
  }
});

// DELETE USER - Protected route (user can delete own account or admin can delete any)
router.delete("/:id", verifyAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Account has been deleted successfully"
    });
  } catch (err) {
    console.log("Error: ", err.message);
    return res.status(500).json({ 
      error: "Deletion failed",
      message: err.message 
    });
  }
});

// GET USER - Public route
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;

  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json("User not found");
    }

    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    console.log("Error: ", err.message);
    return res.status(500).json(err);
  }
});

//get all users
router.get("/all", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.log("Error: ", err.message);
    return res.status(500).json(err);
  }
});

// search users by username
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    console.log("Searching for users with query:", query);

    // Case-insensitive search for username
    const users = await User.find({
      username: { $regex: query, $options: "i" },
    })
      .limit(20)
      .select("-password -updatedAt"); // Don't send password

    console.log(`Found ${users.length} users`);
    res.status(200).json(users);
  } catch (err) {
    console.log("Search error: ", err.message);
    return res.status(500).json({ error: err.message });
  }
});

//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json("User not found");
    }

    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      }),
    );

    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (err) {
    console.log("Error: ", err.message);
    return res.status(500).json(err);
  }
});

//FOLLOW USER - Protected route (authenticated users can follow others)
router.put("/:id/follow", verifyToken, async (req, res) => {
  // Use user ID from JWT token
  const currentUserId = req.user.id;
  
  if (currentUserId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(currentUserId);

      if (!user || !currentUser) {
        return res.status(404).json({ 
          error: "User not found",
          message: "The user you're trying to follow doesn't exist" 
        });
      }

      if (!user.followers.includes(currentUserId)) {
        await user.updateOne({ $push: { followers: currentUserId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json({
          message: "User has been followed successfully",
          followersCount: user.followers.length + 1
        });
      } else {
        res.status(403).json({ 
          error: "Already following",
          message: "You already follow this user" 
        });
      }
    } catch (err) {
      console.log("Error: ", err.message);
      return res.status(500).json({ 
        error: "Follow operation failed",
        message: err.message 
      });
    }
  } else {
    return res.status(403).json({ 
      error: "Invalid operation",
      message: "You can't follow yourself" 
    });
  }
});

//UNFOLLOW USER - Protected route (authenticated users can unfollow others)
router.put("/:id/unfollow", verifyToken, async (req, res) => {
  // Use user ID from JWT token
  const currentUserId = req.user.id;
  
  if (currentUserId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(currentUserId);

      if (!user || !currentUser) {
        return res.status(404).json({ 
          error: "User not found",
          message: "The user you're trying to unfollow doesn't exist" 
        });
      }

      if (user.followers.includes(currentUserId)) {
        await user.updateOne({ $pull: { followers: currentUserId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json({
          message: "User has been unfollowed successfully",
          followersCount: user.followers.length - 1
        });
      } else {
        res.status(403).json({ 
          error: "Not following",
          message: "You don't follow this user" 
        });
      }
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(500).json({ 
        error: "Unfollow operation failed",
        message: err.message 
      });
    }
  } else {
    return res.status(403).json({ 
      error: "Invalid operation",
      message: "You can't unfollow yourself" 
    });
  }
});

module.exports = router;
