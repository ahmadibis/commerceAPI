const { login, register, logout } = require("../controller/authController")

const router = require("express").Router()

router.route("/login").post(login)
router.route("/register").post(register);
router.route("/logout").get(logout);


module.exports = router