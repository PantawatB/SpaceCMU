import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
<<<<<<< HEAD
  getMyChats,
  createDirectChat,
  getChatMessages,
  sendMessage,
  deleteMessage,
=======
  findOrCreateChat,
  listMyChats,
  getChatMessages,
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
} from "../controllers/chatController";

const router = Router();

<<<<<<< HEAD
// All chat routes require authentication
router.use(authenticateToken);

// Chat management
router.get("/", getMyChats); // GET /api/chats - Get all user's chats
router.post("/direct", createDirectChat); // POST /api/chats/direct - Create direct chat

// Message management
router.get("/:chatId/messages", getChatMessages); // GET /api/chats/:chatId/messages - Get chat messages
router.post("/:chatId/messages", sendMessage); // POST /api/chats/:chatId/messages - Send message
router.delete("/messages/:messageId", deleteMessage); // DELETE /api/chats/messages/:messageId - Delete message
=======
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
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805

export default router;
