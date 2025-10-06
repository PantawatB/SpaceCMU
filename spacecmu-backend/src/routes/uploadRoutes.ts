import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { uploadFile } from "../controllers/uploadController";

const router = Router();

// POST /api/uploads
// 'file' คือชื่อ field ที่ Frontend ต้องส่งมา
router.post("/", authenticateToken, upload.single("file"), uploadFile);

export default router;
