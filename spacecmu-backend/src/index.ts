import "reflect-metadata";
import express from "express";
import path from "path";
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
import productRoutes from "./routes/productRoutes";

// Load environment variables from .env
dotenv.config();

async function bootstrap() {
  try {
    // Establish database connection
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");

    const app = express();

    app.use(
      cors({
        origin: "http://localhost:3000", // Frontend รันที่ port 3000
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        exposedHeaders: ["Authorization"],
      })
    );

    // Debug: log incoming Authorization header
    app.use((req, res, next) => {
      console.log(
        "Incoming request",
        req.method,
        req.url,
        "Authorization:",
        req.headers["authorization"]
      );
      next();
    });

    app.use(express.json());

    // Serve static files from public directory
    const baseDir = path.resolve(__dirname, "..");
    app.use(express.static(path.join(baseDir, "public")));
    app.use("/uploads", express.static(path.join(baseDir, "public/uploads")));

    console.log("📁 Static files configured:");
    console.log("   - Public root:", path.join(process.cwd(), "public"));
    console.log(
      "   - Uploads path:",
      path.join(process.cwd(), "public/uploads")
    );

    // Serve image test page
    app.get("/image-test", (req, res) => {
      res.sendFile(path.join(__dirname, "..", "image-test.html"));
    });

    // Mount API routes under /api
    app.use("/api/users", userRoutes);
    app.use("/api/personas", personaRoutes);
    app.use("/api/posts", postRoutes);
    app.use("/api/friends", friendRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/posts", commentRoutes); // Comments are sub-routes of posts
    app.use("/api/chats", chatRoutes);
    app.use("/api/uploads", uploadRoutes);
    app.use("/api/products", productRoutes);

    const port = parseInt(process.env.PORT || "3000");
    // Use 0.0.0.0 for Docker compatibility - allows external connections
    const host = "0.0.0.0";
    const server = app.listen(port, host, () => {
      const addr = server.address();
      console.log(`Server listening on ${host}:${port}`);
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
