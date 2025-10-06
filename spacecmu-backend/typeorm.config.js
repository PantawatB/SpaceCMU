const { DataSource } = require("typeorm");
require("dotenv").config();

module.exports = new DataSource({
  type: "postgres",
  host: "127.0.0.1",
  port: 5433,
  username: "postgres",
  password: "postgres",
  database: "spacecmu",
  synchronize: false,
  logging: true,
  entities: ["dist/entities/*.js"],
  migrations: ["dist/migrations/*.js"],
  migrationsTableName: "migrations",
});
