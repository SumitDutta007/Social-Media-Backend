const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === parseInt(req.params.id) || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        console.log("Error1: ", err.message);
        return res.status(500).json(err);
      }
    }

    try {
      await User.update(req.body, {
        where: { id: req.params.id },
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      console.log("Error2: ", err.message);
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === parseInt(req.params.id) || req.body.isAdmin) {
    try {
      await User.destroy({
        where: { id: req.params.id },
      });
      res.status(200).json("Account has been deleted");
    } catch (err) {
      console.log("Error: ", err.message);
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account");
  }
});

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;

  try {
    const user = userId
      ? await User.findByPk(userId)
      : await User.findOne({ where: { username: username } });

    if (!user) {
      return res.status(404).json("User not found");
    }

    const { password, updatedAt, ...other } = user.toJSON();
    res.status(200).json(other);
  } catch (err) {
    console.log("Error: ", err.message);
    return res.status(500).json(err);
  }
});
//get all users
router.get("/all", async (req, res) => {
  try {
    const users = await User.findAll({});
    res.status(200).json(users);
  } catch (err) {
    console.log("Error: ", err.message);
    return res.status(500).json(err);
  }
});

//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json("User not found");
    }

    const friends = await User.findAll({
      where: {
        id: { [Op.in]: user.followings },
      },
      attributes: ["id", "username", "profilePicture"],
    });

    res.status(200).json(friends);
  } catch (err) {
    console.log("Error: ", err.message);
    return res.status(500).json(err);
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== parseInt(req.params.id)) {
    try {
      const user = await User.findByPk(req.params.id);
      const currentUser = await User.findByPk(req.body.userId);

      if (!user || !currentUser) {
        return res.status(404).json("User not found");
      }

      if (!user.followers.includes(req.body.userId)) {
        // Add to followers and followings arrays
        await user.update({
          followers: [...user.followers, req.body.userId],
        });
        await currentUser.update({
          followings: [...currentUser.followings, parseInt(req.params.id)],
        });
        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("You already follow this user");
      }
    } catch (err) {
      console.log("Error: ", err.message);
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can't follow yourself");
  }
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== parseInt(req.params.id)) {
    try {
      const user = await User.findByPk(req.params.id);
      const currentUser = await User.findByPk(req.body.userId);

      if (!user || !currentUser) {
        return res.status(404).json("User not found");
      }

      if (user.followers.includes(req.body.userId)) {
        // Remove from followers and followings arrays
        await user.update({
          followers: user.followers.filter((id) => id !== req.body.userId),
        });
        await currentUser.update({
          followings: currentUser.followings.filter(
            (id) => id !== parseInt(req.params.id)
          ),
        });
        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("You don't follow this user");
      }
    } catch (err) {
      console.log("Error:", err.message);
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can't unfollow yourself");
  }
});

module.exports = router;
