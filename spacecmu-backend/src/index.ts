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

dotenv.config();

async function bootstrap() {
  // Establish database connection. In a real environment you would pass
  // configuration values via a .env file. For this example the connection
  // details are omitted and should be filled in according to your setup.
  await AppDataSource.initialize();

  const app = express();
  app.use(express.json());

  // Mount API routes under /api
  app.use("/api/users", userRoutes);
  app.use("/api/personas", personaRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/friends", friendRoutes);
  app.use("/api/admin", adminRoutes);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start application:", err);
});
