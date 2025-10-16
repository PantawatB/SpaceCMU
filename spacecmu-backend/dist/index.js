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
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const ormconfig_1 = require("./ormconfig");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const socket_1 = require("./socket");
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
                origin: [
                    "http://localhost:3001",
                    "http://26.171.147.78:3001"
                ], // Frontend รันที่ port 3001
                credentials: true,
                allowedHeaders: ["Content-Type", "Authorization"],
                methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                exposedHeaders: ["Authorization"],
            }));
            // Debug: log incoming Authorization header
            app.use((req, res, next) => {
                console.log("Incoming request", req.method, req.url, "Authorization:", req.headers["authorization"]);
                next();
            });
            app.use(express_1.default.json());
            // Serve static files from public directory
            const baseDir = path_1.default.resolve(__dirname, "..");
            app.use(express_1.default.static(path_1.default.join(baseDir, "public")));
            app.use("/uploads", express_1.default.static(path_1.default.join(baseDir, "public/uploads")));
            console.log("📁 Static files configured:");
            console.log("   - Public root:", path_1.default.join(process.cwd(), "public"));
            console.log("   - Uploads path:", path_1.default.join(process.cwd(), "public/uploads"));
            // Serve image test page
            app.get("/image-test", (req, res) => {
                res.sendFile(path_1.default.join(__dirname, "..", "image-test.html"));
            });
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
            const port = parseInt(process.env.PORT || "3000"); // เปลี่ยนเป็น 3000
            // Use 0.0.0.0 for Docker compatibility - allows external connections
            const host = "0.0.0.0";
            // สร้าง HTTP server แทน app.listen
            const server = (0, http_1.createServer)(app);
            server.listen(port, host, () => {
                console.log(`Server listening on ${host}:${port}`);
            });
            // สร้าง Socket.IO server พร้อม CORS config
            const io = new socket_io_1.Server(server, {
                cors: {
                    origin: [
                        "http://localhost:3001",
                        "http://26.171.147.78:3001"
                    ], // Frontend รันที่ port 3001
                    credentials: true,
                },
            });
            // เรียกใช้ Socket.IO initialization
            (0, socket_1.initializeSocket)(io);
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
