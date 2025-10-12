"use strict";
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
exports.getChatMessages = getChatMessages;
exports.sendMessage = sendMessage;
exports.deleteMessage = deleteMessage;
exports.clearChatMessages = clearChatMessages;
exports.getChatParticipants = getChatParticipants;
const ormconfig_1 = require("../ormconfig");
const Chat_1 = require("../entities/Chat");
const Message_1 = require("../entities/Message");
const ChatParticipant_1 = require("../entities/ChatParticipant");
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
        try {
            const user = req.user;
            const { otherUserId } = req.body;
            if (!otherUserId) {
                return res.status(400).json({ message: "Other user ID is required" });
            }
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            const chatRepo = ormconfig_1.AppDataSource.getRepository(Chat_1.Chat);
            const chatParticipantRepo = ormconfig_1.AppDataSource.getRepository(ChatParticipant_1.ChatParticipant);
            // Check if other user exists
            const otherUser = yield userRepo.findOne({ where: { id: otherUserId } });
            if (!otherUser) {
                return res.status(404).json({ message: "User not found" });
            }
            // Check if direct chat already exists between these users
            const existingParticipations = yield chatParticipantRepo
                .createQueryBuilder("cp1")
                .innerJoin(ChatParticipant_1.ChatParticipant, "cp2", "cp1.chatId = cp2.chatId AND cp2.userId = :otherUserId", { otherUserId })
                .innerJoin("cp1.chat", "chat")
                .where("cp1.userId = :userId AND chat.type = :type", {
                userId: user.id,
                type: Chat_1.ChatType.DIRECT,
            })
                .getOne();
            if (existingParticipations) {
                const chat = yield chatRepo.findOne({
                    where: { id: existingParticipations.chat.id },
                    relations: ["lastMessage", "lastMessage.sender"],
                });
                return res.json({
                    id: chat === null || chat === void 0 ? void 0 : chat.id,
                    type: chat === null || chat === void 0 ? void 0 : chat.type,
                    otherUser: {
                        id: otherUser.id,
                        name: otherUser.name,
                    },
                });
            }
            // Create new direct chat
            const newChat = chatRepo.create({
                type: Chat_1.ChatType.DIRECT,
            });
            yield chatRepo.save(newChat);
            // Add both users as participants
            const participants = [
                chatParticipantRepo.create({ chat: newChat, user }),
                chatParticipantRepo.create({ chat: newChat, user: otherUser }),
            ];
            yield chatParticipantRepo.save(participants);
            return res.status(201).json({
                id: newChat.id,
                type: newChat.type,
                otherUser: {
                    id: otherUser.id,
                    name: otherUser.name,
                },
            });
        }
        catch (error) {
            console.error("Error creating direct chat:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
/**
 * Get messages in a specific chat
 */
function getChatMessages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const { chatId } = req.params;
            const { page = 1, limit = 20 } = req.query;
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
            // Get messages with pagination
            const [messages, total] = yield messageRepo.findAndCount({
                where: { chat: { id: chatId } },
                relations: ["sender", "replyTo", "replyTo.sender"],
                order: { createdAt: "ASC" },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(limit),
            });
            return res.json({
                messages: messages, // Show oldest first without reverse
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
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
            const { content, type = Message_1.MessageType.TEXT, replyToId } = req.body;
            if (!content && type === Message_1.MessageType.TEXT) {
                return res.status(400).json({ message: "Message content is required" });
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
            return res.status(201).json(savedMessage);
        }
        catch (error) {
            console.error("Error sending message:", error);
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
            return res.json({
                chatId,
                participants: participants.map((p) => ({
                    userId: p.user.id,
                    userName: p.user.name,
                    email: p.user.email,
                    joinedAt: p.joinedAt,
                })),
            });
        }
        catch (error) {
            console.error("Error getting chat participants:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
