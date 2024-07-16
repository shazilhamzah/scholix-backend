// middleware/fetchSemester.js
const fetchSemester = require('../middleware/fetchSemester');
const Subject = require('../models/Subject');
require('../middleware/fetchSemester');

const fetchSubject = async (req, res, next) => {
    const subjectID = req.header('subjectID');
    if (!subjectID) {
        return res.status(400).json({ error: "Subject ID is required" });
    }

    try {
        const subject = await Subject.findById(subjectID);
        if (!subject) {
            return res.status(404).json({ error: "Subject not found" });
        }

        fetchSemester;

        req.subject = subject;
        next();
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = fetchSubject;
