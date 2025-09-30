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
exports.upsertPersona = upsertPersona;
const ormconfig_1 = require("../ormconfig");
const Persona_1 = require("../entities/Persona");
const User_1 = require("../entities/User");
/**
 * Retrieves the persona of the currently authenticated user. Returns null if
 * none exists.
 */
function getMyPersona(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const user = req.user;
        return res.json({ persona: user.persona || null });
    });
}
/**
 * Creates or updates the authenticated user's persona. Enforces a monthly
 * change limit (default 2 changes per month). If the user does not yet
 * have a persona, one is created. Otherwise the display name and avatar
 * can be modified within the allowed limits.
 */
function upsertPersona(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const user = req.user;
        const { displayName, avatarUrl } = req.body;
        if (!displayName) {
            return res.status(400).json({ message: 'displayName is required' });
        }
        const personaRepo = ormconfig_1.AppDataSource.getRepository(Persona_1.Persona);
        let persona = user.persona;
        const now = new Date();
        if (!persona) {
            // Create new persona
            persona = personaRepo.create({ displayName, avatarUrl, changeCount: 1, lastChangedAt: now, user });
            yield personaRepo.save(persona);
            // Attach persona to user
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            user.persona = persona;
            yield userRepo.save(user);
            return res.status(201).json({ message: 'Persona created', persona });
        }
        // Existing persona – enforce monthly change limit
        const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
        const diff = now.getTime() - persona.lastChangedAt.getTime();
        if (diff > ONE_MONTH_MS) {
            // Reset change count when more than a month has passed
            persona.changeCount = 0;
            persona.lastChangedAt = now;
        }
        const MAX_CHANGES_PER_MONTH = 2;
        if (persona.changeCount >= MAX_CHANGES_PER_MONTH) {
            return res.status(429).json({ message: 'Persona change limit reached for this month' });
        }
        persona.displayName = displayName;
        persona.avatarUrl = avatarUrl;
        persona.changeCount += 1;
        persona.lastChangedAt = now;
        yield personaRepo.save(persona);
        return res.json({ message: 'Persona updated', persona });
    });
}
