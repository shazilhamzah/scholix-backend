const mongoose = require('mongoose');
const { Schema } = mongoose;

const semesterSchema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    sgpa:{
        type:Number,
        default:0
    },
    name:{
        type:String,
        required:true
    }
});


module.exports = mongoose.model('semester',semesterSchema);