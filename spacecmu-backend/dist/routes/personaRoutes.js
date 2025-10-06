"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const personaController_1 = require("../controllers/personaController");
const router = (0, express_1.Router)();
<<<<<<< HEAD
// ต้อง login ก่อนถึงใช้ persona ได้
router.use(auth_1.authenticateToken);
// 📌 สร้าง persona
// POST /api/personas
router.post("/", personaController_1.createPersona);
// 📌 แก้ persona
// PUT /api/personas/:id
router.put("/:id", personaController_1.updatePersona);
// 📌 ลบ persona
// DELETE /api/personas/:id
router.delete("/:id", personaController_1.deletePersona);
// 📌 ดู persona ทั้งหมดของ user
// GET /api/personas
router.get("/", personaController_1.listPersonas);
// 📌 ดู persona เดี่ยว
// GET /api/personas/:id
router.get("/:id", personaController_1.getPersona);
=======
router.get('/me', auth_1.authenticateToken, personaController_1.getMyPersona);
router.post('/', auth_1.authenticateToken, personaController_1.upsertPersona);
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
exports.default = router;
