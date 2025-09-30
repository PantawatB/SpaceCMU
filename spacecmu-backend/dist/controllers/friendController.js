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
exports.respondToFriendRequest = respondToFriendRequest;
exports.listFriends = listFriends;
exports.removeFriend = removeFriend;
const ormconfig_1 = require("../ormconfig");
const User_1 = require("../entities/User");
const FriendRequest_1 = require("../entities/FriendRequest");
/**
 * Sends a friend request from the authenticated user to another user. Fails if
 * a request already exists or the users are already friends.
 */
function sendFriendRequest(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { toUserId } = req.body;
        if (!toUserId) {
            return res.status(400).json({ message: 'toUserId is required' });
        }
        // @ts-ignore
        const fromUser = req.user;
        if (fromUser.id === toUserId) {
            return res.status(400).json({ message: 'You cannot friend yourself' });
        }
        const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
        const target = yield userRepo.findOne({ where: { id: toUserId }, relations: ['friends'] });
        if (!target) {
            return res.status(404).json({ message: 'Target user not found' });
        }
        // Check if already friends
        if (fromUser.friends && fromUser.friends.some((f) => f.id === toUserId)) {
            return res.status(400).json({ message: 'You are already friends' });
        }
        // Check existing friend request
        const frRepo = ormconfig_1.AppDataSource.getRepository(FriendRequest_1.FriendRequest);
        const existing = yield frRepo.findOne({ where: { fromUser: fromUser, toUser: target, status: 'pending' } });
        if (existing) {
            return res.status(400).json({ message: 'Friend request already sent' });
        }
        const reverse = yield frRepo.findOne({ where: { fromUser: target, toUser: fromUser, status: 'pending' } });
        if (reverse) {
            return res.status(400).json({ message: 'Friend request already received from this user' });
        }
        const request = frRepo.create({ fromUser, toUser: target, status: 'pending' });
        yield frRepo.save(request);
        return res.status(201).json({ message: 'Friend request sent' });
    });
}
/**
 * Lists pending friend requests for the authenticated user. Returns requests
 * both sent by and received by the user.
 */
function listFriendRequests(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const user = req.user;
        const frRepo = ormconfig_1.AppDataSource.getRepository(FriendRequest_1.FriendRequest);
        const requests = yield frRepo.find({ where: [{ toUser: user }, { fromUser: user }], relations: ['fromUser', 'toUser'] });
        return res.json(requests);
    });
}
/**
 * Accepts or declines a friend request. If accepted, both users become
 * friends via the Many‑to‑Many relation. The request status is updated
 * accordingly.
 */
function respondToFriendRequest(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { requestId } = req.params;
        const { action } = req.body; // 'accept' or 'decline'
        if (!['accept', 'decline'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }
        // @ts-ignore
        const user = req.user;
        const frRepo = ormconfig_1.AppDataSource.getRepository(FriendRequest_1.FriendRequest);
        const request = yield frRepo.findOne({ where: { id: requestId }, relations: ['fromUser', 'toUser'] });
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: 'Friend request not found or already handled' });
        }
        // Ensure user is either sender or recipient
        if (request.toUser.id !== user.id && request.fromUser.id !== user.id) {
            return res.status(403).json({ message: 'You are not authorized to act on this request' });
        }
        if (action === 'decline') {
            request.status = 'declined';
            yield frRepo.save(request);
            return res.json({ message: 'Friend request declined' });
        }
        // Accept
        request.status = 'accepted';
        yield frRepo.save(request);
        // Add each other to friends lists
        const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
        const fromUser = yield userRepo.findOne({ where: { id: request.fromUser.id }, relations: ['friends'] });
        const toUser = yield userRepo.findOne({ where: { id: request.toUser.id }, relations: ['friends'] });
        if (!fromUser || !toUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        fromUser.friends = [...(fromUser.friends || []), toUser];
        toUser.friends = [...(toUser.friends || []), fromUser];
        yield userRepo.save(fromUser);
        yield userRepo.save(toUser);
        return res.json({ message: 'Friend request accepted' });
    });
}
/**
 * Lists friends of the authenticated user. Returns only basic profile
 * information to avoid leaking sensitive data.
 */
function listFriends(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const user = req.user;
        const friends = user.friends || [];
        const result = friends.map((f) => ({ id: f.id, name: f.name }));
        return res.json(result);
    });
}
/**
 * Removes a friend. After removal neither user will see each other's friend
 * posts and the relationship is deleted.
 */
function removeFriend(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { friendId } = req.params;
        // @ts-ignore
        const user = req.user;
        const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
        const friend = yield userRepo.findOne({ where: { id: friendId }, relations: ['friends'] });
        if (!friend) {
            return res.status(404).json({ message: 'Friend not found' });
        }
        // Remove friend from both sides
        user.friends = (user.friends || []).filter((f) => f.id !== friendId);
        friend.friends = (friend.friends || []).filter((f) => f.id !== user.id);
        yield userRepo.save(user);
        yield userRepo.save(friend);
        return res.json({ message: 'Friend removed' });
    });
}
