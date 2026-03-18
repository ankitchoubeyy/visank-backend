const Product = require("../../../model/productModel");
const mongoose = require("mongoose");

/* -------------------------------------------------------
   CREATE PRODUCT
   POST /api/products
   Private (Admin)
------------------------------------------------------- */
const createProduct = async (req, res) => {
  try {
    /* -----------------------------------
       ALLOWED FIELDS (SECURITY)
    ------------------------------------ */

    const allowedFields = [
      "title",
      "description",
      "shortDescription",
      "basePrice",
      "salePrice",
      "discountPercentage",
      "category",
      "brand",
      "gender",
      "material",
      "careInstructions",
      "images",
      "variants",
      "specifications",
      "tags",
      "isFeatured",
      "isNewArrival",
      "status",
      "seoTitle",
      "seoDescription",
      "weight",
    ];

    const productData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        productData[field] = req.body[field];
      }
    });

    /* -----------------------------------
       REQUIRED FIELD VALIDATION
    ------------------------------------ */

    if (!productData.title) {
      return res.status(400).json({
        success: false,
        message: "Product title is required",
      });
    }

    if (!productData.description) {
      return res.status(400).json({
        success: false,
        message: "Product description is required",
      });
    }

    if (!productData.basePrice) {
      return res.status(400).json({
        success: false,
        message: "Base price is required",
      });
    }

    if (!productData.category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!productData.gender) {
      return res.status(400).json({
        success: false,
        message: "Gender is required",
      });
    }

    /* -----------------------------------
       IMAGE VALIDATION
    ------------------------------------ */

    if (!productData.images || productData.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    for (const image of productData.images) {
      if (!image.url) {
        return res.status(400).json({
          success: false,
          message: "Image URL is required",
        });
      }
    }

    /* -----------------------------------
       PRICE VALIDATION
    ------------------------------------ */

    if (
      productData.salePrice &&
      productData.salePrice > productData.basePrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Sale price cannot be greater than base price",
      });
    }

    /* -----------------------------------
       VARIANT VALIDATION
    ------------------------------------ */

    if (productData.variants && productData.variants.length > 0) {
      for (const variant of productData.variants) {
        if (!variant.sku) {
          return res.status(400).json({
            success: false,
            message: "Variant SKU is required",
          });
        }

        if (!variant.size) {
          return res.status(400).json({
            success: false,
            message: `Variant size is required for SKU ${variant.sku}`,
          });
        }

        if (!variant.color || !variant.color.name) {
          return res.status(400).json({
            success: false,
            message: `Color name is required for SKU ${variant.sku}`,
          });
        }

        if (variant.stock < 0) {
          return res.status(400).json({
            success: false,
            message: `Stock cannot be negative for SKU ${variant.sku}`,
          });
        }

        if (
          variant.salePrice &&
          variant.price &&
          variant.salePrice > variant.price
        ) {
          return res.status(400).json({
            success: false,
            message: `Sale price cannot exceed price for SKU ${variant.sku}`,
          });
        }

        if (variant.images && variant.images.length > 0) {
          for (const img of variant.images) {
            if (!img.url) {
              return res.status(400).json({
                success: false,
                message: `Variant image URL is required for SKU ${variant.sku}`,
              });
            }
          }
        }
      }
    }

    /* -----------------------------------
       SPECIFICATION VALIDATION
    ------------------------------------ */

    if (productData.specifications && productData.specifications.length > 0) {
      for (const spec of productData.specifications) {
        if (!spec.key || !spec.value) {
          return res.status(400).json({
            success: false,
            message: "Specification key and value are required",
          });
        }
      }
    }

    /* -----------------------------------
       CREATE PRODUCT
    ------------------------------------ */

    const product = new Product(productData);

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });

  } catch (error) {

    /* -----------------------------------
       DUPLICATE SKU ERROR
    ------------------------------------ */

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate SKU detected. SKU must be unique.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });

  }
};


/* -------------------------------------------------------
   GET ALL PRODUCTS
   GET /api/products
   Public / Admin
------------------------------------------------------- */

const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      gender,
      status,
      isFeatured,
      isNewArrival,
      minPrice,
      maxPrice,
      sort = "-createdAt",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    /* -------------------
       SEARCH
    ------------------- */

    if (search) {
      query.$text = { $search: search };
    }

    /* -------------------
       FILTERS
    ------------------- */

    if (category) query.category = category;
    if (gender) query.gender = gender;
    if (status) query.status = status;

    if (isFeatured !== undefined)
      query.isFeatured = isFeatured === "true";

    if (isNewArrival !== undefined)
      query.isNewArrival = isNewArrival === "true";

    /* -------------------
       PRICE FILTER
    ------------------- */

    if (minPrice || maxPrice) {
      query.basePrice = {};

      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    /* -------------------
       PAGINATION
    ------------------- */

    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * limitNumber;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
      },
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};


/* -------------------------------------------------------
   GET PRODUCT BY SLUG
   GET /api/products/slug/:slug
   Public
------------------------------------------------------- */

const getProductBySlug = async (req, res) => {
  try {

    const product = await Product.findOne({
      slug: req.params.slug,
      status: "published",
    }).populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};


/* -------------------------------------------------------
   GET PRODUCT BY ID
   GET /api/products/:id
   Private (Admin)
------------------------------------------------------- */

const getProductById = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id).populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};


/* -------------------------------------------------------
   UPDATE PRODUCT
   PUT /api/products/:id
   Private (Admin)
------------------------------------------------------- */

const updateProduct = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    Object.assign(product, req.body);

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate SKU detected",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Update failed",
    });

  }
};


/* -------------------------------------------------------
   DELETE PRODUCT (SOFT DELETE)
   DELETE /api/products/:id
   Private (Admin)
------------------------------------------------------- */

const deleteProduct = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.status = "archived";

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product archived successfully",
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};


/* -------------------------------------------------------
   EXPORTS
------------------------------------------------------- */

module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
};