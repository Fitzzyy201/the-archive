import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { UploadResult, UploadEntity } from './upload.interface';
import {
  BASE_UPLOAD_PATH,
  ensureEntityPath,
  getUploadMulterOptions,
} from './upload.multer';

@Injectable()
export class UploadService {
  private readonly baseUploadPath = BASE_UPLOAD_PATH;

  constructor() {
    if (!existsSync(this.baseUploadPath)) {
      mkdirSync(this.baseUploadPath, { recursive: true });
    }
  }

  getMulterConfig(entity: UploadEntity) {
    return getUploadMulterOptions(entity);
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
    const filePath = join(ensureEntityPath(entity), filename);
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
