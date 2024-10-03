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

const userOrderDetails = new Schema({
  userId: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  totalItem: {
    type: Number,
    required: true,
  },
  userOrderDetails: {
    username: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  userOrderCart: [
    {
      productId: {
        type: String,
        required: true,
      },
      productName: {
        type: String,
        required: true, 
      },
      productPrice: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("userOrderDetails", userOrderDetails);
