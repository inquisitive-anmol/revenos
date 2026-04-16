import multer from 'multer';
import { BadRequestError } from '@/errors/AppError';

const memoryStorage = multer.memoryStorage();

const csvFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel'];
  if (!allowedMimeTypes.includes(file.mimetype) || !file.originalname.endsWith('.csv')) {
    return cb(new BadRequestError('Only CSV files are accepted'));
  }
  cb(null, true);
};

export const uploadCsv = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: csvFileFilter,
}).single('file');
