
//we have to be able to prevent other users from being able to get access to another persons
//id profile
//we can fix it by checking permissions , req.user , 

const { UnauthorizedError } = require("../errors")

const checkPermissions = (requestUser, resourceUserId) => {
    //unless the user role is not admin you dont want them to see

    if (requestUser.roles === "admin") {
        return
    }
    if (requestUser.userId === resourceUserId.toString()) {
        return
    }

    throw new UnauthorizedError("not authorized to access this route")

}


module.exports = {checkPermissions}