const mongoose = require("mongoose");

/* --------------------------
   ORDER ITEM SCHEMA
---------------------------*/

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variantSku: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    size: String,

    colorName: String,

    colorHex: String,

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    imageUrl: String,
  },
  { _id: true },
);

/* --------------------------
   ORDER SCHEMA
---------------------------*/

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: [orderItemSchema],

    /* --------------------------
     SHIPPING ADDRESS SNAPSHOT
  ---------------------------*/

    shippingAddress: {
      fullName: { type: String, required: true },

      phone: { type: String, required: true },

      addressLine1: { type: String, required: true },

      addressLine2: String,

      city: { type: String, required: true },

      state: { type: String, required: true },

      postalCode: { type: String, required: true },

      country: { type: String, default: "India" },
    },

    /* --------------------------
     PAYMENT
  ---------------------------*/

    paymentMethod: {
      type: String,
      enum: ["COD", "Razorpay", "Stripe", "Wallet"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
      index: true,
    },

    paymentDetails: {
      transactionId: String,

      paymentGatewayOrderId: String,

      paymentGatewayPaymentId: String,

      amountPaid: Number,

      paidAt: Date,
    },

    /* --------------------------
     ORDER STATUS
  ---------------------------*/

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
      index: true,
    },

    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],

    /* --------------------------
     PRICING
  ---------------------------*/

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /* --------------------------
     COUPON / PROMO
  ---------------------------*/

    couponCode: String,

    /* --------------------------
     SHIPPING TRACKING
  ---------------------------*/

    trackingNumber: String,

    shippedAt: Date,

    deliveredAt: Date,

    cancelledAt: Date,

    notes: String,

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* --------------------------
   ORDER NUMBER GENERATION
---------------------------*/

orderSchema.pre("save", function (next) {
  if (this.orderNumber) return next();

  const date = new Date();

  const prefix =
    "CLOTH-" +
    date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0") +
    "-";

  const random = Math.floor(100000 + Math.random() * 900000);

  this.orderNumber = prefix + random;

  next();
});

/* --------------------------
   INDEXES
---------------------------*/

orderSchema.index({ user: 1, createdAt: -1 });

orderSchema.index({ orderStatus: 1 });

orderSchema.index({ paymentStatus: 1 });

orderSchema.index({ "items.variantSku": 1 });

/* --------------------------
   HIDE SOFT DELETED ORDERS
---------------------------*/

orderSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
