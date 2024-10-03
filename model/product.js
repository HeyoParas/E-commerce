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

const productSchema = new Schema({
  productNmae: {
    type: String
  },
  src: {
    type: String
  },
  description: {
    type: String
  },
  price: {
    type:Number
  },
  stock:{}

});

module.exports = mongoose.model("products", productSchema);
