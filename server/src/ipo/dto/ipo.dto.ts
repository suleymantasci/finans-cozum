import { IsOptional, IsEnum, IsBoolean, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum IpoStatus {
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
  DRAFT = 'DRAFT',
}

export class IpoFilterDto {
  @IsOptional()
  @IsEnum(IpoStatus)
  status?: IpoStatus;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isNew?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasResults?: boolean;

  @IsOptional()
  @IsString()
  search?: string; // Search by company name or BIST code

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number = 20;
}

export class IpoListingDto {
  id: string;
  bistCode: string;
  companyName: string;
  ipoDate: string;
  logoUrl?: string;
  isNew: boolean;
  hasResults: boolean;
  status: IpoStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class IpoDetailDto {
  id: string;
  listingId: string;
  ipoDate?: string;
  ipoDateTimeRange?: string;
  ipoPrice?: string;
  distributionMethod?: string;
  shareAmount?: string;
  intermediary?: string;
  consortium: string[];
  actualCirculation?: string;
  actualCirculationPct?: string;
  firstTradeDate?: string;
  market?: string;
  summaryInfo?: any;
  companyDescription?: string;
  city?: string;
  foundedDate?: string;
  attachments?: any;
  lastModified?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class IpoResultDto {
  id: string;
  listingId: string;
  resultsData: any;
  createdAt: Date;
  updatedAt: Date;
}

export class IpoApplicationPlaceDto {
  id: string;
  listingId: string;
  name: string;
  isConsortium: boolean;
  isUnlisted: boolean;
  createdAt: Date;
}

export class IpoResponseDto {
  listing: IpoListingDto;
  detail?: IpoDetailDto;
  results?: IpoResultDto;
  applicationPlaces?: IpoApplicationPlaceDto[];
}

export class IpoListResponseDto {
  data: IpoResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
