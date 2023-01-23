const CustomError = require("../errors")

const { isTokenValid } = require("../utils")

const authenticateUser = async (req, res, next) => {
    //check existence of token
    const token = req.signedCookies.token

    //if token not present
    if (!token) {
        throw new CustomError.UnauthenticatedError("invalid authentication")
    }

    try {
        //returns our payload from the signed token from the cookies
    // {
    //   payload: { name: 'temo', userId: '63cdcb64424bb2dd9e1a2f', roles: 'admin' },
    //   iat: 1674440703,
    //   exp: 1674527103
    // }
        const payload = isTokenValid(token)

        //attach the values from the verified token to the req.user
        //so we are creating a user property on the request object so we can access it anywhere in our app
        req.user = {
          name: payload.payload.name,
          userId: payload.payload.userId,
          roles: payload.payload.roles,
        };
         next();
    } catch (error) {
        throw new CustomError.UnauthenticatedError(
            "invalid authentication"
        );

    }
}

//setting up our rolebased permisions
//if we get that it is an admin role we pass it on as authorized else we throw error 

//we are returnining a function here because in our routes we expect a reference not a function invocation
//but we want to be able to pass dynamic roles e.g user admin owner based on their level of privileges 
//so in order to avoid the call back error and be able to specify the rights of the roles that can access 
//a specific route we return a function here
//so we grab all the roles from the middleware that we want to allow access to the route 
//so if we want only admins to access a certain route we just pass it in and check it against our specified user roles and grant the 
//privilege and move on else unauthorized 

//if the user is an admin and the role that can access the route is an admin that we pass in ad we do a check for 
//yes or no based on the answer we proceed and that is how to do a role based permission
const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.roles)) {
            throw new CustomError.UnauthorizedError('unauthrized to access this route ')
        }
         next();
    }
}


module.exports = { authenticateUser, authorizePermissions };