const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  bio: String,
  phone: String,
  photo: {
    filename: String,
    contentType: String,
    url: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: String,
  isPublic: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ["admin", "normal"],
    default: "normal",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
