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
exports.sendFriendRequest = sendFriendRequest;
exports.listFriendRequests = listFriendRequests;
exports.acceptFriendRequest = acceptFriendRequest;
exports.rejectFriendRequest = rejectFriendRequest;
exports.listFriends = listFriends;
exports.removeFriend = removeFriend;
const ormconfig_1 = require("../ormconfig");
const User_1 = require("../entities/User");
const FriendRequest_1 = require("../entities/FriendRequest");
/**
 * 📌 ส่งคำขอเป็นเพื่อน
 */
function sendFriendRequest(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { toUserId } = req.body;
            if (!toUserId) {
                return res.status(400).json({ message: "toUserId is required" });
            }
            const fromUser = req.user;
            if (fromUser.id === toUserId) {
                return res.status(400).json({ message: "You cannot friend yourself" });
            }
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            const target = yield userRepo.findOne({
                where: { id: toUserId },
                relations: ["friends"],
            });
            if (!target) {
                return res.status(404).json({ message: "Target user not found" });
            }
            if (fromUser.friends && fromUser.friends.some((f) => f.id === toUserId)) {
                return res.status(400).json({ message: "You are already friends" });
            }
            const frRepo = ormconfig_1.AppDataSource.getRepository(FriendRequest_1.FriendRequest);
            const existing = yield frRepo.findOne({
                where: { fromUser, toUser: target, status: "pending" },
            });
            if (existing) {
                return res.status(400).json({ message: "Friend request already sent" });
            }
            const reverse = yield frRepo.findOne({
                where: { fromUser: target, toUser: fromUser, status: "pending" },
            });
            if (reverse) {
                return res
                    .status(400)
                    .json({ message: "Friend request already received" });
            }
            const request = frRepo.create({
                fromUser,
                toUser: target,
                status: "pending",
            });
            yield frRepo.save(request);
            return res.status(201).json({ message: "Friend request sent" });
        }
        catch (err) {
            console.error("sendFriendRequest error:", err);
            return res.status(500).json({ message: "Failed to send friend request" });
        }
    });
}
/**
 * 📌 ดึงคำขอเป็นเพื่อน (pending)
 */
function listFriendRequests(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const frRepo = ormconfig_1.AppDataSource.getRepository(FriendRequest_1.FriendRequest);
            const requests = yield frRepo.find({
                where: [{ toUser: user }, { fromUser: user }],
                relations: ["fromUser", "toUser"],
            });
            return res.json(requests);
        }
        catch (err) {
            console.error("listFriendRequests error:", err);
            return res.status(500).json({ message: "Failed to fetch friend requests" });
        }
    });
}
/**
 * 📌 ยอมรับคำขอเพื่อน
 */
function acceptFriendRequest(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { requestId } = req.params;
            const user = req.user;
            const frRepo = ormconfig_1.AppDataSource.getRepository(FriendRequest_1.FriendRequest);
            const request = yield frRepo.findOne({
                where: { id: requestId },
                relations: ["fromUser", "toUser"],
            });
            if (!request || request.status !== "pending") {
                return res.status(404).json({ message: "Friend request not found" });
            }
            if (request.toUser.id !== user.id) {
                return res.status(403).json({ message: "Not authorized" });
            }
            request.status = "accepted";
            yield frRepo.save(request);
            // add each other to friends
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            const fromUser = yield userRepo.findOne({
                where: { id: request.fromUser.id },
                relations: ["friends"],
            });
            const toUser = yield userRepo.findOne({
                where: { id: request.toUser.id },
                relations: ["friends"],
            });
            if (fromUser && toUser) {
                fromUser.friends = [...(fromUser.friends || []), toUser];
                toUser.friends = [...(toUser.friends || []), fromUser];
                yield userRepo.save(fromUser);
                yield userRepo.save(toUser);
            }
            return res.json({ message: "Friend request accepted" });
        }
        catch (err) {
            console.error("acceptFriendRequest error:", err);
            return res.status(500).json({ message: "Failed to accept friend request" });
        }
    });
}
/**
 * 📌 ปฏิเสธคำขอเพื่อน
 */
function rejectFriendRequest(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { requestId } = req.params;
            const user = req.user;
            const frRepo = ormconfig_1.AppDataSource.getRepository(FriendRequest_1.FriendRequest);
            const request = yield frRepo.findOne({
                where: { id: requestId },
                relations: ["toUser"],
            });
            if (!request || request.status !== "pending") {
                return res.status(404).json({ message: "Friend request not found" });
            }
            if (request.toUser.id !== user.id) {
                return res.status(403).json({ message: "Not authorized" });
            }
            request.status = "declined";
            yield frRepo.save(request);
            return res.json({ message: "Friend request rejected" });
        }
        catch (err) {
            console.error("rejectFriendRequest error:", err);
            return res.status(500).json({ message: "Failed to reject friend request" });
        }
    });
}
/**
 * 📌 ดึงเพื่อนทั้งหมด
 */
function listFriends(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const friends = user.friends || [];
            const result = friends.map((f) => ({ id: f.id, name: f.name }));
            return res.json(result);
        }
        catch (err) {
            console.error("listFriends error:", err);
            return res.status(500).json({ message: "Failed to fetch friends list" });
        }
    });
}
/**
 * 📌 ลบเพื่อน
 */
function removeFriend(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { friendId } = req.params;
            const user = req.user;
            const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
            const friend = yield userRepo.findOne({
                where: { id: friendId },
                relations: ["friends"],
            });
            if (!friend) {
                return res.status(404).json({ message: "Friend not found" });
            }
            user.friends = (user.friends || []).filter((f) => f.id !== friendId);
            friend.friends = (friend.friends || []).filter((f) => f.id !== user.id);
            yield userRepo.save(user);
            yield userRepo.save(friend);
            return res.json({ message: "Friend removed" });
        }
        catch (err) {
            console.error("removeFriend error:", err);
            return res.status(500).json({ message: "Failed to remove friend" });
        }
    });
}
