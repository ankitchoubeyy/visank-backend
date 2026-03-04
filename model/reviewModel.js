const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        altText: String,
      },
    ],

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    helpfulVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* ---------------------------
   UNIQUE REVIEW PER USER
----------------------------*/

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

/* ---------------------------
   RATING FILTER INDEX
----------------------------*/

reviewSchema.index({ rating: 1 });

/* ---------------------------
   PRODUCT REVIEW QUERY INDEX
----------------------------*/

reviewSchema.index({
  product: 1,
  isApproved: 1,
  createdAt: -1,
});

/* ---------------------------
   HIDE DELETED REVIEWS
----------------------------*/

reviewSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
