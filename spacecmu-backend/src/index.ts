import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./ormconfig";
import dotenv from "dotenv";
import cors from "cors";

// Import routes
import userRoutes from "./routes/userRoutes";
import personaRoutes from "./routes/personaRoutes";
import postRoutes from "./routes/postRoutes";
import friendRoutes from "./routes/friendRoutes";
import adminRoutes from "./routes/adminRoutes";
import commentRoutes from "./routes/commentRoutes";
import chatRoutes from "./routes/chatRoutes";
import uploadRoutes from "./routes/uploadRoutes";

// Load environment variables from .env
dotenv.config();

async function bootstrap() {
  try {
    // Establish database connection
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");

    const app = express();

    app.use(cors({
      origin: "http://localhost:3001", // Frontend รันที่ port 3001
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      exposedHeaders: ["Authorization"]
    }));

    // Debug: log incoming Authorization header
    app.use((req, res, next) => {
      console.log('Incoming request', req.method, req.url, 'Authorization:', req.headers['authorization']);
      next();
    });

    app.use(express.json());

    // Mount API routes under /api
    app.use("/api/users", userRoutes);
    app.use("/api/personas", personaRoutes);
    app.use("/api/posts", postRoutes);
    app.use("/api/friends", friendRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/posts", commentRoutes);
    app.use("/api/chats", chatRoutes);
    app.use("/api/uploads", uploadRoutes);

    const port = process.env.PORT;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start application:", err);
    process.exit(1);
  }
}

bootstrap();
