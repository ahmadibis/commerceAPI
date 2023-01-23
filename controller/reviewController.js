
const Review = require("../models/Review");
const Product = require("../models/Product")
const { StatusCodes } = require("http-status-codes");
const { findOne, findOneAndUpdate } = require("../models/User");
const { NotFoundError, BadRequestError } = require("../errors");
const path = require("path");
const { checkPermissions } = require("../utils");

const createReview = async (req, res) => {
    //when creating a review you want to create on a product but you need it 
    //to be attached to a product so we get that from the product id 
    const { product: productId } = req.body

    //check if it is a valid product 

    const isValidProduct = await Product.findOne({ _id: productId })
    
    if (!isValidProduct) {
        throw new NotFoundError(`no product with id ${productId}`)
    }

    //check if a user has already submitted a review
    const alreadySubmitted = await Review.findOne({
        product: productId,
        user: req.user.userId
    })

    if (alreadySubmitted) {
        throw new BadRequestError("user already submitted a review")
    }
    
    req.body.user = req.user.userId

    const review = await Review.create(req.body)
    res.status(StatusCodes.CREATED).json({review})
}

const getAllReviews = async (req, res) => {
    //populate is basically allowing us referencing certain properties from another document
    //we will specify the path i.e the model we are interested in and select what we want 
    //we can use it on models that we have connected together if not we'll need mongoose virtuals i.e reference product controller
    const reviews = await Review.find({}).populate({path:'product', select: 'name company price'}).populate({path:'user', select: 'name email'})
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
    const { id: reviewId } = req.params
    const review = await Review.findOne({ _id: reviewId })
    
    if (!review) {
        throw new NotFoundError(`no review with ${reviewId}`)
    }
  res.status(StatusCodes.CREATED).json({ review });
};

const updateReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;
    
    const review = await Review.findOne({ _id: reviewId });

    checkPermissions(req.user, review.user);

    review.rating = rating
    review.title = title
    review.comment = comment

    await review.save();

  res.status(StatusCodes.CREATED).json({ msg: "update review" });
};

const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const review = await Review.findOne({ _id: reviewId });

    checkPermissions(req.user, review.user)

    await review.remove()
  res.status(StatusCodes.CREATED).json({ msg: "review deleted" });
};


//alternative to virtuals to get all reviews belonging to a product so we can be able to query the objects and use the data
const getSingleProductReviews = async (req, res) => {
    const { id: productId } = req.params;
    const review = await Review.findOne({ product: productId });

    if (!review) {
        res.status(StatusCodes.OK).json({ msg: "not reviewd yet" });
    } else {
        res.status(StatusCodes.OK).json({ review, count: review.length });
    }
    
}

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};