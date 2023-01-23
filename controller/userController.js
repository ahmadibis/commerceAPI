const User = require("../models/User")
const {NotFoundError, BadRequestError, UnauthorizedError} = require("../errors")
const { StatusCodes } = require("http-status-codes")
const createTokenUser = require("../utils/createTokenUser")
const { attachCookiesToResponse, checkPermissions } = require("../utils")

const getAllUsers = async (req, res) => {
    //select the users with role users and remove the password 
    console.log(req.user)
    const users = await User.find({ roles: 'user' }).select("-password")
    res.status(StatusCodes.OK).json({ users });
}

//we have to be able to prevent other users from being able to get access to another persons
//id profile
//we can fix it by checking permissions , req.user , so only the admin is able to view the resource

const getSingleUser = async (req, res) => {
    const { id: userId } = req.params
    const user = await User.findOne({ _id: userId }).select("-password");
    if (!user) {
      throw new NotFoundError(` user not found with user ${userId}`);
    }

    //req.user and the id property on the resource
    checkPermissions(req.user, user._id )

  res.status(StatusCodes.OK).json({ user });
};

//useful to be able to get the user current data on when we login we can redirect to this route 
//so when i login i can have access directly to the user data, so whoever i login as i just get the user from the token 
//that are not sensitive we dont even need to query the user 
const showCurrentUser = async (req, res) => {

    res.status(StatusCodes.OK).json({user: req.user });
}

const updateUser = async (req, res) => {
    const { name, email } = req.body
    
    if (!name || !email) {
        throw new BadRequestError("please provide name/email")
    }
    const user = await User.findOneAndUpdate({ _id: req.params.id }, {email, name}, { new: true, runValidators: true })

    //creating  token cos frontend needs to know about the change say we are changing the name 
    //it needs to know the update
    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user:tokenUser });
};

const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const { id: userId } = req.params
    
    if (!oldPassword || !newPassword) {
      throw new BadRequestError("input both values");
    }
    const user = await User.findOne({ _id: userId })
    const isPasswordCorrect = await user.comparePassword(oldPassword) 

    if (!isPasswordCorrect) {
      throw new UnauthorizedError("please provide a new password");
    }

    user.password = newPassword
    //this triggers the pre save hook so you might always want to take care of that 
    await user.save()
    res.status(StatusCodes.OK).json( {msg: 'updated successfully'} );
};


module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};