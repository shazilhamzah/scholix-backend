const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchUser");
const { findByIdAndUpdate } = require("../models/Semester");
require("dotenv").config();
const passport = require("passport");
const JWT_SECRET = process.env.REACT_APP_JWT_SECRET;
const frontEndHost = process.env.REACT_APP_FRONTEND_HOST;

//! GOOGLE AUTH CONFIG START
// Redirect to Google for authentication
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    console.log("Google Auth Successful");
    const token = req.user.generateAuthToken();
    res.redirect(`${frontEndHost}/login?token=${token}`);
  }
);
//! GOOGLE AUTH CONFIG END

//? CREATE A USER USING: POST "/api/auth/createuser" WITH VALIDATIONS - NO LOGIN REQUIRED
router.post(
  "/createuser",
  [
    body("email", "Enter a valid email").isEmail(),
    body("name", "Enter a valid name").isLength({ min: 5 }),
    body("password", "Enter a valid password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    let success = false;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res
        .status(400)
        .json({ success, error: "Enter valid credentials." });
    }

    // CHECK WHETHER EMAIL ALREADY EXIST
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        success = false;
        return res.status(400).json({
          success,
          error: "Sorry a user with this email already exists!",
        });
      }

      // BCRYPTING + SALT
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // CREATING A USER HERE
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      //CONFIGURING JSON WEB TOKEN
      const data = {
        user: {
          id: user.id,
        },
      };
      success = true;
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ success, authToken });
    } catch (error) {
      // CATCHING ERROR
      console.error(error.message);
      res.status(500).send({ success: false, error: "Some error occured!" });
    }
  }
);

//? AUTHENTICATING A USER USING: POST "/api/auth/login" - NO LOGIN REQUIRED
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password can not be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    // ERROR VALIDATION FOR EMAIL AND PWD
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    // VERIFYING AUTHENTICATION
    const { email, password } = req.body;
    try {
      // CHECKING EMAIL EXISTANCE
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res.status(400).json({
          success,
          error: "Please try to login with correct credentials!",
        });
      } else if (!user.password) {
        success = false;
        return res.status(400).json({
          success,
          error: "Please try to login with your google account!",
        });
      }

      // MATCHING CORRECT PASSWORD
      const passwordComapare = await bcrypt.compare(password, user.password);
      if (!passwordComapare) {
        success = false;
        return res.status(400).json({
          success,
          error: "Please try to login with correct credentials!",
        });
      }

      // GAINING JSON WEB TOKEN ON AUTHENTICATION
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      // CATCHING ERROR
      console.error(error.message);
      res.status(500).send({ error: "Internal Server Error!" });
    }
  }
);

//? GETTING USER DATA: POST "/api/auth/getuser" - LOGIN REQUIRED
router.get("/getuser", fetchuser, async (req, res) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID).select("-password");
    res.send(user);
  } catch (error) {
    // CATCHING ERROR
    console.error(error.message);
    res.status(500).send("Internal Server Error!");
  }
});

//? ADDING CGPA TO USER: POST "/api/gpa/addcgpa" - LOGIN REQUIRED
router.post(
  "/addcgpa",
  body("cgpa", "Enter valid CGPA").isFloat({ min: 0, max: 4 }),
  fetchuser,
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() });
    }
    try {
      const userID = req.user.id;
      const { cgpa } = req.body;
      let updated = await User.findByIdAndUpdate(
        userID,
        { cgpa },
        { new: true }
      ).select("-password");
      res.json(updated);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error!");
    }
  }
);

module.exports = router;
