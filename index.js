const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const sequelize = require("./config/database");
const dotenv = require("dotenv");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const userRoute = require("./routes/users.js");
const authRoute = require("./routes/auth.js");
const postRoute = require("./routes/posts.js");
const path = require("path");
const cors = require("cors");

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Server configuration
const PORT = process.env.PORT || 8800;

// Connect to PostgreSQL Database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connection established successfully");

    // Sync models (creates tables if they don't exist)
    // Use { alter: true } in development, { force: false } in production
    const syncMode =
      process.env.NODE_ENV === "production" ? { alter: true } : { alter: true };
    await sequelize.sync(syncMode);
    console.log("✅ Database synchronized successfully");
  } catch (err) {
    console.error("❌ Unable to connect to database:");
    console.error("Error Message:", err.message);
    console.error("Error Details:", err);
    console.error("DATABASE_URL present:", !!process.env.DATABASE_URL);
    process.exit(1);
  }
};
connectDB();

app.use(cors());
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Middleware
app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));

// Use Cloudinary storage if configured, otherwise use local storage
const storage = process.env.CLOUDINARY_CLOUD_NAME
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: "sociomed/posts",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        public_id: (req, file) => req.body.name || Date.now().toString(),
      },
    })
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "public/images/posts");
      },
      filename: (req, file, cb) => {
        cb(null, req.body.name);
      },
    });

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    // Return the Cloudinary URL if using Cloudinary, otherwise return filename
    const fileUrl = req.file.path || req.body.name;
    return res.status(200).json({
      message: "File uploaded successfully",
      filename: req.body.name,
      url: fileUrl,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Test endpoint
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "Social Media API is running", status: "OK" });
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

//Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
