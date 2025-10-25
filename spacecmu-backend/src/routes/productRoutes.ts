import { Router, RequestHandler } from "express";
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
  authenticateToken as RequestHandler,
  upload.single("image"),
  productController.createProduct as RequestHandler
);
router.patch(
  "/:id/status",
  authenticateToken as RequestHandler,
  productController.updateProductStatus as RequestHandler
);
router.put(
  "/:id/image",
  authenticateToken as RequestHandler,
  productController.updateProductImage as RequestHandler
);
router.put(
  "/:id",
  authenticateToken as RequestHandler,
  upload.single("image"),
  productController.updateProduct as RequestHandler
);
router.delete(
  "/:id",
  authenticateToken as RequestHandler,
  productController.deleteProduct as RequestHandler
);

export default router;
