import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { Report } from "../entities/Report";
import { Persona } from "../entities/Persona";
import { User } from "../entities/User";
import { Post } from "../entities/Post";

/**
 * Returns a list of reports. Optional query parameter `status` filters by
 * pending, reviewed or actioned.
 */
export async function listReports(req: Request, res: Response) {
  const status = req.query.status as
    | "pending"
    | "reviewed"
    | "actioned"
    | undefined;
  const reportRepo = AppDataSource.getRepository(Report);
  const where = status ? { status } : {};
  const reports = await reportRepo.find({
    where,
    relations: ["reportingUser", "post", "persona"],
  });
  return res.json(reports);
}

/**
 * Bans a persona by ID. When a persona is banned it can no longer be used to
 * post anonymously. Does not delete existing posts. Optionally takes a
 * `reportId` to mark a specific report as actioned.
 */
export async function banPersona(req: Request, res: Response) {
  const { personaId } = req.params;
  const { reportId } = req.body;
  const personaRepo = AppDataSource.getRepository(Persona);
  const persona = await personaRepo.findOne({ where: { id: personaId } });
  if (!persona) {
    return res.status(404).json({ message: "Persona not found" });
  }
  if (persona.isBanned) {
    return res.status(400).json({ message: "Persona is already banned" });
  }
  persona.isBanned = true;
  await personaRepo.save(persona);
  if (reportId) {
    const reportRepo = AppDataSource.getRepository(Report);
    const report = await reportRepo.findOne({ where: { id: reportId } });
    if (report) {
      report.status = "actioned";
      await reportRepo.save(report);
    }
  }
  return res.json({ message: "Persona banned" });
}

/**
 * Bans a user by ID. The user will no longer be able to authenticate or post
 * content. Optionally marks a report as actioned.
 */
export async function banUser(req: Request, res: Response) {
  const { userId } = req.params;
  const { reportId } = req.body;
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (user.isBanned) {
    return res.status(400).json({ message: "User is already banned" });
  }
  user.isBanned = true;
  await userRepo.save(user);
  if (reportId) {
    const reportRepo = AppDataSource.getRepository(Report);
    const report = await reportRepo.findOne({ where: { id: reportId } });
    if (report) {
      report.status = "actioned";
      await reportRepo.save(report);
    }
  }
  return res.json({ message: "User banned" });
}

/**
 * Takes down a post. The post is deleted from the database. Optionally marks
 * a report as actioned.
 */
export async function takedownPost(req: Request, res: Response) {
  const { postId } = req.params;
  const { reportId } = req.body;
  const postRepo = AppDataSource.getRepository(Post);
  const post = await postRepo.findOne({ where: { id: postId } });
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  await postRepo.remove(post);
  if (reportId) {
    const reportRepo = AppDataSource.getRepository(Report);
    const report = await reportRepo.findOne({ where: { id: reportId } });
    if (report) {
      report.status = "actioned";
      await reportRepo.save(report);
    }
  }
  return res.json({ message: "Post removed" });
}

/**
 * Marks a report as reviewed without taking direct action.
 */
export async function reviewReport(req: Request, res: Response) {
  const { reportId } = req.params;
  const reportRepo = AppDataSource.getRepository(Report);
  const report = await reportRepo.findOne({ where: { id: reportId } });
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }
  report.status = "reviewed";
  await reportRepo.save(report);
  return res.json({ message: "Report marked as reviewed" });
}
