import {
  Router,
  RequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import { authenticateToken, checkBanned } from "../middleware/auth";
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
  getUnreadCount,
  markChatAsRead,
} from "../controllers/chatController";

const router = Router();

// All chat routes require authentication
router.use(authenticateToken as RequestHandler);

// Chat management (read-only operations - allowed for banned users to view)
router.get("/actor/:actorId", getMyChats as RequestHandler); // GET /api/chats/actor/:actorId - Get all user's chats
router.get("/unread-count", getUnreadCount as RequestHandler); // GET /api/chats/unread-count - Get unread messages count
router.get("/:chatId/messages", getChatMessages as RequestHandler); // GET /api/chats/:chatId/messages - Get chat messages (real-time)
router.get("/:chatId/messages/new", getNewMessages as RequestHandler); // GET /api/chats/:chatId/messages/new - Poll for new messages
router.get("/:chatId/participants", getChatParticipants as RequestHandler); // GET /api/chats/:chatId/participants - Get chat participants

// Chat creation and messaging (blocked for banned users)
router.post(
  "/:chatId/mark-read",
  checkBanned as RequestHandler,
  markChatAsRead as RequestHandler
); // POST /api/chats/:chatId/mark-read - Mark chat messages as read
router.post(
  "/direct",
  checkBanned as RequestHandler,
  (req: Request, res: Response, next: NextFunction) => {
    console.log(" DIRECT CHAT ROUTE HIT WITH BODY:", req.body);
    console.log(
      " USER FROM REQ:",
      (req as any).user ? (req as any).user.id : "NO USER"
    );
    next();
  },
  createDirectChat as RequestHandler
); // POST /api/chats/direct - Create direct chat
router.post(
  "/product",
  checkBanned as RequestHandler,
  createProductChat as RequestHandler
); // POST /api/chats/product - Contact product seller

// Message management (blocked for banned users)
router.post(
  "/:chatId/messages",
  checkBanned as RequestHandler,
  sendMessage as RequestHandler
); // POST /api/chats/:chatId/messages - Send message
router.delete(
  "/messages/:messageId",
  checkBanned as RequestHandler,
  deleteMessage as RequestHandler
); // DELETE /api/chats/messages/:messageId - Delete message
router.delete(
  "/:chatId/messages",
  checkBanned as RequestHandler,
  clearChatMessages as RequestHandler
); // DELETE /api/chats/:chatId/messages - Clear all messages

export default router;
