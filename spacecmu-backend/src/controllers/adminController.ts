import { Request, Response } from "express";
import { AppDataSource } from "../ormconfig";
import { Report } from "../entities/Report";
import { Persona } from "../entities/Persona";
import { User } from "../entities/User";
import { Post } from "../entities/Post";

/**
 * 📌 ดึงรายงานทั้งหมด (filter ด้วย status ได้)
 */
export async function listReports(req: Request, res: Response) {
  try {
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
  } catch (err) {
    console.error("listReports error:", err);
    return res.status(500).json({ message: "Failed to fetch reports" });
  }
}

/**
 * 📌 แบน persona
 */
export async function banPersona(req: Request, res: Response) {
  try {
    const { personaId } = req.params;
    const { reportId } = req.body;

    const personaRepo = AppDataSource.getRepository(Persona);
    const persona = await personaRepo.findOneBy({ id: personaId });

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
      const report = await reportRepo.findOneBy({ id: reportId });
      if (report) {
        report.status = "actioned";
        await reportRepo.save(report);
      }
    }

    return res.json({ message: "Persona banned", persona });
  } catch (err) {
    console.error("banPersona error:", err);
    return res.status(500).json({ message: "Failed to ban persona" });
  }
}

/**
 * 📌 แบน user
 */
export async function banUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { reportId } = req.body;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });

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
      const report = await reportRepo.findOneBy({ id: reportId });
      if (report) {
        report.status = "actioned";
        await reportRepo.save(report);
      }
    }

    return res.json({ message: "User banned", user });
  } catch (err) {
    console.error("banUser error:", err);
    return res.status(500).json({ message: "Failed to ban user" });
  }
}

/**
 * 📌 ลบโพสต์ (takedown post)
 */
export async function takedownPost(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const { reportId } = req.body;

    const postRepo = AppDataSource.getRepository(Post);
    const post = await postRepo.findOneBy({ id: postId });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await postRepo.remove(post);

    if (reportId) {
      const reportRepo = AppDataSource.getRepository(Report);
      const report = await reportRepo.findOneBy({ id: reportId });
      if (report) {
        report.status = "actioned";
        await reportRepo.save(report);
      }
    }

    return res.json({ message: "Post removed", postId });
  } catch (err) {
    console.error("takedownPost error:", err);
    return res.status(500).json({ message: "Failed to remove post" });
  }
}

/**
 * 📌 Mark report เป็น reviewed
 */
export async function reviewReport(req: Request, res: Response) {
  try {
    const { reportId } = req.params;
    const reportRepo = AppDataSource.getRepository(Report);

    const report = await reportRepo.findOneBy({ id: reportId });
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = "reviewed";
    await reportRepo.save(report);

    return res.json({ message: "Report marked as reviewed", report });
  } catch (err) {
    console.error("reviewReport error:", err);
    return res.status(500).json({ message: "Failed to review report" });
  }
}
