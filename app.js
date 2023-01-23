//allows us get access to environment variables
require("dotenv").config()

// a wrapper for our errors toavoid a=having numverous try catches so it will be applied auto to our cotrollers
require("express-async-errors")

const express = require("express")
const app = express();

//securrity

//set security related headers
const helmet = require("helmet")
const xss = require("xss-clean")
const rateLimit = require("express-rate-limit")
//prevent mongo injections
const mongoSanitize = require("express-mongo-sanitize")
const cors = require("cors")

//rest of the packages
const morgan = require('morgan')
const cookieParser = require("cookie-parser")
const fileUpload = require("express-fileupload")
//routes import 
const authRouter = require("../starter/routes/authRoutes")
const userRouter = require("../starter/routes/userRoutes")
const productRouter = require("../starter/routes/productRoutes")
const reviewRouter = require("../starter/routes/reviewRoutes");
const orderRouter = require("../starter/routes/orderRoutes")
//db
const connectDB = require("../starter/db/connect")
//middleware
const notFoundMiddleware = require("../starter/middleware/not-found")
const errorHandlerMiddleware = require("../starter/middleware/error-handler")

//behind a proxy we need to set the proxy
app.set('trust proxy', 1)
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60
}))
app.use(xss())
app.use(mongoSanitize())

//we can now have access to it from req.cookies, everytime the user/browser sends a request to our server 
//we can then use our isValidToken from our util to verify the token 
//WITH THIS PARAMETER WE ARE SIGNINING IT SO to access a signed cookie it is from req.signedCookies
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"))
//to allow us parse in data from the client
app.use(express.json())
app.use(fileUpload())


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

//middlewares that gets triggered if none of the paths match
app.use(notFoundMiddleware)
//we technically invoke this in existing route when throwing errors 
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000;

const start = async () => {
    
    try {
         await connectDB(process.env.MONGO_URI);
         app.listen(port, () => {
           console.log(`server started on port ${port}`);
         });
    } catch (error) {
        console.log(error);
    }
   
}

start()