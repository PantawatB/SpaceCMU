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
// Import routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const personaRoutes_1 = __importDefault(require("./routes/personaRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const friendRoutes_1 = __importDefault(require("./routes/friendRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
// Load environment variables from .env
dotenv_1.default.config();
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Establish database connection
            yield ormconfig_1.AppDataSource.initialize();
            console.log("Data Source has been initialized!");
            const app = (0, express_1.default)();
            // Add logging middleware
            app.use((req, res, next) => {
                console.log(`${req.method} ${req.path}`, req.body);
                next();
            });
            app.use(express_1.default.json());
            // Mount API routes under /api
            app.use("/api/users", userRoutes_1.default);
            app.use("/api/personas", personaRoutes_1.default);
            app.use("/api/posts", postRoutes_1.default);
            app.use("/api/friends", friendRoutes_1.default);
            app.use("/api/admin", adminRoutes_1.default);
            app.use("/api/posts", commentRoutes_1.default);
            app.use("/api/chats", chatRoutes_1.default);
            const port = process.env.PORT || 3000;
            app.listen(port, () => {
                console.log(`Server listening on port ${port}`);
            });
        }
        catch (err) {
            console.error("Failed to start application:", err);
            process.exit(1);
        }
    });
}
bootstrap();
