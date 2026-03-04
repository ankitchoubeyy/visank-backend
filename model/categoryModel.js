const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description too long"],
    },

    image: {
      type: String, // Cloudinary URL
      default: null,
    },

    publicId: {
      type: String, // Cloudinary public ID for deletion
      default: null,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Generate slug automatically
categorySchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  let slug = slugify(this.name, {
    lower: true,
    strict: true,
    trim: true,
  });

  // ensure slug uniqueness
  let existingCategory = await mongoose.models.Category.findOne({ slug });

  let counter = 1;

  while (existingCategory) {
    slug = `${slug}-${counter}`;
    existingCategory = await mongoose.models.Category.findOne({ slug });
    counter++;
  }

  this.slug = slug;

  next();
});

// Indexes for performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1, sortOrder: 1 });
categorySchema.index({ isActive: 1 });

// Hide unnecessary fields in response
categorySchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
