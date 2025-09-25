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
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReports = listReports;
exports.banPersona = banPersona;
exports.banUser = banUser;
exports.takedownPost = takedownPost;
exports.reviewReport = reviewReport;
const ormconfig_1 = require("../ormconfig");
const Report_1 = require("../entities/Report");
const Persona_1 = require("../entities/Persona");
const User_1 = require("../entities/User");
const Post_1 = require("../entities/Post");
/**
 * Returns a list of reports. Optional query parameter `status` filters by
 * pending, reviewed or actioned.
 */
function listReports(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const status = req.query.status;
        const reportRepo = ormconfig_1.AppDataSource.getRepository(Report_1.Report);
        const where = status ? { status } : {};
        const reports = yield reportRepo.find({
            where,
            relations: ["reportingUser", "post", "persona"],
        });
        return res.json(reports);
    });
}
/**
 * Bans a persona by ID. When a persona is banned it can no longer be used to
 * post anonymously. Does not delete existing posts. Optionally takes a
 * `reportId` to mark a specific report as actioned.
 */
function banPersona(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { personaId } = req.params;
        const { reportId } = req.body;
        const personaRepo = ormconfig_1.AppDataSource.getRepository(Persona_1.Persona);
        const persona = yield personaRepo.findOne({ where: { id: personaId } });
        if (!persona) {
            return res.status(404).json({ message: "Persona not found" });
        }
        if (persona.isBanned) {
            return res.status(400).json({ message: "Persona is already banned" });
        }
        persona.isBanned = true;
        yield personaRepo.save(persona);
        if (reportId) {
            const reportRepo = ormconfig_1.AppDataSource.getRepository(Report_1.Report);
            const report = yield reportRepo.findOne({ where: { id: reportId } });
            if (report) {
                report.status = "actioned";
                yield reportRepo.save(report);
            }
        }
        return res.json({ message: "Persona banned" });
    });
}
/**
 * Bans a user by ID. The user will no longer be able to authenticate or post
 * content. Optionally marks a report as actioned.
 */
function banUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId } = req.params;
        const { reportId } = req.body;
        const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepo.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.isBanned) {
            return res.status(400).json({ message: "User is already banned" });
        }
        user.isBanned = true;
        yield userRepo.save(user);
        if (reportId) {
            const reportRepo = ormconfig_1.AppDataSource.getRepository(Report_1.Report);
            const report = yield reportRepo.findOne({ where: { id: reportId } });
            if (report) {
                report.status = "actioned";
                yield reportRepo.save(report);
            }
        }
        return res.json({ message: "User banned" });
    });
}
/**
 * Takes down a post. The post is deleted from the database. Optionally marks
 * a report as actioned.
 */
function takedownPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { postId } = req.params;
        const { reportId } = req.body;
        const postRepo = ormconfig_1.AppDataSource.getRepository(Post_1.Post);
        const post = yield postRepo.findOne({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        yield postRepo.remove(post);
        if (reportId) {
            const reportRepo = ormconfig_1.AppDataSource.getRepository(Report_1.Report);
            const report = yield reportRepo.findOne({ where: { id: reportId } });
            if (report) {
                report.status = "actioned";
                yield reportRepo.save(report);
            }
        }
        return res.json({ message: "Post removed" });
    });
}
/**
 * Marks a report as reviewed without taking direct action.
 */
function reviewReport(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { reportId } = req.params;
        const reportRepo = ormconfig_1.AppDataSource.getRepository(Report_1.Report);
        const report = yield reportRepo.findOne({ where: { id: reportId } });
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        report.status = "reviewed";
        yield reportRepo.save(report);
        return res.json({ message: "Report marked as reviewed" });
    });
}
