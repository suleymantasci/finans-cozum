import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
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

export class CreateAdSlotDto {
  @IsString()
  @IsOptional()
  toolId?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsEnum(AdSlotPosition)
  @IsNotEmpty()
  position: AdSlotPosition;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  order?: number;

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

