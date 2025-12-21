import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private readonly uploadPath: string;

  constructor(private configService: ConfigService) {
    // Upload klasörünü oluştur
    this.uploadPath = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory() {
    const dirs = [
      this.uploadPath,
      path.join(this.uploadPath, 'images'),
      path.join(this.uploadPath, 'videos'),
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async saveFile(file: Express.Multer.File, type: 'image' | 'video'): Promise<string> {
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const subDir = type === 'image' ? 'images' : 'videos';
    const filePath = path.join(this.uploadPath, subDir, fileName);

    // Dosyayı kaydet
    fs.writeFileSync(filePath, file.buffer);

    // URL döndür
    const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3001';
    return `${baseUrl}/uploads/${subDir}/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const urlPath = new URL(fileUrl).pathname;
      const filePath = path.join(process.cwd(), urlPath);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Dosya bulunamazsa sessizce devam et
    }
  }
}


