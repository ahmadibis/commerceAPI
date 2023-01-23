const mongoose = require("mongoose")

//storing cart data in local storage on the frontend
//storing cart data in db using express sessions
//double check if your data matches and prices withj your db 
//on checkout proceed to stripe 
//setup the order and proceed with payment 
//

const SingleOrderItem = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true,
  },
});
const OrderSchema = new mongoose.Schema(
  {
    tax: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    //we could pass in a schema
    orderItems: [SingleOrderItem],
    status: {
      type: String,
      enum: ["pending", "failed", "paid", "delivered", "cancelled"],
      default: "pending",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    clientSecret: { type: String, required: true },
    paymentId: { type: String },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Order', OrderSchema)