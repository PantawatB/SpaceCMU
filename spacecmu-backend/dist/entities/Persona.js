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
<<<<<<< HEAD
const Report_1 = require("./Report");
/**
 * Persona = ตัวตนเสมือน/นามแฝงของ user
 * ใช้สำหรับโพสต์ anonymous
=======
/**
 * The Persona entity represents an anonymous identity belonging to a user. Each
 * user may have at most one persona, which they can use to post anonymously.
 * Although persona details are visible to other users, the underlying user ID
 * remains hidden from the client. Admins can trace a persona back to its
 * corresponding user for accountability.
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
 */
let Persona = class Persona {
};
exports.Persona = Persona;
__decorate([
<<<<<<< HEAD
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Persona.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.persona, { onDelete: "CASCADE" }),
=======
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Persona.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.persona),
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
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
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Persona.prototype, "changeCount", void 0);
__decorate([
<<<<<<< HEAD
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
=======
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Persona.prototype, "lastChangedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Persona.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
    __metadata("design:type", Date)
], Persona.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Persona.prototype, "isBanned", void 0);
<<<<<<< HEAD
__decorate([
    (0, typeorm_1.OneToMany)(() => Report_1.Report, (report) => report.persona),
    __metadata("design:type", Array)
], Persona.prototype, "reports", void 0);
=======
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
exports.Persona = Persona = __decorate([
    (0, typeorm_1.Entity)()
], Persona);
