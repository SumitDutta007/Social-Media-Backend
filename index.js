const express = require("express")
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const multer = require("multer");
const userRoute = require("./routes/users.js");
const authRoute = require("./routes/auth.js");
const postRoute = require("./routes/posts.js");
const path = require("path");

dotenv.config();
//server
const PORT = 'https://social-media-backend-dwnj.onrender.com';

// Connect to DB
const linkDatabase = async () => {
    try{
        const connect = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB connected : ${connect.connection.host}`);
    }
    catch(err){
        console.log("Error: ", err.message);
    }
}
linkDatabase();

app.use("/images",express.static(path.join(__dirname,"public/images")));

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"public/images/posts");
    },
    filename:(req,file,cb)=>{
        cb(null,req.body.name);
    }

})

const upload = multer({storage:storage});
app.post("/api/upload",upload.single("file"),(req,res)=>{
    try{
        return res.status(200).json("File uploaded successfully");
    }
    catch(err){
        console.log(err);
    }
})

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

//Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
