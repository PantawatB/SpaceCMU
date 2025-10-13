import { Request, Response } from "express";

export function uploadFile(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // สร้าง URL ที่จะใช้เข้าถึงไฟล์ได้ โดยใช้ PUBLIC_BASE_URL
  const base =
    process.env.PUBLIC_BASE_URL ||
    `http://localhost:${process.env.PORT || 3001}`;
  const fileUrl = `${base}/uploads/${req.file.filename}`;

  // ส่ง URL กลับไปให้ Frontend
  return res.status(201).json({
    message: "File uploaded successfully",
    url: fileUrl,
  });
}
