const mongoose = require("mongoose");
const slugify = require("slugify");

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    size: {
      type: String,
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"],
    },

    color: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      hexCode: {
        type: String,
        match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      },
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    price: {
      type: Number,
      min: 0,
    },

    salePrice: {
      type: Number,
      min: 0,
    },

    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        altText: String,
      },
    ],
  },
  { _id: true },
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      maxlength: 160,
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    salePrice: {
      type: Number,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    brand: {
      type: String,
      trim: true,
      index: true,
    },

    gender: {
      type: String,
      enum: ["Men", "Women", "Kids", "Unisex"],
      required: true,
      index: true,
    },

    material: String,

    careInstructions: String,

    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        altText: String,
      },
    ],

    variants: [variantSchema],

    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        index: true,
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    seoTitle: String,

    seoDescription: String,

    weight: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/* --------------------------
   AUTO GENERATE UNIQUE SLUG
---------------------------*/

productSchema.pre("save", async function (next) {
  if (!this.isModified("title")) return next();

  let slug = slugify(this.title, {
    lower: true,
    strict: true,
    trim: true,
  });

  let existing = await mongoose.models.Product.findOne({ slug });

  let counter = 1;

  while (existing) {
    slug = `${slug}-${counter}`;
    existing = await mongoose.models.Product.findOne({ slug });
    counter++;
  }

  this.slug = slug;

  next();
});

/* --------------------------
   PRICE VALIDATION
---------------------------*/

productSchema.pre("save", function (next) {
  if (this.salePrice && this.salePrice > this.basePrice) {
    return next(new Error("Sale price cannot be greater than base price"));
  }

  next();
});

/* --------------------------
   TOTAL STOCK VIRTUAL
---------------------------*/

productSchema.virtual("totalStock").get(function () {
  return this.variants.reduce((total, variant) => {
    return total + variant.stock;
  }, 0);
});

/* --------------------------
   SEARCH INDEX
---------------------------*/

productSchema.index({
  title: "text",
  description: "text",
  brand: "text",
  tags: "text",
});

productSchema.index({
  category: 1,
  gender: 1,
  status: 1,
  isFeatured: 1,
});

productSchema.index({
  "variants.sku": 1,
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
