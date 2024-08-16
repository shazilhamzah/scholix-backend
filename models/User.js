const mongoose = require("mongoose");
const { Schema } = mongoose;
const jwt = require('jsonwebtoken');
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  cgpa: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

userSchema.methods.generateAuthToken = function() {
  const data = {
    user: {
      id: this.id,
    },
  };
  const token = jwt.sign(data, JWT_SECRET);
  return token;
};

module.exports = mongoose.model("user", userSchema);
