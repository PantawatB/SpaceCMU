"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = exports.ChatType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var ChatType;
(function (ChatType) {
    ChatType["DIRECT"] = "direct";
    ChatType["GROUP"] = "group";
})(ChatType || (exports.ChatType = ChatType = {}));
/**
 * Chat/Conversation entity represents a conversation between users
 * Can be either direct (1:1) or group chat
 */
let Chat = class Chat {
};
exports.Chat = Chat;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Chat.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ChatType,
        default: ChatType.DIRECT,
    }),
    __metadata("design:type", String)
], Chat.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Chat.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Chat.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "createdBy" }),
    __metadata("design:type", User_1.User)
], Chat.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)("Message", { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "lastMessageId" }),
    __metadata("design:type", Object)
], Chat.prototype, "lastMessage", void 0);
__decorate([
    (0, typeorm_1.OneToMany)("Message", "chat", { cascade: true }),
    __metadata("design:type", Array)
], Chat.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Chat.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Chat.prototype, "updatedAt", void 0);
exports.Chat = Chat = __decorate([
    (0, typeorm_1.Entity)()
], Chat);
