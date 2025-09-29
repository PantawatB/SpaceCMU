import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default new DataSource({
  type: "postgres",
  host: "localhost", // Direct connection to localhost
  port: 5433, // Correct Docker compose port
  username: "postgres",
  password: "postgres",
  database: "spacecmu",
  synchronize: false, // Set to false when using migrations
  logging: true,
  entities: ["src/entities/*.ts"],
  migrations: ["src/migrations/*.ts"],
  migrationsTableName: "migrations",
});
