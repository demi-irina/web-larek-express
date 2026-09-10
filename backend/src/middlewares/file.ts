import crypto from 'crypto';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { UPLOAD_DIR_TEMP } from '../config';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
];

fs.mkdirSync(UPLOAD_DIR_TEMP, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR_TEMP),
  filename: (_req, file, cb) => {
    const uniqueName = crypto.randomBytes(8).toString('hex');
    cb(null, `${uniqueName}${path.extname(file.originalname)}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  cb(null, ALLOWED_MIME_TYPES.includes(file.mimetype));
};

export default multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });
