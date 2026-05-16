import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { success, fail } from '../pkg/response';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('不支持的文件格式，允许: jpg/png/gif/webp/mp4'));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export function handleUpload(req: Request, res: Response) {
  try {
    if (!req.file) return fail(res, '请选择文件');
    const url = `/uploads/${req.file.filename}`;
    return success(res, { url, filename: req.file.filename });
  } catch (err: any) {
    return fail(res, err.message || '上传失败');
  }
}

export function handleUploadMultiple(req: Request, res: Response) {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const urls = files.map(f => ({ url: `/uploads/${f.filename}`, filename: f.filename }));
    return success(res, urls);
  } catch (err: any) {
    return fail(res, err.message || '上传失败');
  }
}
