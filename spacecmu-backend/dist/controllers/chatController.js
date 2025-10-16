"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyChats = getMyChats;
exports.createDirectChat = createDirectChat;
exports.createProductChat = createProductChat;
exports.getChatMessages = getChatMessages;
exports.sendMessage = sendMessage;
exports.getNewMessages = getNewMessages;
exports.deleteMessage = deleteMessage;
exports.clearChatMessages = clearChatMessages;
exports.getChatParticipants = getChatParticipants;
const ormconfig_1 = require("../ormconfig");
const Chat_1 = require("../entities/Chat");
const Message_1 = require("../entities/Message");
const ChatParticipant_1 = require("../entities/ChatParticipant");
const serialize_1 = require("../utils/serialize");
const User_1 = require("../entities/User");
/**
 * Get all chats for the authenticated user
 */
function getMyChats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const chatParticipantRepo = ormconfig_1.AppDataSource.getRepository(ChatParticipant_1.ChatParticipant);
            // Get all chats where user is a participant
            const participations = yield chatParticipantRepo.find({
                where: { user: { id: user.id } },
                relations: [
                    "chat",
                    "chat.lastMessage",
                    "chat.lastMessage.sender",
                    "chat.createdBy",
                ],
                order: { chat: { updatedAt: "DESC" } },
            });
            const chats = participations.map((p) => ({
                id: p.chat.id,
                type: p.chat.type,
                name: p.chat.name,
                lastMessage: p.chat.lastMessage
                    ? {
                        id: p.chat.lastMessage.id,
                        content: p.chat.lastMessage.content,
                        sender: {
                            id: p.chat.lastMessage.sender.id,
                            name: p.chat.lastMessage.sender.name,
                        },
                        createdAt: p.chat.lastMessage.createdAt,
                    }
                    : null,
                updatedAt: p.chat.updatedAt,
                joinedAt: p.joinedAt,
            }));
            return res.json(chats);
        }
        catch (error) {
            console.error("Error getting chats:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
/**
 * Create a new direct message chat
 */
function createDirectChat(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("=== CREATE DIRECT CHAT DEBUG ===");
        console.log("Request body:", req.body);
        console.log("User from req:", req.user ? { id: req.user.id, name: req.user.name } : "undefined");
        try {
            // Validate user authentication
            if (!req.user) {
                console.log("❌ No user in request");
                return res.status(401).json({ message: "Authentication required" });
            }
            const currentUser = req.user;
            console.log("✅ Current user:", {
                id: currentUser.id,
                name: currentUser.name,
            });
            // Validate request body
            const { otherUserId } = req.body;
            if (!otherUserId) {
                console.log("❌ No otherUserId provided");
                return res.status(400).json({ message: "Other user ID is required" });
            }
            console.log("🔍 Looking for other user:", otherUserId);
            // Get repositories
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            const chatRepo = ormconfig_1.AppDataSource.getRepository(Chat_1.Chat);
            const chatParticipantRepo = ormconfig_1.AppDataSource.getRepository(ChatParticipant_1.ChatParticipant);
            // Check if other user exists (try both user ID and actor ID)
            let otherUser = yield userRepo.findOne({ where: { id: otherUserId } });
            // If not found by user ID, try to find by actor ID
            if (!otherUser) {
                console.log("🔍 User not found by ID, trying actor ID...");
                otherUser = yield userRepo.findOne({
                    where: { actor: { id: otherUserId } },
                    relations: ["actor"]
                });
            }
            if (!otherUser) {
                console.log("❌ Other user not found by ID or actor ID");
                return res.status(404).json({ message: "User not found" });
            }
            console.log("✅ Other user found:", {
                id: otherUser.id,
                name: otherUser.name,
            });
            // Check for existing direct chat between these two users
            console.log("🔍 Checking for existing chat between users...");
            const existingParticipations = yield chatParticipantRepo.find({
                where: { user: { id: currentUser.id } },
                relations: ["chat", "user"],
            });
            let existingChat = null;
            for (const participation of existingParticipations) {
                const chat = participation.chat;
                if (chat.type === Chat_1.ChatType.DIRECT) {
                    // Get all participants in this chat
                    const allParticipants = yield chatParticipantRepo.find({
                        where: { chat: { id: chat.id } },
                        relations: ["user"],
                    });
                    // Check if this is a direct chat with the target user
                    if (allParticipants.length === 2) {
                        const otherParticipant = allParticipants.find((p) => p.user.id !== currentUser.id);
                        if (otherParticipant && otherParticipant.user.id === otherUserId) {
                            existingChat = chat;
                            break;
                        }
                    }
                }
            }
            if (existingChat) {
                console.log("✅ Found existing chat:", existingChat.id);
                const response = {
                    id: existingChat.id,
                    type: existingChat.type,
                    otherUser: {
                        id: otherUser.id,
                        name: otherUser.name,
                    },
                };
                return res.status(200).json(response);
            }
            console.log("🆕 Creating new chat...");
            // Use transaction to ensure atomicity
            const savedChat = yield ormconfig_1.AppDataSource.transaction((manager) => __awaiter(this, void 0, void 0, function* () {
                // Create new direct chat
                const newChat = manager.create(Chat_1.Chat, {
                    type: Chat_1.ChatType.DIRECT,
                    createdBy: currentUser,
                });
                const savedChat = yield manager.save(Chat_1.Chat, newChat);
                console.log("✅ Chat created with ID:", savedChat.id);
                // Add both users as participants with error handling
                try {
                    const participant1 = manager.create(ChatParticipant_1.ChatParticipant, {
                        chat: savedChat,
                        user: currentUser,
                    });
                    yield manager.save(ChatParticipant_1.ChatParticipant, participant1);
                    console.log("✅ Participant 1 added");
                    const participant2 = manager.create(ChatParticipant_1.ChatParticipant, {
                        chat: savedChat,
                        user: otherUser,
                    });
                    yield manager.save(ChatParticipant_1.ChatParticipant, participant2);
                    console.log("✅ Participant 2 added");
                    return savedChat;
                }
                catch (participantError) {
                    console.error("❌ Error adding participants:", participantError);
                    throw participantError;
                }
            }));
            const response = {
                id: savedChat.id,
                type: savedChat.type,
                otherUser: {
                    id: otherUser.id,
                    name: otherUser.name,
                },
            };
            console.log("✅ Returning response:", response);
            return res.status(201).json(response);
        }
        catch (error) {
            console.error("❌ Error creating direct chat:", error);
            console.error("Error stack:", error instanceof Error ? error.stack : "Unknown error");
            return res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
}
/**
 * Create a chat to contact product seller
 */
function createProductChat(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { productId, message, imageUrl } = req.body;
            if (!productId) {
                return res.status(400).json({ message: "Product ID is required" });
            }
            // Get product and seller info
            const { Product } = yield Promise.resolve().then(() => __importStar(require("../entities/Product")));
            const productRepo = ormconfig_1.AppDataSource.getRepository(Product);
            const product = yield productRepo.findOne({
                where: { id: productId },
                relations: ["seller"],
            });
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            // Check if user is trying to contact themselves
            if (product.seller.id === user.id) {
                return res.status(400).json({
                    message: "You cannot contact yourself about your own product",
                });
            }
            // Create or find existing chat with seller
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            const chatRepo = ormconfig_1.AppDataSource.getRepository(Chat_1.Chat);
            const chatParticipantRepo = ormconfig_1.AppDataSource.getRepository(ChatParticipant_1.ChatParticipant);
            // Check if chat already exists between buyer and seller
            const existingParticipations = yield chatParticipantRepo.find({
                where: { user: { id: user.id } },
                relations: ["chat", "user"],
            });
            let existingChat = null;
            for (const participation of existingParticipations) {
                const chat = participation.chat;
                if (chat.type === "direct") {
                    // Get all participants for this chat
                    const allParticipants = yield chatParticipantRepo.find({
                        where: { chat: { id: chat.id } },
                        relations: ["user"],
                    });
                    if (allParticipants.length === 2) {
                        const otherParticipant = allParticipants.find((p) => p.user.id !== user.id);
                        if (otherParticipant &&
                            otherParticipant.user.id === product.seller.id) {
                            existingChat = chat;
                            break;
                        }
                    }
                }
            }
            let chat;
            if (existingChat) {
                chat = existingChat;
            }
            else {
                // Create new chat
                chat = chatRepo.create({
                    type: "direct",
                    createdBy: user,
                });
                yield chatRepo.save(chat);
                // Add participants
                const buyerParticipant = chatParticipantRepo.create({
                    chat,
                    user: user,
                    joinedAt: new Date(),
                });
                const sellerParticipant = chatParticipantRepo.create({
                    chat,
                    user: product.seller,
                    joinedAt: new Date(),
                });
                yield chatParticipantRepo.save([buyerParticipant, sellerParticipant]);
            }
            // Send initial message if provided
            if (message) {
                const { Message, MessageType } = yield Promise.resolve().then(() => __importStar(require("../entities/Message")));
                const messageRepo = ormconfig_1.AppDataSource.getRepository(Message);
                const newMessage = messageRepo.create({
                    chat: chat,
                    sender: user,
                    content: message,
                    type: imageUrl ? MessageType.IMAGE : MessageType.TEXT,
                    fileUrl: imageUrl || null,
                });
                yield messageRepo.save(newMessage);
                // Update chat's last message
                chat.lastMessage = newMessage;
                yield chatRepo.save(chat);
            }
            return res.status(201).json({
                message: "Chat created successfully",
                data: {
                    chatId: chat.id,
                    sellerId: product.seller.id,
                    sellerName: product.seller.name,
                    productId: product.id,
                    productName: product.name,
                },
            });
        }
        catch (error) {
            console.error("Error creating product chat:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
/**
 * Get messages in a specific chat (Real-time chat - NO pagination)
 * Returns recent messages for immediate display, suitable for real-time updates
 */
function getChatMessages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { chatId } = req.params;
            const { limit = 50, // Default recent messages limit
            since, // Optional: get messages since this timestamp for real-time updates
            messageId, // Optional: get messages after this message ID
             } = req.query;
            const chatParticipantRepo = ormconfig_1.AppDataSource.getRepository(ChatParticipant_1.ChatParticipant);
            const messageRepo = ormconfig_1.AppDataSource.getRepository(Message_1.Message);
            // Verify user is a participant in this chat
            const participation = yield chatParticipantRepo.findOne({
                where: {
                    chat: { id: chatId },
                    user: { id: user.id },
                },
            });
            if (!participation) {
                return res
                    .status(403)
                    .json({ message: "You are not a participant in this chat" });
            }
            // Build query for real-time updates
            const queryBuilder = messageRepo
                .createQueryBuilder("message")
                .where("message.chat = :chatId", { chatId })
                .leftJoinAndSelect("message.sender", "sender")
                .leftJoinAndSelect("message.replyTo", "replyTo")
                .leftJoinAndSelect("replyTo.sender", "replyToSender")
                .orderBy("message.createdAt", "ASC");
            // If requesting updates since a specific time (real-time polling)
            if (since) {
                queryBuilder.andWhere("message.createdAt > :since", {
                    since: new Date(since),
                });
            }
            // If requesting messages after a specific message (real-time updates)
            else if (messageId) {
                const afterMessage = yield messageRepo.findOne({
                    where: { id: messageId },
                    select: ["createdAt"],
                });
                if (afterMessage) {
                    queryBuilder.andWhere("message.createdAt > :afterTime", {
                        afterTime: afterMessage.createdAt,
                    });
                }
            }
            // Default: get recent messages for initial load
            else {
                queryBuilder.limit(Number(limit));
                // For initial load, get recent messages in DESC order, then reverse
                queryBuilder.orderBy("message.createdAt", "DESC");
            }
            let messages = yield queryBuilder.getMany();
            // For initial load, reverse to show oldest first (chronological order)
            if (!since && !messageId) {
                messages = messages.reverse();
            }
            const totalMessages = yield messageRepo.count({
                where: { chat: { id: chatId } },
            });
            return res.json({
                message: "Chat messages retrieved",
                data: {
                    messages: messages.map((msg) => ({
                        id: msg.id,
                        content: msg.content,
                        type: msg.type,
                        imageUrl: msg.fileUrl, // Include image URL for image messages
                        sender: {
                            id: msg.sender.id,
                            name: msg.sender.name,
                        },
                        replyTo: msg.replyTo
                            ? {
                                id: msg.replyTo.id,
                                content: msg.replyTo.content,
                                sender: {
                                    id: msg.replyTo.sender.id,
                                    name: msg.replyTo.sender.name,
                                },
                            }
                            : null,
                        createdAt: msg.createdAt,
                        updatedAt: msg.updatedAt,
                    })),
                    totalMessages,
                    isRealTimeUpdate: !!(since || messageId),
                    chatId,
                },
            });
        }
        catch (error) {
            console.error("Error getting chat messages:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
/**
 * Send a message to a chat
 */
function sendMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { chatId } = req.params;
            const { content, type = Message_1.MessageType.TEXT, replyToId, imageUrl, fileName, fileSize, } = req.body;
            // Validation based on message type
            if (type === Message_1.MessageType.TEXT && !content) {
                return res
                    .status(400)
                    .json({ message: "Text message content is required" });
            }
            if (type === Message_1.MessageType.IMAGE && !imageUrl) {
                return res
                    .status(400)
                    .json({ message: "Image URL is required for image messages" });
            }
            const chatRepo = ormconfig_1.AppDataSource.getRepository(Chat_1.Chat);
            const messageRepo = ormconfig_1.AppDataSource.getRepository(Message_1.Message);
            const chatParticipantRepo = ormconfig_1.AppDataSource.getRepository(ChatParticipant_1.ChatParticipant);
            // Verify user is a participant in this chat
            const participation = yield chatParticipantRepo.findOne({
                where: {
                    chat: { id: chatId },
                    user: { id: user.id },
                },
            });
            if (!participation) {
                return res
                    .status(403)
                    .json({ message: "You are not a participant in this chat" });
            }
            const chat = yield chatRepo.findOne({ where: { id: chatId } });
            if (!chat) {
                return res.status(404).json({ message: "Chat not found" });
            }
            // Check if replying to an existing message
            let replyToMessage = null;
            if (replyToId) {
                replyToMessage = yield messageRepo.findOne({
                    where: { id: replyToId, chat: { id: chatId } },
                });
                if (!replyToMessage) {
                    return res.status(404).json({ message: "Reply message not found" });
                }
            }
            // Create new message
            const newMessage = messageRepo.create({
                chat,
                sender: user,
                content,
                type,
                fileUrl: imageUrl || null,
                fileName: fileName || null,
                fileSize: fileSize || null,
                replyTo: replyToMessage || undefined,
            });
            yield messageRepo.save(newMessage);
            // Update chat's last message
            chat.lastMessage = newMessage;
            yield chatRepo.save(chat);
            // Return the created message with relations
            const savedMessage = yield messageRepo.findOne({
                where: { id: newMessage.id },
                relations: ["sender", "replyTo", "replyTo.sender"],
            });
            return res.status(201).json({
                message: "Message sent successfully",
                data: {
                    id: savedMessage.id,
                    content: savedMessage.content,
                    type: savedMessage.type,
                    sender: {
                        id: savedMessage.sender.id,
                        name: savedMessage.sender.name,
                    },
                    replyTo: savedMessage.replyTo
                        ? {
                            id: savedMessage.replyTo.id,
                            content: savedMessage.replyTo.content,
                            sender: {
                                id: savedMessage.replyTo.sender.id,
                                name: savedMessage.replyTo.sender.name,
                            },
                        }
                        : null,
                    createdAt: savedMessage.createdAt,
                    chatId: chat.id,
                },
            });
        }
        catch (error) {
            console.error("Error sending message:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
/**
 * Get new messages for real-time updates (polling endpoint)
 * This endpoint is optimized for frequent polling by chat clients
 */
function getNewMessages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { chatId } = req.params;
            const { lastMessageId, since } = req.query;
            const chatParticipantRepo = ormconfig_1.AppDataSource.getRepository(ChatParticipant_1.ChatParticipant);
            const messageRepo = ormconfig_1.AppDataSource.getRepository(Message_1.Message);
            // Verify user is a participant in this chat
            const participation = yield chatParticipantRepo.findOne({
                where: {
                    chat: { id: chatId },
                    user: { id: user.id },
                },
            });
            if (!participation) {
                return res
                    .status(403)
                    .json({ message: "You are not a participant in this chat" });
            }
            let newMessages = [];
            if (lastMessageId) {
                // Get messages after specific message ID
                const lastMessage = yield messageRepo.findOne({
                    where: { id: lastMessageId },
                    select: ["createdAt"],
                });
                if (lastMessage) {
                    // Get messages after the specified message by timestamp, then filter out the reference message
                    newMessages = yield messageRepo
                        .createQueryBuilder("message")
                        .where("message.chat = :chatId", { chatId })
                        .andWhere("message.createdAt > :afterTime", {
                        afterTime: lastMessage.createdAt,
                    })
                        .leftJoinAndSelect("message.sender", "sender")
                        .leftJoinAndSelect("message.replyTo", "replyTo")
                        .leftJoinAndSelect("replyTo.sender", "replyToSender")
                        .orderBy("message.createdAt", "ASC")
                        .getMany();
                }
            }
            else if (since) {
                // Get messages since timestamp
                newMessages = yield messageRepo
                    .createQueryBuilder("message")
                    .where("message.chat = :chatId", { chatId })
                    .andWhere("message.createdAt > :since", {
                    since: new Date(since),
                })
                    .leftJoinAndSelect("message.sender", "sender")
                    .leftJoinAndSelect("message.replyTo", "replyTo")
                    .leftJoinAndSelect("replyTo.sender", "replyToSender")
                    .orderBy("message.createdAt", "ASC")
                    .getMany();
            }
            return res.json({
                message: "New messages retrieved",
                data: {
                    newMessages: newMessages.map((msg) => ({
                        id: msg.id,
                        content: msg.content,
                        type: msg.type,
                        imageUrl: msg.fileUrl, // Include image URL for image messages
                        sender: {
                            id: msg.sender.id,
                            name: msg.sender.name,
                        },
                        replyTo: msg.replyTo
                            ? {
                                id: msg.replyTo.id,
                                content: msg.replyTo.content,
                                sender: {
                                    id: msg.replyTo.sender.id,
                                    name: msg.replyTo.sender.name,
                                },
                            }
                            : null,
                        createdAt: msg.createdAt,
                    })),
                    hasNewMessages: newMessages.length > 0,
                    count: newMessages.length,
                    chatId,
                },
            });
        }
        catch (error) {
            console.error("Error getting new messages:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
/**
 * Delete a message (only by sender)
 */
function deleteMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { messageId } = req.params;
            const messageRepo = ormconfig_1.AppDataSource.getRepository(Message_1.Message);
            const chatRepo = ormconfig_1.AppDataSource.getRepository(Chat_1.Chat);
            const message = yield messageRepo.findOne({
                where: { id: messageId },
                relations: ["sender", "chat"],
            });
            if (!message) {
                return res.status(404).json({ message: "Message not found" });
            }
            // Only sender can delete their own message
            if (message.sender.id !== user.id) {
                return res
                    .status(403)
                    .json({ message: "You can only delete your own messages" });
            }
            // Check if this message is the lastMessage of its chat
            const chat = yield chatRepo.findOne({
                where: { id: message.chat.id },
                relations: ["lastMessage"],
            });
            if (chat && chat.lastMessage && chat.lastMessage.id === messageId) {
                // Find the previous message to set as new lastMessage
                const previousMessage = yield messageRepo
                    .createQueryBuilder("message")
                    .where("message.chatId = :chatId", { chatId: chat.id })
                    .andWhere("message.id != :messageId", { messageId })
                    .orderBy("message.createdAt", "DESC")
                    .leftJoinAndSelect("message.sender", "sender")
                    .getOne();
                // Update chat's lastMessage before deleting
                chat.lastMessage = previousMessage || null;
                yield chatRepo.save(chat);
            }
            yield messageRepo.remove(message);
            return res.json({ message: "Message deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting message:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
/**
 * Clear all messages in a chat (for testing purposes)
 */
function clearChatMessages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { chatId } = req.params;
            const chatRepo = ormconfig_1.AppDataSource.getRepository(Chat_1.Chat);
            const messageRepo = ormconfig_1.AppDataSource.getRepository(Message_1.Message);
            const chatParticipantRepo = ormconfig_1.AppDataSource.getRepository(ChatParticipant_1.ChatParticipant);
            // Verify user is a participant in this chat
            const participation = yield chatParticipantRepo.findOne({
                where: {
                    chat: { id: chatId },
                    user: { id: user.id },
                },
            });
            if (!participation) {
                return res
                    .status(403)
                    .json({ message: "You are not a participant in this chat" });
            }
            // Delete all messages in the chat
            yield messageRepo.delete({ chat: { id: chatId } });
            // Update chat's lastMessage to null
            const chat = yield chatRepo.findOne({ where: { id: chatId } });
            if (chat) {
                chat.lastMessage = null;
                yield chatRepo.save(chat);
            }
            return res.json({ message: "All messages cleared successfully" });
        }
        catch (error) {
            console.error("Error clearing chat messages:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
/**
 * Get chat participants (for debugging)
 */
function getChatParticipants(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { chatId } = req.params;
            const chatParticipantRepo = ormconfig_1.AppDataSource.getRepository(ChatParticipant_1.ChatParticipant);
            const participants = yield chatParticipantRepo.find({
                where: { chat: { id: chatId } },
                relations: ["user", "chat"],
            });
            return res.json((0, serialize_1.createResponse)("Chat participants fetched", {
                chatId,
                participants: participants.map((p) => (Object.assign(Object.assign({}, (0, serialize_1.sanitizeUser)(p.user)), { joinedAt: p.joinedAt }))),
            }));
        }
        catch (error) {
            console.error("Error getting chat participants:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
