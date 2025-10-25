import { Router, RequestHandler } from "express";
import { authenticateToken } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { uploadFile } from "../controllers/uploadController";

const router = Router();

// POST /api/uploads
// 'file' คือชื่อ field ที่ Frontend ต้องส่งมา
router.post(
  "/",
  authenticateToken as RequestHandler,
  upload.single("file"),
  (req, res, next) => {
    // Handle multer errors
    if (req.file || !req.body.error) {
      return uploadFile(req, res);
    }
    next();
  }
);

// Error handler for multer
router.use((err: any, req: any, res: any, next: any) => {
  if (err) {
    return res.status(400).json({
      message: err.message || "File upload error",
      error: err.message,
    });
  }
  next();
});

export default router;
