import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export enum AdSlotPosition {
  TOP = 'TOP',
  SIDEBAR_LEFT = 'SIDEBAR_LEFT',
  SIDEBAR_RIGHT = 'SIDEBAR_RIGHT',
  MIDDLE = 'MIDDLE',
  BOTTOM = 'BOTTOM',
  INLINE = 'INLINE',
}

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty({ message: 'Şablon adı boş bırakılamaz' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AdSlotPosition)
  @IsNotEmpty()
  position: AdSlotPosition;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  scriptUrl?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsBoolean()
  @IsOptional()
  showOnMobile?: boolean;

  @IsBoolean()
  @IsOptional()
  showOnTablet?: boolean;

  @IsBoolean()
  @IsOptional()
  showOnDesktop?: boolean;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}


