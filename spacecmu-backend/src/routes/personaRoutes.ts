import { Router } from "express";
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
router.use(authenticateToken);

// 📌 สร้าง persona
// POST /api/personas
router.post("/", createPersona);

// 📌 แก้ persona
// PUT /api/personas/me
router.put("/me", updatePersona);

// 📌 ลบ persona
// DELETE /api/personas/:id
router.delete("/:id", deletePersona);

// 📌 ดู persona ทั้งหมดของ user
// GET /api/personas
router.get("/", listPersonas);

// 📌 ดู persona เดี่ยว
// GET /api/personas/:id
router.get("/:id", getPersona);

export default router;
