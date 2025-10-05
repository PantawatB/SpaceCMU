import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  findOrCreateChat,
  listMyChats,
  getChatMessages,
} from "../controllers/chatController";

const router = Router();

router.use(authenticateToken);

// ดึงรายการแชททั้งหมด
// GET /api/chats
router.get("/", listMyChats);

// เริ่มแชทใหม่/หาแชทเดิม
// POST /api/chats
router.post("/", findOrCreateChat);

// ดึงประวัติข้อความ
// GET /api/chats/:chatId/messages
router.get("/:chatId/messages", getChatMessages);

export default router;
