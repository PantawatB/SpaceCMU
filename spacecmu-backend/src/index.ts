import "reflect-metadata";
import express from "express";
import path from "path";
import { AppDataSource } from "./ormconfig";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { configureGoogleStrategy } from "./config/passport";

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
import authRoutes from "./routes/authRoutes";

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
        origin: ["http://localhost:3001", "http://26.171.147.78:3001"], // Frontend รันที่ port 3001
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

    if (!process.env.SESSION_SECRET) {
      console.error("SESSION_SECRET is not set in environment variables!");
      process.exit(1);
    }
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === "production" },
      })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    configureGoogleStrategy();
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
    app.use("/api/auth", authRoutes);

    const port = parseInt(process.env.PORT || "3000"); // เปลี่ยนเป็น 3000
    // Use 0.0.0.0 for Docker compatibility - allows external connections
    const host = "0.0.0.0";

    // Start server with Express only (no Socket.IO)
    app.listen(port, host, () => {
      console.log(`Server listening on ${host}:${port}`);
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
