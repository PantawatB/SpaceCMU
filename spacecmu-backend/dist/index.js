"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const ormconfig_1 = require("./ormconfig");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// Import routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const personaRoutes_1 = __importDefault(require("./routes/personaRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const friendRoutes_1 = __importDefault(require("./routes/friendRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
// Load environment variables from .env
dotenv_1.default.config();
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Establish database connection
            yield ormconfig_1.AppDataSource.initialize();
            console.log("Data Source has been initialized!");
            const app = (0, express_1.default)();
            app.use((0, cors_1.default)({
                origin: "http://localhost:3001", // Frontend รันที่ port 3001
                credentials: true,
                allowedHeaders: ["Content-Type", "Authorization"],
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                exposedHeaders: ["Authorization"],
            }));
            // Debug: log incoming Authorization header
            app.use((req, res, next) => {
                console.log("Incoming request", req.method, req.url, "Authorization:", req.headers["authorization"]);
                next();
            });
            app.use(express_1.default.json());
            // Mount API routes under /api
            app.use("/api/users", userRoutes_1.default);
            app.use("/api/personas", personaRoutes_1.default);
            app.use("/api/posts", postRoutes_1.default);
            app.use("/api/friends", friendRoutes_1.default);
            app.use("/api/admin", adminRoutes_1.default);
            app.use("/api/posts", commentRoutes_1.default); // Comments are sub-routes of posts
            app.use("/api/chats", chatRoutes_1.default);
            app.use("/api/uploads", uploadRoutes_1.default);
            app.use("/api/products", productRoutes_1.default);
            const port = parseInt(process.env.PORT || "3001");
            // Use 0.0.0.0 for Docker compatibility - allows external connections
            const host = "0.0.0.0";
            const server = app.listen(port, host, () => {
                const addr = server.address();
                console.log(`Server listening on ${host}:${port}`);
                try {
                    console.log("server.address():", addr);
                }
                catch (e) {
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
        }
        catch (err) {
            console.error("Failed to start application:", err);
            process.exit(1);
        }
    });
}
bootstrap();
