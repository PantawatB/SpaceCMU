import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "./entities/User";
import { Persona } from "./entities/Persona";
import { Post } from "./entities/Post";
import { FriendRequest } from "./entities/FriendRequest";
import { Friend } from "./entities/Friend";
import { Report } from "./entities/Report";
import { Comment } from "./entities/Comment";
import { Conversation } from "./entities/Conversation";
import { Message } from "./entities/Message";

// Load environment variables from .env file
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "spacecmu",
  synchronize: process.env.NODE_ENV === "production" ? false : true, // Set to false for production
  logging: process.env.NODE_ENV !== "production", // Only log in development
  entities: [
    User,
    Persona,
    Post,
    FriendRequest,
    Friend,
    Report,
    Comment,
    Conversation,
    Message,
  ],
  ssl: process.env.DB_SSL === "true",
  extra: {
    ssl:
      process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  },
});
