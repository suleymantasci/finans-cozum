import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsArray,
  IsObject,
  Min,
} from 'class-validator';

export enum ToolStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum ToolDataSourceType {
  STATIC = 'STATIC',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
}

export class CreateToolDto {
  @IsString()
  @IsNotEmpty({ message: 'Araç adı boş bırakılamaz' })
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ToolStatus)
  @IsOptional()
  status?: ToolStatus;

  @IsString()
  @IsNotEmpty({ message: 'Component adı boş bırakılamaz' })
  component: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  bgColor?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsEnum(ToolDataSourceType)
  @IsOptional()
  dataSourceType?: ToolDataSourceType;

  @IsObject()
  @IsOptional()
  dataSourceConfig?: any;

  @IsObject()
  @IsOptional()
  config?: any;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @IsString()
  @IsOptional()
  categoryId?: string;
}

