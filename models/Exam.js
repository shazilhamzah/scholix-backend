const mongoose = require('mongoose');
const {Schema} = mongoose;

const ExamSchema = new Schema({
    subject:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'subject',
        required:true,
    },
    examType:{
        type:String,
        required:true,
    },
    totalMarks:{
        type:Number,
        required:true,
    },
    obtainedMarks:{
        type:Number,
        required:true,
    },
    averageMarks:{
        type:Number,
        required:true,
    },
    weightage:{
        type:Number,
        required:true,
    },
    percentage:{
        type:Number,
        required:true,
    }
});

const Exam = mongoose.model("exam",ExamSchema);
module.exports = Exam;