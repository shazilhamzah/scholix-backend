const express = require("express");
const router = express.Router();
const Exam = require("../models/Exam");
var fetchSemester = require("../middleware/fetchSemester");
var fetchUser = require("../middleware/fetchUser");
var fetchSubject = require("../middleware/fetchSubject");
const { body, validationResult } = require("express-validator");

//? ADD A EXAM USING: POST "/api/exam/newexam" WITH VALIDATIONS - LOGIN REQUIRED
router.post(
  "/newexam",
  fetchUser,
  fetchSemester,
  fetchSubject,
  [
    body("examType", "Exam type must be atleast 3 characters.").isLength({
      min: 3,
    }),
    body("totalMarks", "Total marks must not be null.").notEmpty(),
    body("obtainedMarks", "Obtained marks must not be null.").notEmpty(),
    body("averageMarks", "Average marks must not be null.").notEmpty(),
    body("weightage", "Exam weightage marks must not be null.").notEmpty()
  ],
  async (req, res) => {
    try {
      const { examType, totalMarks, obtainedMarks, averageMarks, weightage } = req.body;
      const subjectID = req.subject.id;

      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const newExam = new Exam({
        subject: subjectID,
        examType:examType,
        totalMarks:totalMarks,
        obtainedMarks:obtainedMarks,
        averageMarks:averageMarks,
        weightage:weightage,
        percentage:(obtainedMarks/totalMarks)*100
      });

      const savedExam = await newExam.save();
      res.json(savedExam);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured!");
    }
  }
);


//? FETCH ALL EXAMS USING: GET "/api/exam/fetchexams" - LOGIN REQUIRED
router.get("/fetchexams", fetchUser, fetchSemester,fetchSubject, async (req, res) => {
  try {
    const exams = await Exam.find({ subject: req.subject.id });
    res.json(exams);
  } catch (error) {
    // CATCHING ERROR
    console.error(error.message);
    res.status(500).send("Some error occured!");
  }
});


//? UPDATING EXAM USING: POST "/api/exam/updateexam/:id" - LOGIN REQUIRED
router.post(
  "/updateexam/:id",
  fetchUser,
  fetchSemester,
  fetchSubject,
  [
    body("examType", "Exam type must be atleast 3 characters.").isLength({
      min: 3,
    }),
    body("totalMarks", "Total marks must not be null.").notEmpty(),
    body("obtainedMarks", "Obtained marks must not be null.").notEmpty(),
    body("averageMarks", "Average marks must not be null.").notEmpty(),
    body("weightage", "Exam weightage marks must not be null.").notEmpty()
  ],
  async (req, res) => {
    try {
      const examID = req.params.id;
      const { examType, totalMarks, obtainedMarks, averageMarks, weightage } = req.body;
      const newExam = {};
      if (examType) {
        newExam.examType = examType;
      }
      if (totalMarks) {
        newExam.totalMarks = totalMarks;
      }
      if (obtainedMarks) {
        newExam.obtainedMarks = obtainedMarks;
      }
      if (averageMarks) {
        newExam.averageMarks = averageMarks;
      }
      if (weightage) {
        newExam.weightage = weightage;
      }
      if(totalMarks&&obtainedMarks){
        newExam.percentage = ((obtainedMarks/totalMarks)*100)
      }

      // FINDING THE NOTE TO BE UPDATED
      let exam = await Exam.findById(examID);
      if (!exam) {
        return res.status(404).send("Exam not found!");
      }

      exam = await Exam.findByIdAndUpdate(
        req.params.id,
        { $set: newExam },
        { new: true }
      );
      res.json(exam);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured!");
    }
  }
);

//? DELEING EXAM USING: DELETE "/api/exam/deleteexam/:id" - LOGIN REQUIRED
router.delete("/deleteexam/:id", fetchUser,fetchSemester,fetchSubject, async (req, res) => {
  try {
    const examID = req.params.id;

    // HANDLING IF SEMESTER NOT FOUND
    let exam = await Exam.findById(examID);
    if (!exam) {
      return res.status(404).json("Exam not found!");
    }

    // HANDLING IF USER IS NOT CORRECT
    exam = await Exam.findByIdAndDelete(examID);
    return res.json({
      success: "Exam successfully deleted!",
      exam: exam,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured!");
  }
});

module.exports = router;