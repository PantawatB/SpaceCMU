import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Persona } from "./entities/Persona";
import { Post } from "./entities/Post";
import { FriendRequest } from "./entities/FriendRequest";
import { Friend } from "./entities/Friend";
import { Report } from "./entities/Report";

// In a real project these configuration values would be loaded from a
// .env file or similar. Here we provide defaults suitable for local
// development. To connect to a production database supply the appropriate
// environment variables.

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "spacecmu",
  synchronize: true, // Should be false in production
  logging: false,
  entities: [User, Persona, Post, FriendRequest, Friend, Report],
});
