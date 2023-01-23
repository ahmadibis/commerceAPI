const {StatusCodes} = require("http-status-codes")

const User = require("../models/User")
const {BadRequestError, UnauthenticatedError} = require("../errors");
const { attachCookiesToResponse } = require("../utils");
const { use } = require("express/lib/router");
const createTokenUser = require("../utils/createTokenUser");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailAlreadyExist = await User.findOne({ email });

  if (emailAlreadyExist) {
    throw new BadRequestError("email in use already provide a new one ");
  }

  //first register user is an admin
  //another approach to set up admin

  //1. just send a postman request with the roles
  //2 destrucutre the body and select what you want to be in the db
  //3 use the below approach
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const roles = isFirstAccount ? "admin" : "user";

  //we'll refactor this token generation to utils so we can reuse over and over
    const user = await User.create({ name, email, password, roles });
    
    // const tokenUser = { name: user.name, userId: user._id, roles: user.roles };
    //refactored of the above tokenUser 
    const tokenUser = createTokenUser(user)

  //we'll refactor this token generation to utils so we can reuse over and over
    //const token = jwt.sign(tokenUser, "jwtSecret", { expiresIn: "1d" });
    
    //refactored piece from utils
    // const token = createJWT(tokenUser)

    //we'll attach our token to the cookie to send in the response , params. the name of cookie, 2.value, 3, expires , httponly

    // a more refactored piece is below line 43
    // const oneDay = 1000 * 60 * 60 * 24

    // res.cookie('token', token, {
    //     httpOnly: true,
    //     expires: new Date(Date.now() + oneDay)
    // })

    attachCookiesToResponse({ res, user: tokenUser })
    res.status(StatusCodes.CREATED).json({ user: tokenUser });
}


const login = async (req, res) => { 
    const { email, password } = req.body
    
    if (!email || !password) {
        throw new BadRequestError("please provide a valid email/password")
    }

    const user = await User.findOne({ email })
    
    if (!user) {
        throw new UnauthenticatedError("invalid credentials unauthorized")
    }

    //compare passwords coming from candidate we defind in user model 

    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
        throw new UnauthenticatedError("invalid credentials unauthorized");
    }

    //how to pass in argument if you are expecting multiple properties as objects
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });
};


const logout = async (req, res) => {
    //to logout we set the token cookie to null or some string value or empty string 'logout and set expires to the current time
    //just remove the cookie, we just set it to something since we dont care anymire 
    res.cookie('token', 'logout', {
        httpOnly: true, 
        expires: new Date(Date.now())
    })
    res.status(StatusCodes.OK).send('user logged out')
 };

module.exports = {
    register, login, logout
}