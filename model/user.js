const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose
  .connect("mongodb://localhost:27017/Ecommerce")
  .then(() => {
    console.log("mongoose connected  successfully ");
  })
  .catch((err) => {
    console.log("cannot connected");
  });

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  role:{
    type:String,
    required:true,
    default:"user"
  },
  otp:
  {
    type:Number,
    default:null,
  }
});

module.exports = mongoose.model("users", userSchema);
