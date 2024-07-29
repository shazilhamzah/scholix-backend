const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
var fetchSemester = require("../middleware/fetchSemester");
var fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

//? ADD A SUBJECT USING: POST "/api/subject/newsubject" WITH VALIDATIONS - LOGIN REQUIRED
router.post(
  "/newsubject",
  fetchUser,
  fetchSemester,
  [body("name", "Name must be atleast 2 characters.").isLength({ min: 2 })],
  async (req, res) => {
    try {
      let success = false;
      const { name, creditHrs, subjectType, grading,grade, teacherName } = req.body;
      const semesterID = req.semester.id;
      let subjectPresent = await Subject.findOne({
        name,
        semester: semesterID,
      });
      if (subjectPresent) {
        success=false;
        return res
          .status(400)
          .json({ error: "Sorry a subject with this name already exists!" ,success:success});
      }

      const result = validationResult(req);
      if (!result.isEmpty()) {
        success=false;
        return res.status(400).json({ errors: result.array(),success:success });
      }

      const newSubject = new Subject({
        semester: req.semester.id,
        name: name,
        creditHrs: creditHrs,
        subjectType: subjectType,
        grading: grading,
        grade:grade,
        teacherName: teacherName,
      });

      const savedSubject = await newSubject.save();
      success=true;
      res.json({savedSubject,success:success});
    } catch (error) {
      console.error(error.message);
      res.status(500).send({msg:"Some error occured!",success:false});
    }
  }
);

//? FETCH ALL SUBJECTS USING: GET "/api/subject/fetchsubjects" WITH VALIDATIONS - LOGIN REQUIRED
router.get("/fetchsubjects", fetchUser, fetchSemester, async (req, res) => {
  try {
    const subjects = await Subject.find({ semester: req.semester.id });
    res.json(subjects);
  } catch (error) {
    // CATCHING ERROR
    console.error(error.message);
    res.status(500).send("Some error occured!");
  }
});

//? ADDING GRADE TO SEMESTER: POST "/api/subject/addgrade" - LOGIN REQUIRED
router.post(
  "/addgrade/:id",
  [
    body("grade", "Grade is required").notEmpty(),
    body(
      "grade",
      "Grade be atleast 1 character and maximum 2 characters."
    ).isLength({
      min: 1,
      max: 2,
    }),
  ],
  fetchUser,
  fetchSemester,
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() });
    }
    try {
      const subjectID = req.params.id;
      const { grade } = req.body;
      let updated = await Subject.findByIdAndUpdate(
        subjectID,
        { grade },
        { new: true }
      );
      res.json(updated);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error!");
    }
  }
);

//? UPDATING SUBJECT USING: POST "/api/subject/updatesubject/:id" - LOGIN REQUIRED
router.post(
  "/updatesubject/:id",
  fetchUser,
  fetchSemester,
  async (req, res) => {
    try {
      const subjectID = req.params.id;
      const { name, creditHrs, subjectType, grading, teacherName } = req.body;
      const newSubject = {};
      if (name) {
        newSubject.name = name;
      }
      if (creditHrs) {
        newSubject.creditHrs = creditHrs;
      }
      if (subjectType) {
        newSubject.subjectType = subjectType;
      }
      if (grading) {
        newSubject.grading = grading;
      }
      if (teacherName) {
        newSubject.teacherName = teacherName;
      }

      // FINDING THE NOTE TO BE UPDATED
      let subject = await Subject.findById(subjectID);
      if (!subject) {
        return res.status(404).send("Subject not found!");
      }
      // if (subject.semester.user.toString() !== req.user.id) {
      //   return res.status(401).send("Changes not allowed!");
      // }

      subject = await Subject.findByIdAndUpdate(
        req.params.id,
        { $set: newSubject },
        { new: true }
      );
      res.json(subject);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured!");
    }
  }
);

//? DELETING SUBJECT USING: DELETE "/api/subject/deletesubject/:id" - LOGIN REQUIRED
router.delete("/deletesubject/:id", fetchUser,fetchSemester, async (req, res) => {
  try {
    const subjectID = req.params.id;

    // HANDLING IF SEMESTER NOT FOUND
    let subject = await Subject.findById(subjectID);
    if (!subject) {
      return res.status(404).json("Subject not found!");
    }

    // HANDLING IF USER IS NOT CORRECT
    subject = await Subject.findByIdAndDelete(subjectID);
    return res.json({
      success: "Subject successfully deleted!",
      subject: subject,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured!");
  }
});

module.exports = router;
