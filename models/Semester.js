const mongoose = require('mongoose');
const { Schema } = mongoose;

const semesterSchema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true,
    },
    name:{
        type:String,
        required:true,

    },
    sgpa:{
        type:Number,
        default:0
    },
    active:{
        type:Boolean,
        default:false
    }
});


semesterSchema.index({ user: 1, name: 1 }, { unique: true });

const Semester = mongoose.model("Semester", semesterSchema);
module.exports = Semester;