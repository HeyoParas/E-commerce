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

const userCartSchema = new Schema({
  username: {
      type: String,
      required: true,
      unique: true
  },
  products: [
      {
          productId: {
              type:String,
              required: true,
              unique:false
          },
          quantity: {
              type: Number,
              required: true,
          }
      }
  ]
});

module.exports = mongoose.model("userCarts", userCartSchema);
