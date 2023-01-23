const Product = require("../models/Product")
const {StatusCodes} = require("http-status-codes")
const { findOne, findOneAndUpdate } = require("../models/User")
const { NotFoundError, BadRequestError } = require("../errors")
const path = require("path")

//virtuals are properties that dont persist they logic just get used on the fly 

const createProduct = async (req, res) => {
    //attach userid whcih we can get from token to know who created it 
    req.body.user = req.user.userId
    const product = await Product.create(req.body)
    res.status(StatusCodes.CREATED).json({product})
} 

const getAllProducts = async (req, res) => {
    const products = await Product.find({})

  res.status(StatusCodes.OK).json({products, count: products.length})
}; 

const getSingleProduct = async (req, res) => {
    const { id: productId } = req.params
    //but with virtuals we cant query the data since it is a virtual property
    const product = await Product.findOne({ _id: productId }).populate("reviews");
    if (!product) {
        throw new NotFoundError(`no product with id ${productId}`)
    }
  res.status(StatusCodes.OK).json({ product });
}; 

const updateProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findOneAndUpdate(
      { _id: productId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
        throw new NotFoundError(`no product with id ${productId}`);
    }
  res.status(StatusCodes.OK).json({ product });
}; 

const deleteProduct = async (req, res) => {
   const { id: productId } = req.params;
   const product = await Product.findOne({ _id: productId });
    if (!product) {
    throw new NotFoundError(`no product with id ${productId}`);
    }

    //why we use .remove because if we are deleting a product then we dont need to haev reviews 
    //for that product anymore , using this approch it triggers the pre remove hook so we can delete the product 
    //and the reviews in there 
    await product.remove()
    res.status(StatusCodes.OK).json({msg: "product deleted"})
}; 

const uploadImage = async (req, res) => {
    console.log(req.files);

    if (!req.files) {
        throw new BadRequestError("no file uploaded")
    }

    const productImage = req.files.image;

    if (!productImage.mimetype.startsWith('image')) {
        throw new BadRequestError("please upload image");
    }

    const maxSize = 1024 * 1024

    if (productImage.size > maxSize) {
        throw new BadRequestError("please upload image smaller than 1mb");
    }

    const imagePath = path.join(__dirname, "../public/uploads/" + `${productImage.name}`)
    await productImage.mv(imagePath);
    res.status(StatusCodes.OK).json({image: `/uploads/${productImage.name}`})
}; 

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};