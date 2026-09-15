import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadResult, UploadEntity } from './upload.interface';

@Injectable()
export class UploadService {
  private readonly baseUploadPath = join(process.cwd(), 'uploads');
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor() {
    this.ensureBaseDirectory();
  }

  private ensureBaseDirectory() {
    if (!existsSync(this.baseUploadPath)) {
      mkdirSync(this.baseUploadPath, { recursive: true });
    }
  }

  private getEntityPath(entity: UploadEntity): string {
    const entityPath = join(this.baseUploadPath, entity);
    if (!existsSync(entityPath)) {
      mkdirSync(entityPath, { recursive: true });
    }
    return entityPath;
  }

  getMulterConfig(entity: UploadEntity) {
    return {
      storage: diskStorage({
        destination: this.getEntityPath(entity),
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Hanya file gambar (JPEG, PNG, WebP) dan PDF yang diperbolehkan',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: this.maxFileSize,
      },
    };
  }

  async uploadFile(file: Express.Multer.File, entity: UploadEntity): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const relativePath = `/uploads/${entity}/${file.filename}`;

    return {
      url: relativePath,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  deleteFile(entity: UploadEntity, filename: string): boolean {
    const filePath = join(this.getEntityPath(entity), filename);
    if (existsSync(filePath)) {
      try {
        require('fs').unlinkSync(filePath);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  getFileUrl(entity: UploadEntity, filename: string): string {
    return `/uploads/${entity}/${filename}`;
  }
}