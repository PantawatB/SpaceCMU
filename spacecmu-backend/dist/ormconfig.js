"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("./entities/User");
const Persona_1 = require("./entities/Persona");
const Post_1 = require("./entities/Post");
const FriendRequest_1 = require("./entities/FriendRequest");
const Friend_1 = require("./entities/Friend");
const Report_1 = require("./entities/Report");
const Comment_1 = require("./entities/Comment");
const Chat_1 = require("./entities/Chat");
const Message_1 = require("./entities/Message");
const ChatParticipant_1 = require("./entities/ChatParticipant");
// Load environment variables from .env file
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "postgres",
    database: process.env.DB_NAME || "spacecmu",
    synchronize: process.env.NODE_ENV === "production" ? false : true, // Set to false for production
    logging: process.env.NODE_ENV !== "production", // Only log in development
    entities: [
        User_1.User,
        Persona_1.Persona,
        Post_1.Post,
        FriendRequest_1.FriendRequest,
        Friend_1.Friend,
        Report_1.Report,
        Comment_1.Comment,
        Chat_1.Chat,
        Message_1.Message,
        ChatParticipant_1.ChatParticipant,
    ],
    ssl: process.env.DB_SSL === "true",
    extra: {
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    },
});
