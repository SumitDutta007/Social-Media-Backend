const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/database");
const dotenv = require("dotenv");
const multer = require("multer");
const userRoute = require("./routes/users.js");
const authRoute = require("./routes/auth.js");
const postRoute = require("./routes/posts.js");
const path = require("path");
const cors = require("cors");

dotenv.config();

// Server configuration
const PORT = process.env.PORT || 8800;

// Connect to MongoDB Database
connectDB();

// CORS configuration to allow requests from Netlify
const corsOptions = {
  origin: ["http://localhost:3000", "https://social-med-007.netlify.app"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Middleware
app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));

// Local storage configuration for multer
const storage = multer.diskStorage({
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
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    return res.status(200).json({
      message: "File uploaded successfully",
      filename: req.body.name,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
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
