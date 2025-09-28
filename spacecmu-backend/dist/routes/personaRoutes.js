"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const personaController_1 = require("../controllers/personaController");
const router = (0, express_1.Router)();
router.get('/me', auth_1.authenticateToken, personaController_1.getMyPersona);
router.post('/', auth_1.authenticateToken, personaController_1.upsertPersona);
exports.default = router;
