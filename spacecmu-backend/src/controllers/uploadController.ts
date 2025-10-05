import { Request, Response } from "express";

export function uploadFile(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // สร้าง URL ที่จะใช้เข้าถึงไฟล์ได้
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;

  // ส่ง URL กลับไปให้ Frontend
  return res.status(201).json({
    message: "File uploaded successfully",
    url: fileUrl,
  });
}
