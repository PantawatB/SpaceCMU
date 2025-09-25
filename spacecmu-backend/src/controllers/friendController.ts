import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { User } from '../entities/User';
import { FriendRequest } from '../entities/FriendRequest';

/**
 * Sends a friend request from the authenticated user to another user. Fails if
 * a request already exists or the users are already friends.
 */
export async function sendFriendRequest(req: Request, res: Response) {
  const { toUserId } = req.body;
  if (!toUserId) {
    return res.status(400).json({ message: 'toUserId is required' });
  }
  // @ts-ignore
  const fromUser: User = req.user;
  if (fromUser.id === toUserId) {
    return res.status(400).json({ message: 'You cannot friend yourself' });
  }
  const userRepo = AppDataSource.getRepository(User);
  const target = await userRepo.findOne({ where: { id: toUserId }, relations: ['friends'] });
  if (!target) {
    return res.status(404).json({ message: 'Target user not found' });
  }
  // Check if already friends
  if (fromUser.friends && fromUser.friends.some((f) => f.id === toUserId)) {
    return res.status(400).json({ message: 'You are already friends' });
  }
  // Check existing friend request
  const frRepo = AppDataSource.getRepository(FriendRequest);
  const existing = await frRepo.findOne({ where: { fromUser: fromUser, toUser: target, status: 'pending' } });
  if (existing) {
    return res.status(400).json({ message: 'Friend request already sent' });
  }
  const reverse = await frRepo.findOne({ where: { fromUser: target, toUser: fromUser, status: 'pending' } });
  if (reverse) {
    return res.status(400).json({ message: 'Friend request already received from this user' });
  }
  const request = frRepo.create({ fromUser, toUser: target, status: 'pending' });
  await frRepo.save(request);
  return res.status(201).json({ message: 'Friend request sent' });
}

/**
 * Lists pending friend requests for the authenticated user. Returns requests
 * both sent by and received by the user.
 */
export async function listFriendRequests(req: Request, res: Response) {
  // @ts-ignore
  const user: User = req.user;
  const frRepo = AppDataSource.getRepository(FriendRequest);
  const requests = await frRepo.find({ where: [ { toUser: user }, { fromUser: user } ], relations: ['fromUser', 'toUser'] });
  return res.json(requests);
}

/**
 * Accepts or declines a friend request. If accepted, both users become
 * friends via the Many‑to‑Many relation. The request status is updated
 * accordingly.
 */
export async function respondToFriendRequest(req: Request, res: Response) {
  const { requestId } = req.params;
  const { action } = req.body; // 'accept' or 'decline'
  if (!['accept', 'decline'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }
  // @ts-ignore
  const user: User = req.user;
  const frRepo = AppDataSource.getRepository(FriendRequest);
  const request = await frRepo.findOne({ where: { id: requestId }, relations: ['fromUser', 'toUser'] });
  if (!request || request.status !== 'pending') {
    return res.status(404).json({ message: 'Friend request not found or already handled' });
  }
  // Ensure user is either sender or recipient
  if (request.toUser.id !== user.id && request.fromUser.id !== user.id) {
    return res.status(403).json({ message: 'You are not authorized to act on this request' });
  }
  if (action === 'decline') {
    request.status = 'declined';
    await frRepo.save(request);
    return res.json({ message: 'Friend request declined' });
  }
  // Accept
  request.status = 'accepted';
  await frRepo.save(request);
  // Add each other to friends lists
  const userRepo = AppDataSource.getRepository(User);
  const fromUser = await userRepo.findOne({ where: { id: request.fromUser.id }, relations: ['friends'] });
  const toUser = await userRepo.findOne({ where: { id: request.toUser.id }, relations: ['friends'] });
  if (!fromUser || !toUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  fromUser.friends = [...(fromUser.friends || []), toUser];
  toUser.friends = [...(toUser.friends || []), fromUser];
  await userRepo.save(fromUser);
  await userRepo.save(toUser);
  return res.json({ message: 'Friend request accepted' });
}

/**
 * Lists friends of the authenticated user. Returns only basic profile
 * information to avoid leaking sensitive data.
 */
export async function listFriends(req: Request, res: Response) {
  // @ts-ignore
  const user: User = req.user;
  const friends = user.friends || [];
  const result = friends.map((f) => ({ id: f.id, name: f.name }));
  return res.json(result);
}

/**
 * Removes a friend. After removal neither user will see each other's friend
 * posts and the relationship is deleted.
 */
export async function removeFriend(req: Request, res: Response) {
  const { friendId } = req.params;
  // @ts-ignore
  const user: User = req.user;
  const userRepo = AppDataSource.getRepository(User);
  const friend = await userRepo.findOne({ where: { id: friendId }, relations: ['friends'] });
  if (!friend) {
    return res.status(404).json({ message: 'Friend not found' });
  }
  // Remove friend from both sides
  user.friends = (user.friends || []).filter((f) => f.id !== friendId);
  friend.friends = (friend.friends || []).filter((f) => f.id !== user.id);
  await userRepo.save(user);
  await userRepo.save(friend);
  return res.json({ message: 'Friend removed' });
}
