const { uploadImage, getAllProducts, getSingleProduct, createProduct, updateProduct, deleteProduct } = require("../controller/productController");
const { getSingleProductReviews } = require("../controller/reviewController");
const { authenticateUser, authorizePermissions } = require("../middleware/authentication")

const router = require("express").Router()


router
  .route("/")
  .post([authenticateUser, authorizePermissions("admin")], createProduct)
    .get(getAllProducts);
  
router
  .route("/uploadImage")
    .post(authenticateUser, authorizePermissions("admin"), uploadImage);
  
router
  .route("/:id")
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions("admin")], updateProduct)
  .delete([authenticateUser, authorizePermissions("admin")], deleteProduct );


router.route("/:id/reviews").get(getSingleProductReviews);


module.exports = router