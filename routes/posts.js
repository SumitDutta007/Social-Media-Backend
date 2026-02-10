const Post = require("../models/post");
const router = require("express").Router();
const User = require("../models/user");
const { cacheMiddleware, clearCache } = require("../middleware/cache");
const { verifyToken, verifyAuthorization } = require("../middleware/auth");
const { uploadPost } = require("../config/cloudinary");

// CREATE POST - Protected route (requires authentication)
router.post("/", verifyToken, async (req, res) => {
  try {
    console.log("Received post creation request:", req.body);

    // Verify userId matches authenticated user
    if (req.body.userId !== req.user.id) {
      return res.status(403).json({ 
        error: "Authorization failed",
        message: "You can only create posts for your own account" 
      });
    }

    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    console.log("Post created successfully:", savedPost);
    
    // Clear relevant caches
    await clearCache('/api/posts/timeline');
    await clearCache('/api/posts/profile');
    
    res.status(201).json({
      message: "Post created successfully",
      post: savedPost
    });
  } catch (err) {
    console.log("Error creating post: ", err.message);
    res.status(500).json({ 
      error: "Post creation failed",
      message: err.message 
    });
  }
});

// UPLOAD POST IMAGE - Protected route
router.post("/upload", verifyToken, uploadPost.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: "No file uploaded",
        message: "Please select an image file" 
      });
    }

    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl: req.file.path
    });
  } catch (err) {
    console.log("Error uploading image: ", err.message);
    return res.status(500).json({ 
      error: "Upload failed",
      message: err.message 
    });
  }
});

// GET POST - Public route (with caching - 5 minutes)
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

// UPDATE POST - Protected route (user can update own post or admin can update any)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ 
        error: "Post not found",
        message: "The post you're trying to update doesn't exist" 
      });
    }

    // Check if user owns the post or is admin
    if (post.userId === req.user.id || req.user.isAdmin) {
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      
      // Clear relevant caches
      await clearCache('/api/posts');
      
      res.status(200).json({
        message: "The post has been updated",
        post: updatedPost
      });
    } else {
      res.status(403).json({ 
        error: "Access denied",
        message: "You can only update your own posts" 
      });
    }
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ 
      error: "Update failed",
      message: err.message 
    });
  }
});

// DELETE POST - Protected route (user can delete own post or admin can delete any)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ 
        error: "Post not found",
        message: "The post you're trying to delete doesn't exist" 
      });
    }

    // Check if user owns the post or is admin
    if (post.userId === req.user.id || req.user.isAdmin) {
      await Post.findByIdAndDelete(req.params.id);
      
      // Clear relevant caches
      await clearCache('/api/posts');
      
      res.status(200).json({
        message: "The post has been deleted successfully"
      });
    } else {
      res.status(403).json({ 
        error: "Access denied",
        message: "You can only delete your own posts" 
      });
    }
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ 
      error: "Deletion failed",
      message: err.message 
    });
  }
});

// LIKE/UNLIKE POST - Protected route (any authenticated user can like)
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ 
        error: "Post not found",
        message: "The post you're trying to like doesn't exist" 
      });
    }

    // Use user ID from JWT token instead of request body
    const userId = req.user.id;

    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      
      // Clear post cache
      await clearCache(`/api/posts/${req.params.id}`);
      
      res.status(200).json({
        message: "The post has been liked",
        likesCount: post.likes.length + 1
      });
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      
      // Clear post cache
      await clearCache(`/api/posts/${req.params.id}`);
      
      res.status(200).json({
        message: "The post has been unliked",
        likesCount: post.likes.length - 1
      });
    }
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ 
      error: "Like operation failed",
      message: err.message 
    });
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
