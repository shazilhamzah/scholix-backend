const express = require("express");
const router = express.Router();
const Semester = require("../models/Semester");
var fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

//? ADD A SEMESTER USING: POST "/api/semester/newsemester" WITH VALIDATIONS - LOGIN REQUIRED
router.post(
  "/newsemester",
  fetchuser,
  [body("name", "Name must be atleast 2 characters.").isLength({ min: 2 })],
  async (req, res) => {
    try {
      let success = false;
      const { name,sgpa } = req.body;
      const userID = req.user.id;
      let semesterPresent = await Semester.findOne({ name, user: userID });
      if (semesterPresent) {
        success = false;
        return res
          .status(400)
          .json({ error: "Sorry a semester with this name already exists!",success:success });
      }

      const result = validationResult(req);
      if (!result.isEmpty()) {
        success=false;
        return res.status(400).json({ errors: result.array(),success:success });
      }

      const newSemester = new Semester({
        user: req.user.id,
        name,
        sgpa,
      });
      success = true;
      const savedSemester = await newSemester.save();
      res.json({savedSemester,success:success});
    } catch (error) {
      console.error(error.message);
      res.status(500).send({msg:"Some error occured!",success:false});
    }
  }
);

//? FETCHING ALL SEMESTERS USING: GET "/api/semester/fetchsemesters" - LOGIN REQUIRED
router.get("/fetchsemesters", fetchuser, async (req, res) => {
  try {
    const notes = await Semester.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    // CATCHING ERROR
    console.error(error.message);
    res.status(500).send("Some error occured!");
  }
});

//? ADDING SGPA TO SEMESTER: POST "/api/semester/addsgpa" - LOGIN REQUIRED
router.post(
  "/addsgpa/:id",
  body("sgpa", "Enter valid SGPA").isFloat({ min: 0, max: 4 }),
  fetchuser,
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() });
    }
    try {
      const semesterID = req.params.id;
      const { sgpa } = req.body;
      let updated = await Semester.findByIdAndUpdate(
        semesterID,
        { sgpa },
        { new: true }
      ).select("-password");
      res.json(updated);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error!");
    }
  }
);

//? UPDATING SEMESTER USING: POST "/api/semester/updatesemester/:id" - LOGIN REQUIRED
router.post("/updatesemester/:id", fetchuser, async (req, res) => {
  try {
    const { name } = req.body;
    const newSemester = {};
    if (name) {
      newSemester.name = name;
    }

    // FINDING THE NOTE TO BE UPDATED
    let semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res.status(404).send("Semester not found!");
    }
    if (semester.user.toString() !== req.user.id) {
      return res.status(401).send("Changes not allowed!");
    }

    semester = await Semester.findByIdAndUpdate(
      req.params.id,
      { $set: newSemester },
      { new: true }
    );
    res.json(semester);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured!");
  }
});

//? DELETING SEMESTER USING: DELETE "/api/semester/deletesemester/:id" - LOGIN REQUIRED
router.delete("/deletesemester/:id", fetchuser, async (req, res) => {
  try {
    const semesterID = req.params.id;

    // HANDLING IF SEMESTER NOT FOUND
    let semester = await Semester.findById(semesterID);
    if (!semester) {
      return res.status(404).json("Semester not found!");
    }

    // HANDLING IF USER IS NOT CORRECT
    if (semester.user.toString() !== req.user.id) {
      return res.status(401).send("Deletion not allowed!");
    }

    semester = await Semester.findByIdAndDelete(semesterID);
    return res.json({success:"Semester successfully deleted!", semester:semester});
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured!");
  }
});


//? TOGGLE SEMESTER ACTIVE STATUS USING: POST "/api/semester/toggleactive/:id" - LOGIN REQUIRED
router.post("/toggleactive/:id", fetchuser, async (req, res) => {
  try {
    const semesterID = req.params.id;

    // FINDING THE SEMESTER TO BE UPDATED
    let semester = await Semester.findById(semesterID);
    if (!semester) {
      return res.status(404).send("Semester not found!");
    }

    // CHECKING USER AUTHORIZATION
    if (semester.user.toString() !== req.user.id) {
      return res.status(401).send("Unauthorized!");
    }

    // IF THE SEMESTER IS BECOMING ACTIVE
    if (!semester.active) {
      // DEACTIVATE ALL OTHER SEMESTERS FOR THIS USER
      await Semester.updateMany(
        { user: req.user.id, active: true },
        { $set: { active: false } }
      );
    }

    // TOGGLE ACTIVE STATUS
    semester.active = !semester.active;

    // SAVING THE UPDATED SEMESTER
    semester = await Semester.findByIdAndUpdate(
      semesterID,
      { active: semester.active },
      { new: true }
    );

    res.json(semester);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error!");
  }
});



module.exports = router;
