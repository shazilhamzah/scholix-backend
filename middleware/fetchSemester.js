// middleware/fetchSemester.js
const Semester = require('../models/Semester');

const fetchSemester = async (req, res, next) => {
    const semesterId = req.header('semesterID');
    if (!semesterId) {
        return res.status(400).json({ error: "Semester ID is required" });
    }

    try {
        const semester = await Semester.findById(semesterId);
        if (!semester) {
            return res.status(404).json({ error: "Semester not found" });
        }

        // Ensure the semester belongs to the authenticated user
        if (semester.user.toString() !== req.user.id) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        req.semester = semester;
        next();
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = fetchSemester;
