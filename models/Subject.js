const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubjectSchema = new Schema({
    semester:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'semester',
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    creditHrs:{
        type:Number,
        required:true,
    },
    subjectType:{
        type:String,
        required:true,
    },
    grading:{
        type:String,
        required:true,
    },
    grade:{
        type:String,
        default:"-"
    },
    teacherName:{
        type:String,
        default:""
    }
})


module.exports = mongoose.model('subject',SubjectSchema);