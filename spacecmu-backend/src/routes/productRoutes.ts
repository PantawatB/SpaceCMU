import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import * as productController from "../controllers/productController";

const router = Router();

// Public routes
router.get("/", productController.getAllProducts);

// Protected routes (require authentication)
router.post("/", authenticateToken, productController.createProduct);
router.delete("/:id", authenticateToken, productController.deleteProduct);
router.patch(
  "/:id/status",
  authenticateToken,
  productController.updateProductStatus
);

export default router;
