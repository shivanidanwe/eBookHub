import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadSubDir = 'covers';
    if (file.fieldname === 'pdf' || file.fieldname === 'bookFile') {
      uploadSubDir = 'pdfs';
    } else if (file.fieldname === 'preview') {
      uploadSubDir = 'previews';
    }

    const uploadPath = path.resolve(__dirname, '../../../uploads', uploadSubDir);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedCoverExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
  const allowedDocExts = ['.pdf'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'cover') {
    if (allowedCoverExts.includes(ext)) {
      return cb(null, true);
    }
    return cb(new Error('Invalid image format for cover. Allowed: JPG, PNG, WEBP, SVG.'));
  }

  if (file.fieldname === 'pdf' || file.fieldname === 'bookFile' || file.fieldname === 'preview') {
    if (allowedDocExts.includes(ext)) {
      return cb(null, true);
    }
    return cb(new Error('Invalid document format. Only PDF files are supported.'));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});
