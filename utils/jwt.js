const jwt = require("jsonwebtoken")

const createJWT = ({ payload }) => {
    const token = jwt.sign({payload}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME })
    return token
}

//verify the token that we will be using in our middleware, returns our payload 
const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET)

const attachCookiesToResponse = ({res, user}) => {
    const expiryTime = 1000 * 60 * 60 * 24
    const token = createJWT({ payload: user });
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + expiryTime),
        secure: process.env.NODE_ENV === 'production',
      signed: true
    });
}

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};