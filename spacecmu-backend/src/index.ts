import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./ormconfig";
import dotenv from "dotenv";

// Import routes
import userRoutes from "./routes/userRoutes";
import personaRoutes from "./routes/personaRoutes";
import postRoutes from "./routes/postRoutes";
import friendRoutes from "./routes/friendRoutes";
import adminRoutes from "./routes/adminRoutes";
import commentRoutes from "./routes/commentRoutes";
import chatRoutes from "./routes/chatRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import productRoutes from "./routes/productRoutes";

// Load environment variables from .env
dotenv.config();

async function bootstrap() {
  try {
    // Establish database connection
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");

    const app = express();

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
    app.use("/api/products", productRoutes);

    const port = parseInt(process.env.PORT || "3001");
    const server = app.listen(port, "127.0.0.1", () => {
      const addr = server.address();
      console.log(`Server listening on 127.0.0.1:${port}`);
      try {
        console.log("server.address():", addr);
      } catch (e) {
        console.error("failed to read server.address():", e);
      }
    });

    server.on("error", (err) => {
      console.error("HTTP server error:", err);
    });

    process.on("uncaughtException", (err) => {
      console.error("uncaughtException:", err);
    });

    process.on("unhandledRejection", (reason) => {
      console.error("unhandledRejection:", reason);
    });
  } catch (err) {
    console.error("Failed to start application:", err);
    process.exit(1);
  }
}

bootstrap();
