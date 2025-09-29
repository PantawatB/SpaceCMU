const { DataSource } = require("typeorm");
require("dotenv").config();

module.exports = new DataSource({
  type: "postgres",
  host: "localhost",
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
