import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getMyChats,
  createDirectChat,
  createProductChat,
  getChatMessages,
  sendMessage,
  getNewMessages,
  deleteMessage,
  clearChatMessages,
  getChatParticipants,
} from "../controllers/chatController";

const router = Router();

// All chat routes require authentication
router.use(authenticateToken);

// Chat management
router.get("/", getMyChats); // GET /api/chats - Get all user's chats
router.post(
  "/direct",
  (req, res, next) => {
    console.log(" DIRECT CHAT ROUTE HIT WITH BODY:", req.body);
    console.log(
      " USER FROM REQ:",
      (req as any).user ? (req as any).user.id : "NO USER"
    );
    next();
  },
  createDirectChat
); // POST /api/chats/direct - Create direct chat
router.post("/product", createProductChat); // POST /api/chats/product - Contact product seller

// Message management
router.get("/:chatId/messages", getChatMessages); // GET /api/chats/:chatId/messages - Get chat messages (real-time)
router.get("/:chatId/messages/new", getNewMessages); // GET /api/chats/:chatId/messages/new - Poll for new messages
router.post("/:chatId/messages", sendMessage); // POST /api/chats/:chatId/messages - Send message
router.delete("/messages/:messageId", deleteMessage); // DELETE /api/chats/messages/:messageId - Delete message
router.delete("/:chatId/messages", clearChatMessages); // DELETE /api/chats/:chatId/messages - Clear all messages

// Chat info routes
router.get("/:chatId/participants", getChatParticipants); // GET /api/chats/:chatId/participants - Get chat participants

export default router;
