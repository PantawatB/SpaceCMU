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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const Persona_1 = require("./Persona");
const Report_1 = require("./Report");
const Message_1 = require("./Message");
const Actor_1 = require("./Actor");
/**
 * The User entity represents a single CMU student in the system. A user has
 * exactly one account bound to a student ID and CMU email. Each user may
 * optionally have one anonymous persona. Users can author posts, send and
 * accept friend requests and report content. An admin is simply a user
 * flagged with the `isAdmin` field.
 */
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "profileImg", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "bannerImg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }) // ใช้ type: "text" สำหรับข้อความยาวๆ
    ,
    __metadata("design:type", String)
], User.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isAdmin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isBanned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Persona_1.Persona, (persona) => persona.user, {
        cascade: true,
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Persona_1.Persona)
], User.prototype, "persona", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Report_1.Report, (report) => report.reportingUser),
    __metadata("design:type", Array)
], User.prototype, "reports", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Message_1.Message, (message) => message.sender),
    __metadata("design:type", Array)
], User.prototype, "sentMessages", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], User.prototype, "lastActiveAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Actor_1.Actor, (actor) => actor.user, { cascade: true }),
    __metadata("design:type", Actor_1.Actor)
], User.prototype, "actor", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
