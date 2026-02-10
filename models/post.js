const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      maxlength: 500,
    },
    img: {
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

// ⚡ Database Indexes for Performance Optimization

// 1. Index for finding posts by user (used in profile pages and search)
PostSchema.index({ userId: 1 });

// 2. Index for sorting by creation date (used in timeline/feeds)
PostSchema.index({ createdAt: -1 });

// 3. Compound index for user posts sorted by date (most common query)
PostSchema.index({ userId: 1, createdAt: -1 });

// 4. Index for finding posts by multiple users (timeline queries)
PostSchema.index({ userId: 1, createdAt: -1, _id: 1 });

module.exports = mongoose.model("Post", PostSchema);
