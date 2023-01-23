const mongoose = require('mongoose')
const validator = require("validator")
const bcrypt = require('bcryptjs')
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
      type: String,
      unique:true,
      required: [true, "please provide email"],
      validate: {
          validator: validator.isEmail,
          message: 'please provide email'
    }
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
    minlength: 3,
    },
  //to set up role based permissions
    roles: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
  }
});


UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})

//once we hash we also need to be able to compare whether the hashed password is same 
//we use the good old function key word cos we can have access to the this keyword which points to the present document in the function
//as opposed to the arrow function where we dont have access to the this keyword
UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

module.exports = mongoose.model("User", UserSchema)