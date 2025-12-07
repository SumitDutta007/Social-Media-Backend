const Post = require("../models/post");
const router = require("express").Router();
const User = require("../models/user");
const { Op } = require("sequelize");

//create a post
router.post("/", async (req, res) => {
  try {
    const newPost = await Post.create(req.body);
    res.status(200).json(newPost);
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

// get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }
    res.status(200).json(post);
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

// update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    if (post.userId === req.body.userId) {
      await post.update(req.body);
      res.status(200).json("The post has been updated");
    } else {
      res.status(403).json("You can only update your post");
    }
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

// delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    if (req.body.userId === post.userId) {
      await post.destroy();
      res.status(200).json("The post has been deleted");
    } else {
      res.status(403).json("You can only delete your post");
    }
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

// like/dislike a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    if (!post.likes.includes(req.body.userId)) {
      await post.update({
        likes: [...post.likes, req.body.userId],
      });
      res.status(200).json("The post has been liked");
    } else {
      await post.update({
        likes: post.likes.filter((id) => id !== req.body.userId),
      });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

// get timeline posts
router.get("/timeline/all/:userId", async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.params.userId);
    if (!currentUser) {
      return res.status(404).json("User not found");
    }

    // Get user's own posts and posts from people they follow
    const posts = await Post.findAll({
      where: {
        userId: {
          [Op.in]: [currentUser.id, ...currentUser.followings],
        },
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(posts);
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

// get user's all posts
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
    });
    if (!user) {
      return res.status(404).json("User not found");
    }

    const posts = await Post.findAll({
      where: { userId: user.id },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(posts);
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
