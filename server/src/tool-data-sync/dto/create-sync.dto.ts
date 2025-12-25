import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsObject,
  Min,
} from 'class-validator';

export enum SyncFrequency {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  TWICE_DAILY = 'TWICE_DAILY',
  FOUR_TIMES_DAILY = 'FOUR_TIMES_DAILY',
  CUSTOM = 'CUSTOM',
}

export class CreateSyncDto {
  @IsString()
  @IsNotEmpty({ message: 'Tool ID boş bırakılamaz' })
  toolId: string;

  @IsString()
  @IsNotEmpty({ message: 'Sync job adı boş bırakılamaz' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'API URL boş bırakılamaz' })
  apiUrl: string;

  @IsString()
  @IsOptional()
  apiMethod?: string;

  @IsObject()
  @IsOptional()
  apiHeaders?: any;

  @IsObject()
  @IsOptional()
  apiBody?: any;

  @IsString()
  @IsOptional()
  dataPath?: string;

  @IsString()
  @IsOptional()
  transformScript?: string;

  @IsEnum(SyncFrequency)
  @IsOptional()
  frequency?: SyncFrequency;

  @IsString()
  @IsOptional()
  cronExpression?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}


