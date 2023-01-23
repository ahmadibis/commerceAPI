const mongoose = require("mongoose")

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
      maxlength: 100,
    },
    comment: { type: String, required: [true, "Please provide review title"] },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

//user can only leave one review per product 
ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

//attach to the class rather than use methods which attach to the instance
//way to setup our aggregate pipeline
ReviewSchema.statics.calculateAverageRating = async function (productId) {
    const result = await this.aggregate([
        {
    $match: {
      product: productId,
    },
  },
  {
    $group: {
      _id: null,
      averageRating: {
        $avg: "$rating",
      },
      numOfReviews: {
        $sum: 1,
      },
    },
  },
    ])
    
    try {
        //how to access the product model and its fields in the model
        await this.model("Product").findOneAndUpdate(
          { _id: productId },
          {
            averageRating: Math.ceil(result[0]?.averageRating || 0),
            numOfReviews: result[0]?.averageRating || 0,
          }
        );
    } catch (error) {
         console.log(error);
    }
   
}

ReviewSchema.post('save', async function () {
    await this.constructor.calculateAverageRating(this.product)
    console.log("post save")
})

ReviewSchema.post("remove", async function () {
    await this.constructor.calculateAverageRating(this.product);
    console.log("post remove");
});


module.exports = mongoose.model("Review", ReviewSchema);

