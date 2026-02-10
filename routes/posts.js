const Post = require("../models/post");
const router = require("express").Router();
const User = require("../models/user");
const { cacheMiddleware, clearCache } = require("../middleware/cache");

//create a post
router.post("/", async (req, res) => {
  try {
    console.log("Received post creation request:", req.body);

    if (!req.body.userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    console.log("Post created successfully:", savedPost);
    
    // Clear relevant caches
    await clearCache('/api/posts/timeline');
    await clearCache('/api/posts/profile');
    
    res.status(200).json(savedPost);
  } catch (err) {
    console.log("Error creating post: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

// get a post (with caching - 5 minutes)
router.get("/:id", cacheMiddleware(300), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
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
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    if (post.userId === req.body.userId) {
      await Post.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      
      // Clear relevant caches
      await clearCache('/api/posts');
      
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
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    if (req.body.userId === post.userId) {
      await Post.findByIdAndDelete(req.params.id);
      
      // Clear relevant caches
      await clearCache('/api/posts');
      
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
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      
      // Clear post cache
      await clearCache(`/api/posts/${req.params.id}`);
      
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      
      // Clear post cache
      await clearCache(`/api/posts/${req.params.id}`);
      
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

// get timeline posts (with caching - 2 minutes)
router.get("/timeline/all/:userId", cacheMiddleware(120), async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    if (!currentUser) {
      return res.status(404).json("User not found");
    }

    // Get user's own posts and posts from people they follow
    // If followings array is empty, show all posts (public feed)
    let posts;
    if (currentUser.followings && currentUser.followings.length > 0) {
      // Show posts from user and their followings
      posts = await Post.find({
        userId: { $in: [currentUser._id, ...currentUser.followings] },
      }).sort({ createdAt: -1 });
    } else {
      // Show all posts (public feed) if user doesn't follow anyone
      posts = await Post.find().sort({ createdAt: -1 });
    }

    res.status(200).json(posts);
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

// get user's all posts (with caching - 3 minutes)
router.get("/profile/:username", cacheMiddleware(180), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json("User not found");
    }

    const posts = await Post.find({ userId: user._id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

// search posts by username (with caching - 5 minutes)
router.get("/search", cacheMiddleware(300), async (req, res) => {
  try {
    const username = req.query.username;

    if (!username) {
      return res.status(400).json({ error: "Username query is required" });
    }

    console.log("Searching for posts by username:", username);

    // Find users matching the search query (case-insensitive)
    const users = await User.find({
      username: { $regex: username, $options: "i" },
    }).select("_id");

    if (users.length === 0) {
      console.log("No users found");
      return res.status(200).json([]);
    }

    // Get all posts from matched users
    const userIds = users.map((user) => user._id);
    const posts = await Post.find({
      userId: { $in: userIds },
    }).sort({ createdAt: -1 });

    console.log(`Found ${posts.length} posts from ${users.length} users`);
    res.status(200).json(posts);
  } catch (err) {
    console.log("Search error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
