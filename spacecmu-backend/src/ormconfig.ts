import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "./entities/User";
import { Persona } from "./entities/Persona";
import { Post } from "./entities/Post";
import { FriendRequest } from "./entities/FriendRequest";
import { Report } from "./entities/Report";
import { Comment } from "./entities/Comment";
import { Chat } from "./entities/Chat";
import { Message } from "./entities/Message";
import { ChatParticipant } from "./entities/ChatParticipant";
import { Actor } from "./entities/Actor";

// Load environment variables from .env file
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "db",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "spacecmu",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: [
    User,
    Persona,
    Post,
    FriendRequest,
    Report,
    Comment,
    Chat,
    Message,
    ChatParticipant,
    Actor,
  ],
  ssl: process.env.DB_SSL === "true",
  extra: {
    ssl:
      process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  },
});
