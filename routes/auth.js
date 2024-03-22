const router = require('express').Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");


//Register
router.post("/register",async (req,res)=>{
    try{
        //generate bcrypted password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password,salt);
        
        //create new user
        const newUser = new User({
            username:req.body.username,
            email:req.body.email,
            password:hashPassword,
        })
        
        //save user and respond
        const user = await newUser.save();
        res.status(200).json(user);
    }
    catch (err){
        console.log("Error: ",err.message);
    }
})


//Login

router.post("/login",async(req,res)=>{
    //find user
    try{
        const user = await User.findOne({username:req.body.username});
        !user ? res.status(404).send("Username Not Found") : "";

        //validate password
        const validPassword = await bcrypt.compare(req.body.password,user.password);
        !validPassword ? res.status(400).send("Wrong Password") : "";

        //send response
        res.status(200).json(user);
    }
    catch(err){
        console.log("Error: ",err.message);
    }
})


module.exports = router;