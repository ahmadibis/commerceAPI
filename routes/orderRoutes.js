/** @format */


const { getAllOrders, getSingleOrder, updateOrder, createOrder, getCurrentUserOrders } = require("../controller/orderController");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const router = require("express").Router();

router
  .route("/")
  .get([authenticateUser, authorizePermissions("admin")], getAllOrders)
  .post(authenticateUser,createOrder);
router.route("/showAllMyOrders").get(authenticateUser,getCurrentUserOrders);
router
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);



module.exports = router