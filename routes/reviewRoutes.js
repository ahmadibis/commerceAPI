/** @format */

const { getAllReviews, getSingleReview, createReview, updateReview, deleteReview } = require("../controller/reviewController");
const { authenticateUser } = require("../middleware/authentication");

const router = require("express").Router();


router.route("/").get(getAllReviews).post(authenticateUser,createReview)
router.route("/:id").get(getSingleReview).patch(authenticateUser, updateReview).delete(authenticateUser, deleteReview);


module.exports = router