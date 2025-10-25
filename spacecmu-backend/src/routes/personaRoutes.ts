import { Router, RequestHandler } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  createPersona,
  updatePersona,
  deletePersona,
  listPersonas,
  getPersona,
} from "../controllers/personaController";

const router = Router();

// ต้อง login ก่อนถึงใช้ persona ได้
router.use(authenticateToken as RequestHandler);

// 📌 สร้าง persona
// POST /api/personas
router.post("/", createPersona as RequestHandler);

// 📌 แก้ persona
// PUT /api/personas/me
router.put("/me", updatePersona as RequestHandler);

// 📌 ลบ persona
// DELETE /api/personas/:id
router.delete("/:id", deletePersona as RequestHandler);

// 📌 ดู persona ทั้งหมดของ user
// GET /api/personas
router.get("/", listPersonas as RequestHandler);

// 📌 ดู persona เดี่ยว
// GET /api/personas/:id
router.get("/:id", getPersona as RequestHandler);

export default router;
