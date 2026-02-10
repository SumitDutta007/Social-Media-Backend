const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    desc: {
      type: String,
      maxlength: 50,
    },
  },
  { timestamps: true }
);

// ⚡ Database Indexes for Performance Optimization

// 1. Text index for full-text search on username
UserSchema.index({ username: 'text' });

// 2. Regular index for username search (case-insensitive queries)
UserSchema.index({ username: 1 });

// 3. Index for email lookups (authentication)
UserSchema.index({ email: 1 });

// 4. Compound index for common queries
UserSchema.index({ username: 1, email: 1 });

module.exports = mongoose.model("User", UserSchema);
