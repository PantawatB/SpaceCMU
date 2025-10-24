import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { upload } from "../middleware/upload";
import * as productController from "../controllers/productController";

const router = Router();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

// Protected routes (require authentication)
router.post(
  "/",
  authenticateToken,
  upload.single("image"),
  productController.createProduct
);
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
router.put(
  "/:id",
  authenticateToken,
  upload.single("image"),
  productController.updateProduct
);
router.delete("/:id", authenticateToken, productController.deleteProduct);

export default router;
