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
exports.Report = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Post_1 = require("./Post");
const Persona_1 = require("./Persona");
/**
 * Report represents a complaint lodged by a user against a post or a persona.
 * The admin can view and take action on these reports.
 */
let Report = class Report {
};
exports.Report = Report;
__decorate([
<<<<<<< HEAD
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Report.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.reports, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", User_1.User)
], Report.prototype, "reportingUser", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Post_1.Post, (post) => post.reports, {
        nullable: true,
        onDelete: "SET NULL",
    }),
    __metadata("design:type", Object)
], Report.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Persona_1.Persona, (persona) => persona.reports, {
        nullable: true,
        onDelete: "SET NULL",
    }),
    __metadata("design:type", Object)
], Report.prototype, "persona", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Report.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["pending", "reviewed", "actioned"],
        default: "pending",
    }),
    __metadata("design:type", String)
], Report.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Report.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    }),
=======
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Report.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.reports),
    __metadata("design:type", User_1.User)
], Report.prototype, "reportingUser", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Post_1.Post, { nullable: true }),
    __metadata("design:type", Object)
], Report.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Persona_1.Persona, { nullable: true }),
    __metadata("design:type", Object)
], Report.prototype, "persona", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Report.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['pending', 'reviewed', 'actioned'], default: 'pending' }),
    __metadata("design:type", String)
], Report.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Report.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
    __metadata("design:type", Date)
], Report.prototype, "updatedAt", void 0);
exports.Report = Report = __decorate([
    (0, typeorm_1.Entity)()
], Report);
