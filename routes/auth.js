const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

//Register
router.post("/register", async (req, res) => {
  try {
    //generate bcrypted password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashPassword,
    });

    //send response
    res.status(200).json(newUser);
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

//Login

router.post("/login", async (req, res) => {
  //find user
  try {
    const user = await User.findOne({ where: { username: req.body.username } });

    if (!user) {
      return res.status(404).send("Username Not Found");
    }

    //validate password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).send("Wrong Password");
    }

    //send response
    res.status(200).json(user);
  } catch (err) {
    console.log("Error: ", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
