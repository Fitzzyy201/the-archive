import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadEntity } from './upload.interface';
import { getUploadMulterOptions } from './upload.multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const VALID_ENTITIES: UploadEntity[] = ['produk', 'resi', 'ktp', 'skck', 'profile', 'komplain'];

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('produk')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', getUploadMulterOptions('produk')))
  async uploadProduk(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file, 'produk');
  }

  @Post('resi')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', getUploadMulterOptions('resi')))
  async uploadResi(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file, 'resi');
  }

  @Post('ktp')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', getUploadMulterOptions('ktp')))
  async uploadKtp(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file, 'ktp');
  }

  @Post('skck')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', getUploadMulterOptions('skck')))
  async uploadSkck(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file, 'skck');
  }

  @Post('profile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', getUploadMulterOptions('profile')))
  async uploadProfile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file, 'profile');
  }

  @Post('komplain')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', getUploadMulterOptions('komplain')))
  async uploadKomplain(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file, 'komplain');
  }

  @Get(':entity/:filename')
  @ApiParam({ name: 'entity', enum: VALID_ENTITIES })
  @ApiParam({ name: 'filename', type: 'string' })
  getFileUrl(@Param('entity') entity: string, @Param('filename') filename: string) {
    if (!VALID_ENTITIES.includes(entity as UploadEntity)) {
      throw new BadRequestException('Entity tidak valid');
    }
    return { url: this.uploadService.getFileUrl(entity as UploadEntity, filename) };
  }
}
