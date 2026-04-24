const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: String,
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);