const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const sequelize = require("./config/database");
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

// Connect to PostgreSQL Database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connection established successfully");

    // Sync models (creates tables if they don't exist)
    // Use { alter: true } in development, { force: false } in production
    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized successfully");
  } catch (err) {
    console.error("❌ Unable to connect to database:", err.message);
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
    return res.status(200).json("File uploaded successfully");
  } catch (err) {
    console.log(err);
  }
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

//Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
