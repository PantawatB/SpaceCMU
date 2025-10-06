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
router.post("/direct", chatController_1.createDirectChat); // POST /api/chats/direct - Create direct chat
// Message management
router.get("/:chatId/messages", chatController_1.getChatMessages); // GET /api/chats/:chatId/messages - Get chat messages
router.post("/:chatId/messages", chatController_1.sendMessage); // POST /api/chats/:chatId/messages - Send message
router.delete("/messages/:messageId", chatController_1.deleteMessage); // DELETE /api/chats/messages/:messageId - Delete message
exports.default = router;
