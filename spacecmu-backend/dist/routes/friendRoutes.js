"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const friendController_1 = require("../controllers/friendController");
const router = (0, express_1.Router)();
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
exports.default = router;
