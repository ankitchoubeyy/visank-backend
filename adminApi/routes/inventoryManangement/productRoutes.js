const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductBySlug,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../../controllers/inventoryManagement/productControllers");

router.post("/createProduct", createProduct);
router.get("/getProducts", getProducts);
router.get("/getProductBySlug/:slug", getProductBySlug);
router.get("/getProductById/:id", getProductById);
router.put("/updateProduct/:id", updateProduct);
router.delete("/deleteProduct/:id", deleteProduct);

module.exports = router;