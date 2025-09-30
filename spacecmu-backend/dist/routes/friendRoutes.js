"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const friendController_1 = require("../controllers/friendController");
const router = (0, express_1.Router)();
// All routes in this file require authentication
router.use(auth_1.authenticateToken);
router.post('/request', friendController_1.sendFriendRequest);
router.get('/requests', friendController_1.listFriendRequests);
router.post('/request/:requestId/respond', friendController_1.respondToFriendRequest);
router.get('/list', friendController_1.listFriends);
router.delete('/:friendId', friendController_1.removeFriend);
exports.default = router;
