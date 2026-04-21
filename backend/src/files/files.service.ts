import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class FilesService implements OnModuleInit {
  private readonly logger = new Logger(FilesService.name);
  private minioClient: Minio.Client;
  private bucket: string;
  private storageReady = false;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('MINIO_BUCKET', 'stba-ai-files');
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: this.configService.get<number>('MINIO_PORT', 9000),
      useSSL: false,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket);
      }
      this.storageReady = true;
    } catch (error) {
      this.storageReady = false;
      this.logger.warn(
        `MinIO is unavailable. File upload endpoints will be disabled. ${String(error)}`,
      );
    }
  }

  private ensureStorageReady() {
    if (!this.storageReady) {
      throw new ServiceUnavailableException(
        'File storage service is unavailable. Please start MinIO and try again.',
      );
    }
  }

  async upload(file: Express.Multer.File, folder?: string) {
    this.ensureStorageReady();

    const fileName = folder
      ? `${folder}/${Date.now()}-${file.originalname}`
      : `${Date.now()}-${file.originalname}`;

    await this.minioClient.putObject(this.bucket, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get<number>('MINIO_PORT', 9000);
    const fileUrl = `http://${endpoint}:${port}/${this.bucket}/${fileName}`;

    return {
      success: true,
      data: {
        fileUrl,
        fileName: file.originalname,
        size: file.size,
      },
    };
  }

  async delete(fileName: string) {
    this.ensureStorageReady();
    await this.minioClient.removeObject(this.bucket, fileName);
    return { success: true, data: null, message: 'File berhasil dihapus' };
  }
}
