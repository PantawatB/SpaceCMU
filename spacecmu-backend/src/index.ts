import "reflect-metadata";
import express from "express";
<<<<<<< HEAD
import { AppDataSource } from "./ormconfig";
import dotenv from "dotenv";
=======
import { createServer } from "http";
import { Server } from "socket.io";
import { AppDataSource } from "./ormconfig";
import dotenv from "dotenv";
import { initializeSocket } from "./socket";
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805

// Import routes
import userRoutes from "./routes/userRoutes";
import personaRoutes from "./routes/personaRoutes";
import postRoutes from "./routes/postRoutes";
import friendRoutes from "./routes/friendRoutes";
import adminRoutes from "./routes/adminRoutes";
import commentRoutes from "./routes/commentRoutes";
import chatRoutes from "./routes/chatRoutes";
<<<<<<< HEAD
=======
import uploadRoutes from "./routes/uploadRoutes";
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805

// Load environment variables from .env
dotenv.config();

async function bootstrap() {
  try {
    // Establish database connection
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");

    const app = express();
<<<<<<< HEAD

    // Add logging middleware
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`, req.body);
      next();
    });

    app.use(express.json());
=======
    app.use(express.json());

    app.use(express.static("public"));

    // --- Create HTTP and Socket.IO servers ---
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });

    // Initialize socket event handlers
    initializeSocket(io);
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805

    // Mount API routes under /api
    app.use("/api/users", userRoutes);
    app.use("/api/personas", personaRoutes);
    app.use("/api/posts", postRoutes);
    app.use("/api/friends", friendRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/posts", commentRoutes);
    app.use("/api/chats", chatRoutes);
<<<<<<< HEAD

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
=======
    app.use("/api/uploads", uploadRoutes);

    const port = process.env.PORT || 3000;

    // Start listening on the httpServer, not the Express app
    httpServer.listen(port, () => {
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start application:", err);
    process.exit(1);
  }
}

bootstrap();
