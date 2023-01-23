const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "please provide a product name"],
      maxlength: [50, "name cant be more than 50 characters"],
    },
    price: {
      type: Number,
      required: [true, "please provide a price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "please provide a description"],
    },
    image: {
      type: String,
      required: [true, "please provide an image"],
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      required: [true, "provide product category"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      //another way to setup enum
      type: String,
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },

      required: [true, "please provide a company"],
    },
    colors: {
        type: [String],
        default: ['#222'],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
        type: Number,
        required: true,
        default: 15
    },
    averageRating: {
        type: Number,
        default: 0
        },
    numOfReviews: {
        type: Number,
        default: 0
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    },
  //we add what model want to connect as virtuals so we can be able to use populate method
  { timestamps: true, toJSON: {virtuals:true}, toObject:{virtuals:true} }
);



//setting up the populate reviews on the product a property that dont currently exist , sample from our get single product

//but with virtuals we cant query the data
ProductSchema.virtual('reviews', {
    //we want to reference the review model
    // a field that exist here and the review localField of id
    //and we set up a 2 way relationship in review which has a foreign field of product 
    //cos we want a list we set just one to false
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
    justOne: false,
    //to get a specifc type based on condition
    // match: {rating:5}
})

ProductSchema.pre('remove', async function (next) {

    //so reference the Review model and pick what references or links both schemas or models together
    //once we remove go to the reviews delete all the reviews associated with a product 
    await this.model("Review").deleteMany({product: this._id})
})


module.exports = mongoose.model("Product", ProductSchema)