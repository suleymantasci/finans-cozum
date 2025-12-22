import { IsEnum, IsOptional, IsBoolean, IsInt, IsString, IsDateString } from 'class-validator';

export enum NewsAdSlotPosition {
  TOP = 'TOP',
  BETWEEN_NEWS = 'BETWEEN_NEWS',
  SIDEBAR_LEFT = 'SIDEBAR_LEFT',
  SIDEBAR_RIGHT = 'SIDEBAR_RIGHT',
  AFTER_IMAGE = 'AFTER_IMAGE',
  IN_CONTENT = 'IN_CONTENT',
  BOTTOM = 'BOTTOM',
}

export class CreateNewsAdSlotDto {
  @IsEnum(NewsAdSlotPosition)
  position: NewsAdSlotPosition;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  scriptUrl?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsBoolean()
  showOnMobile?: boolean;

  @IsOptional()
  @IsBoolean()
  showOnTablet?: boolean;

  @IsOptional()
  @IsBoolean()
  showOnDesktop?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

