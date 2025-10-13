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
exports.Persona = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Report_1 = require("./Report");
const Actor_1 = require("./Actor");
/**
 * Persona = ตัวตนเสมือน/นามแฝงของ user
 * ใช้สำหรับโพสต์ anonymous
 */
let Persona = class Persona {
};
exports.Persona = Persona;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Persona.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.persona, { onDelete: "CASCADE" }),
    __metadata("design:type", User_1.User)
], Persona.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Persona.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Persona.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Persona.prototype, "bannerImg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Persona.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Persona.prototype, "changeCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], Persona.prototype, "lastChangedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Persona.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], Persona.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Persona.prototype, "isBanned", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Report_1.Report, (report) => report.persona),
    __metadata("design:type", Array)
], Persona.prototype, "reports", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Actor_1.Actor, (actor) => actor.persona, { cascade: true }),
    __metadata("design:type", Actor_1.Actor)
], Persona.prototype, "actor", void 0);
exports.Persona = Persona = __decorate([
    (0, typeorm_1.Entity)()
], Persona);
