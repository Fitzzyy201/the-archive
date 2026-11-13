import { Options, diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { UploadEntity } from './upload.interface';

export const BASE_UPLOAD_PATH = join(process.cwd(), 'uploads');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function ensureEntityPath(entity: UploadEntity): string {
  if (!existsSync(BASE_UPLOAD_PATH)) {
    mkdirSync(BASE_UPLOAD_PATH, { recursive: true });
  }
  const entityPath = join(BASE_UPLOAD_PATH, entity);
  if (!existsSync(entityPath)) {
    mkdirSync(entityPath, { recursive: true });
  }
  return entityPath;
}

// Dipakai saat dekorator dievaluasi (belum ada instance service),
// jadi destination tidak boleh bergantung pada `this`.
export function getUploadMulterOptions(entity: UploadEntity): Options {
  return {
    storage: diskStorage({
      destination: (req, file, cb) => cb(null, ensureEntityPath(entity)),
      filename: (req, file, cb) => {
        cb(null, `${uuidv4()}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(
          new Error(
            'Hanya file gambar (JPEG, PNG, WebP) dan PDF yang diperbolehkan',
          ),
        );
        return;
      }
      cb(null, true);
    },
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
  };
}
