const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    variantSku: {
      type: String,
      required: true,
      index: true,
    },

    size: String,

    colorName: String,

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    priceAtAdd: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true },
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    items: [cartItemSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* ---------------------------
   CART TOTAL VIRTUAL
----------------------------*/

cartSchema.virtual("cartTotal").get(function () {
  return this.items.reduce((total, item) => {
    return total + item.priceAtAdd * item.quantity;
  }, 0);
});

/* ---------------------------
   INDEXES
----------------------------*/

cartSchema.index({ user: 1 });
cartSchema.index({ "items.product": 1 });

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
