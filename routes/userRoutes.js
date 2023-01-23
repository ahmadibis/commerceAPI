const { getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword } = require("../controller/userController")

const router = require("express").Router()

const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

//so we want to do a role based authentication , in the end we want our routes authenticated 
//but specific routes to be accessed by our admin

//the arrangement is important so it gives us expected result so we have our id as the last 
//cos it needs to encoubter the other routes before the id

//order matters you authenticate first before authorizing based on they roles 
router.route("/").get(authenticateUser, authorizePermissions('admin'), getAllUsers);

router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser/:id").patch(authenticateUser,updateUser);
router.route("/updateUserPassword/:id").patch(authenticateUser, updateUserPassword);

router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router