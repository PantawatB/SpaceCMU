"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const chatController_1 = require("../controllers/chatController");
const router = (0, express_1.Router)();
// All chat routes require authentication
router.use(auth_1.authenticateToken);
// Chat management
router.get("/", chatController_1.getMyChats); // GET /api/chats - Get all user's chats
router.post("/direct", (req, res, next) => {
    console.log("🔥 Direct chat route hit:", req.body);
    next();
}, chatController_1.createDirectChat); // POST /api/chats/direct - Create direct chat
router.post("/product", chatController_1.createProductChat); // POST /api/chats/product - Contact product seller
// Message management
router.get("/:chatId/messages", chatController_1.getChatMessages); // GET /api/chats/:chatId/messages - Get chat messages (real-time)
router.get("/:chatId/messages/new", chatController_1.getNewMessages); // GET /api/chats/:chatId/messages/new - Poll for new messages
router.post("/:chatId/messages", chatController_1.sendMessage); // POST /api/chats/:chatId/messages - Send message
router.delete("/messages/:messageId", chatController_1.deleteMessage); // DELETE /api/chats/messages/:messageId - Delete message
router.delete("/:chatId/messages", chatController_1.clearChatMessages); // DELETE /api/chats/:chatId/messages - Clear all messages
// Chat info routes
router.get("/:chatId/participants", chatController_1.getChatParticipants); // GET /api/chats/:chatId/participants - Get chat participants
exports.default = router;
