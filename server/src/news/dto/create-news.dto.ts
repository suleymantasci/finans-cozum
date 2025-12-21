import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsDateString, IsUUID } from 'class-validator';
import { NewsStatus } from '../../common/enums/news-status.enum';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty({ message: 'Başlık gereklidir' })
  title: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsNotEmpty({ message: 'İçerik gereklidir' })
  content: string;

  @IsUUID(4, { message: 'Geçerli bir kategori seçiniz' })
  @IsNotEmpty({ message: 'Kategori seçilmelidir' })
  categoryId: string;

  @IsEnum(NewsStatus, { message: 'Geçerli bir durum seçiniz' })
  @IsOptional()
  status?: NewsStatus;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

