/** @format */

const Product = require("../models/Product");
const Order = require("../models/Order")
const { StatusCodes } = require("http-status-codes");
const { findOne, findOneAndUpdate } = require("../models/User");
const { NotFoundError, BadRequestError } = require("../errors");
const path = require("path");
const { checkPermissions } = require("../utils");


const getAllOrders = async (req, res) => {
    const orders = await Order.find({})
    res.status(StatusCodes.OK).json({ orders });
}

const getSingleOrder = async (req, res) => {
    
    const {id: orderId} = req.params
    const order = await Order.findOne({ _id: orderId })
    if (!order) {
        throw new NotFoundError(`Not order id with id ${orderId}`)
    }

    checkPermissions(req.user, order.user);
    res.status(StatusCodes.OK).json({order})
}

const getCurrentUserOrders = async (req, res) => {
   
    const orders = await Order.find({user: req.user.userId})
    res.status(StatusCodes.OK).json({ orders, count: orders.length });
}

//goal of the backend is to ensure everythig is correct and if one piece is missing then we dont proceed
const fakeStripeAPI = async ({ amount, currency }) => {
    const client_secret = "someRandomValue"
    return {client_secret, amount}
}

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  //chek if any items present in cart
  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError("no cart items provided");
  }

  if (!tax || !shippingFee) {
    throw new BadRequestError("provide tax and shipping fee");
  }

  //test if the product exist using the product model

  //array to populate on each item

  let orderItems = [];
  let subtotal = 0;

  //use a for of loop cos we wont be able to do async operation in a map or forEach loop

  for (const item of cartItems) {
    //check each item in cart and see if it exist in db
    const dbProduct = await Product.findOne({ _id: item.product });

    if (!dbProduct) {
      throw new NotFoundError(`no product with id ${item.product}`);
    }

    //if the product exist we want to pull out name , price , image , _id
    const { name, price, image, _id } = dbProduct;

    const singleOrderItem = {
      //amount coming from frontend we want to ensure it is the one we have in db , so if manipulated on front
      //we ensure we take the backend db one
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    //add item to order
    orderItems = [...orderItems, singleOrderItem];
    //calculate the subtotal
    subtotal += item.amount * price;
  }
    
  //calculate total
  const total = tax + shippingFee + subtotal;

  //get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  //if succeccs paymentintent
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });
  console.log(orderItems);
  console.log(subtotal);
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.client_secret });
};

const updateOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const {paymentIntentId} = req.body
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`Not order id with id ${orderId}`);
  }

    checkPermissions(req.user, order.user);
    
    order.paymentIntentId = paymentIntentId
    order.status = 'paid'
    await order.save()
  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};