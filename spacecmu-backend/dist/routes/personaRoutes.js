"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const personaController_1 = require("../controllers/personaController");
const router = (0, express_1.Router)();
// ต้อง login ก่อนถึงใช้ persona ได้
router.use(auth_1.authenticateToken);
// 📌 สร้าง persona
// POST /api/personas
router.post("/", personaController_1.createPersona);
// 📌 แก้ persona
// PUT /api/personas/me
router.put("/me", personaController_1.updatePersona);
// 📌 ลบ persona
// DELETE /api/personas/:id
router.delete("/:id", personaController_1.deletePersona);
// 📌 ดู persona ทั้งหมดของ user
// GET /api/personas
router.get("/", personaController_1.listPersonas);
// 📌 ดู persona เดี่ยว
// GET /api/personas/:id
router.get("/:id", personaController_1.getPersona);
exports.default = router;
