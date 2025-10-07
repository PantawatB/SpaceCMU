import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getMyChats,
  createDirectChat,
  getChatMessages,
  sendMessage,
  deleteMessage,
  clearChatMessages,
  getChatParticipants,
} from "../controllers/chatController";

const router = Router();

// All chat routes require authentication
router.use(authenticateToken);

// Chat management
router.get("/", getMyChats); // GET /api/chats - Get all user's chats
router.post("/direct", createDirectChat); // POST /api/chats/direct - Create direct chat

// Message management
router.get("/:chatId/messages", getChatMessages); // GET /api/chats/:chatId/messages - Get chat messages
router.post("/:chatId/messages", sendMessage); // POST /api/chats/:chatId/messages - Send message
router.delete("/messages/:messageId", deleteMessage); // DELETE /api/chats/messages/:messageId - Delete message
router.delete("/:chatId/messages", clearChatMessages); // DELETE /api/chats/:chatId/messages - Clear all messages

// Chat info routes
router.get("/:chatId/participants", getChatParticipants); // GET /api/chats/:chatId/participants - Get chat participants

export default router;
