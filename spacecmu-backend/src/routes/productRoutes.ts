import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import * as productController from "../controllers/productController";

const router = Router();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Protected routes (require authentication)
router.post("/", authenticateToken, productController.createProduct);
router.delete("/:id", authenticateToken, productController.deleteProduct);
router.patch(
  "/:id/status",
  authenticateToken,
  productController.updateProductStatus
);
router.put(
  "/:id/image",
  authenticateToken,
  productController.updateProductImage
);

export default router;
