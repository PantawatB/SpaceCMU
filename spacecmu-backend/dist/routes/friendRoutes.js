"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const friendController_1 = require("../controllers/friendController");
const router = (0, express_1.Router)();
<<<<<<< HEAD
// ทุก route เกี่ยวกับ friend ต้อง login ก่อน
router.use(auth_1.authenticateToken);
// 📌 ส่งคำขอเป็นเพื่อน
// POST /api/friends/request
router.post("/request", friendController_1.sendFriendRequest);
// 📌 ยอมรับคำขอเป็นเพื่อน
// POST /api/friends/accept/:friendId
router.post("/accept/:requestId", friendController_1.acceptFriendRequest);
// 📌 ปฏิเสธคำขอเป็นเพื่อน
// POST /api/friends/reject/:friendId
router.post("/reject/:friendId", friendController_1.rejectFriendRequest);
// 📌 ลบเพื่อน
// DELETE /api/friends/:friendId
router.delete("/:friendId", friendController_1.removeFriend);
// 📌 ดูเพื่อนทั้งหมด
// GET /api/friends
router.get("/", friendController_1.listFriends);
=======
// All routes in this file require authentication
router.use(auth_1.authenticateToken);
router.post('/request', friendController_1.sendFriendRequest);
router.get('/requests', friendController_1.listFriendRequests);
router.post('/request/:requestId/respond', friendController_1.respondToFriendRequest);
router.get('/list', friendController_1.listFriends);
router.delete('/:friendId', friendController_1.removeFriend);
>>>>>>> 712e08e47b3b671c3607c286d1d1ad01f8b90805
exports.default = router;
