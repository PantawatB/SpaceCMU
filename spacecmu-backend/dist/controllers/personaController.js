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
exports.getMyPersona = getMyPersona;
exports.getPersona = getPersona;
exports.listPersonas = listPersonas;
exports.createPersona = createPersona;
exports.updatePersona = updatePersona;
exports.deletePersona = deletePersona;
const ormconfig_1 = require("../ormconfig");
const Persona_1 = require("../entities/Persona");
const User_1 = require("../entities/User");
/**
 * 📌 ดึง persona ของ user ที่ล็อกอิน
 */
function getMyPersona(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            return res.json({ persona: user.persona || null });
        }
        catch (err) {
            console.error("getMyPersona error:", err);
            return res.status(500).json({ message: "Failed to fetch persona" });
        }
    });
}
/**
 * 📌 ดึง persona ตาม userId
 */
function getPersona(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            const user = yield userRepo.findOne({
                where: { id: userId },
                relations: ["persona"],
            });
            if (!user || !user.persona) {
                return res.status(404).json({ message: "Persona not found" });
            }
            return res.json(user.persona);
        }
        catch (err) {
            console.error("getPersona error:", err);
            return res.status(500).json({ message: "Failed to fetch persona" });
        }
    });
}
/**
 * 📌 ดึง personas ทั้งหมด (admin/debug use)
 */
function listPersonas(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const personaRepo = ormconfig_1.AppDataSource.getRepository(Persona_1.Persona);
            const personas = yield personaRepo.find({ relations: ["user"] });
            return res.json(personas);
        }
        catch (err) {
            console.error("listPersonas error:", err);
            return res.status(500).json({ message: "Failed to fetch personas" });
        }
    });
}
/**
 * 📌 สร้าง persona ใหม่ (ครั้งแรกของ user)
 */
function createPersona(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user)
                return res.status(401).json({ message: "Unauthorized" });
            const { displayName, avatarUrl } = req.body;
            if (!displayName) {
                return res.status(400).json({ message: "displayName is required" });
            }
            if (user.persona) {
                return res
                    .status(400)
                    .json({ message: "Persona already exists, use updatePersona" });
            }
            const personaRepo = ormconfig_1.AppDataSource.getRepository(Persona_1.Persona);
            const persona = personaRepo.create({
                displayName,
                avatarUrl,
                changeCount: 1,
                lastChangedAt: new Date(),
                user,
            });
            yield personaRepo.save(persona);
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            user.persona = persona;
            yield userRepo.save(user);
            return res.status(201).json({ message: "Persona created", persona });
        }
        catch (err) {
            console.error("createPersona error:", err);
            return res.status(500).json({ message: "Failed to create persona" });
        }
    });
}
/**
 * 📌 อัปเดต persona ของ user
 */
function updatePersona(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user || !user.persona) {
                return res.status(404).json({ message: "Persona not found" });
            }
            const { displayName, avatarUrl } = req.body;
            const personaRepo = ormconfig_1.AppDataSource.getRepository(Persona_1.Persona);
            const persona = user.persona;
            if (displayName)
                persona.displayName = displayName;
            if (avatarUrl)
                persona.avatarUrl = avatarUrl;
            persona.changeCount += 1;
            persona.lastChangedAt = new Date();
            yield personaRepo.save(persona);
            return res.json({ message: "Persona updated", persona });
        }
        catch (err) {
            console.error("updatePersona error:", err);
            return res.status(500).json({ message: "Failed to update persona" });
        }
    });
}
/**
 * 📌 ลบ persona ของ user
 */
function deletePersona(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            if (!user || !user.persona) {
                return res.status(404).json({ message: "Persona not found" });
            }
            const personaRepo = ormconfig_1.AppDataSource.getRepository(Persona_1.Persona);
            yield personaRepo.remove(user.persona);
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            user.persona = null;
            yield userRepo.save(user);
            return res.json({ message: "Persona deleted" });
        }
        catch (err) {
            console.error("deletePersona error:", err);
            return res.status(500).json({ message: "Failed to delete persona" });
        }
    });
}
