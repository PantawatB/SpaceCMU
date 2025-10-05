"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const Persona_1 = require("./entities/Persona");
const Post_1 = require("./entities/Post");
const FriendRequest_1 = require("./entities/FriendRequest");
const Friend_1 = require("./entities/Friend");
const Report_1 = require("./entities/Report");
// In a real project these configuration values would be loaded from a
// .env file or similar. Here we provide defaults suitable for local
// development. To connect to a production database supply the appropriate
// environment variables.
exports.AppDataSource = new typeorm_1.DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "spacecmu",
  synchronize: false, // Should be false in production
  logging: false,
  entities: [
    User_1.User,
    Persona_1.Persona,
    Post_1.Post,
    FriendRequest_1.FriendRequest,
    Friend_1.Friend,
    Report_1.Report,
  ],
  migrations: ["src/migrations/*.ts"],
  migrationsTableName: "migrations",
});
