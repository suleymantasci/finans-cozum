import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IpoFilterDto, IpoResponseDto, IpoListResponseDto } from './dto/ipo.dto';
import { IpoStatus } from '../generated/prisma/enums';

@Injectable()
export class IpoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filterDto: IpoFilterDto): Promise<IpoListResponseDto> {
    const { status, isNew, hasResults, search, page = 1, limit = 20 } = filterDto;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (isNew !== undefined) {
      where.isNew = isNew;
    }

    if (hasResults !== undefined) {
      where.hasResults = hasResults;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { bistCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      this.prisma.ipoListing.findMany({
        where,
        include: {
          detail: true,
          results: true,
          applicationPlaces: true,
        },
        orderBy: [
          { isNew: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.ipoListing.count({ where }),
    ]);

    const data: IpoResponseDto[] = listings.map((listing) => ({
      listing: {
        id: listing.id,
        bistCode: listing.bistCode,
        companyName: listing.companyName,
        ipoDate: listing.ipoDate,
        logoUrl: listing.logoUrl,
        isNew: listing.isNew,
        hasResults: listing.hasResults,
        status: listing.status as any,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      },
      detail: listing.detail ? {
        id: listing.detail.id,
        listingId: listing.detail.listingId,
        ipoDate: listing.detail.ipoDate,
        ipoDateTimeRange: listing.detail.ipoDateTimeRange,
        ipoPrice: listing.detail.ipoPrice,
        distributionMethod: listing.detail.distributionMethod,
        shareAmount: listing.detail.shareAmount,
        intermediary: listing.detail.intermediary,
        consortium: listing.detail.consortium,
        actualCirculation: listing.detail.actualCirculation,
        actualCirculationPct: listing.detail.actualCirculationPct,
        firstTradeDate: listing.detail.firstTradeDate,
        market: listing.detail.market,
        summaryInfo: listing.detail.summaryInfo,
        companyDescription: listing.detail.companyDescription,
        city: listing.detail.city,
        foundedDate: listing.detail.foundedDate,
        attachments: listing.detail.attachments,
        lastModified: listing.detail.lastModified,
        createdAt: listing.detail.createdAt,
        updatedAt: listing.detail.updatedAt,
      } : undefined,
      results: listing.results ? {
        id: listing.results.id,
        listingId: listing.results.listingId,
        resultsData: listing.results.resultsData,
        createdAt: listing.results.createdAt,
        updatedAt: listing.results.updatedAt,
      } : undefined,
      applicationPlaces: listing.applicationPlaces?.map((place) => ({
        id: place.id,
        listingId: place.listingId,
        name: place.name,
        isConsortium: place.isConsortium,
        isUnlisted: place.isUnlisted,
        createdAt: place.createdAt,
      })),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByBistCode(bistCode: string): Promise<IpoResponseDto> {
    const listing = await this.prisma.ipoListing.findUnique({
      where: { bistCode },
      include: {
        detail: true,
        results: true,
        applicationPlaces: true,
      },
    });

    if (!listing) {
      throw new NotFoundException(`IPO with BIST code ${bistCode} not found`);
    }

    return {
      listing: {
        id: listing.id,
        bistCode: listing.bistCode,
        companyName: listing.companyName,
        ipoDate: listing.ipoDate,
        logoUrl: listing.logoUrl,
        isNew: listing.isNew,
        hasResults: listing.hasResults,
        status: listing.status as any,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      },
      detail: listing.detail ? {
        id: listing.detail.id,
        listingId: listing.detail.listingId,
        ipoDate: listing.detail.ipoDate,
        ipoDateTimeRange: listing.detail.ipoDateTimeRange,
        ipoPrice: listing.detail.ipoPrice,
        distributionMethod: listing.detail.distributionMethod,
        shareAmount: listing.detail.shareAmount,
        intermediary: listing.detail.intermediary,
        consortium: listing.detail.consortium,
        actualCirculation: listing.detail.actualCirculation,
        actualCirculationPct: listing.detail.actualCirculationPct,
        firstTradeDate: listing.detail.firstTradeDate,
        market: listing.detail.market,
        summaryInfo: listing.detail.summaryInfo,
        companyDescription: listing.detail.companyDescription,
        city: listing.detail.city,
        foundedDate: listing.detail.foundedDate,
        attachments: listing.detail.attachments,
        lastModified: listing.detail.lastModified,
        createdAt: listing.detail.createdAt,
        updatedAt: listing.detail.updatedAt,
      } : undefined,
      results: listing.results ? {
        id: listing.results.id,
        listingId: listing.results.listingId,
        resultsData: listing.results.resultsData,
        createdAt: listing.results.createdAt,
        updatedAt: listing.results.updatedAt,
      } : undefined,
      applicationPlaces: listing.applicationPlaces?.map((place) => ({
        id: place.id,
        listingId: place.listingId,
        name: place.name,
        isConsortium: place.isConsortium,
        isUnlisted: place.isUnlisted,
        createdAt: place.createdAt,
      })),
    };
  }

  async createOrUpdateListing(data: {
    bistCode: string;
    companyName: string;
    ipoDate: string;
    detailUrl: string;
    logoUrl?: string;
    isNew: boolean;
    hasResults: boolean;
    status: IpoStatus;
  }) {
    return this.prisma.ipoListing.upsert({
      where: { bistCode: data.bistCode },
      create: {
        bistCode: data.bistCode,
        companyName: data.companyName,
        ipoDate: data.ipoDate,
        detailUrl: data.detailUrl,
        logoUrl: data.logoUrl,
        isNew: data.isNew,
        hasResults: data.hasResults,
        status: data.status,
      },
      update: {
        companyName: data.companyName,
        ipoDate: data.ipoDate,
        detailUrl: data.detailUrl,
        logoUrl: data.logoUrl,
        isNew: data.isNew,
        hasResults: data.hasResults,
        status: data.status,
      },
    });
  }

  async createOrUpdateDetail(listingId: string, data: any) {
    return this.prisma.ipoDetail.upsert({
      where: { listingId },
      create: { listingId, ...data },
      update: data,
    });
  }

  async createOrUpdateResults(listingId: string, resultsData: any) {
    return this.prisma.ipoResult.upsert({
      where: { listingId },
      create: { listingId, resultsData },
      update: { resultsData },
    });
  }

  async createApplicationPlaces(listingId: string, places: Array<{ name: string; isConsortium: boolean; isUnlisted: boolean }>) {
    // Delete existing places
    await this.prisma.ipoApplicationPlace.deleteMany({
      where: { listingId },
    });

    // Create new places
    if (places.length > 0) {
      await this.prisma.ipoApplicationPlace.createMany({
        data: places.map((place) => ({
          listingId,
          ...place,
        })),
      });
    }
  }

  async deleteAll() {
    // Due to cascade delete, deleting listings should delete details, results, etc.
    // But to be safe and thorough:
    await this.prisma.ipoListing.deleteMany({});
  }

  async updateListingBistCode(id: string, newBistCode: string, newLogoUrl?: string) {
    if (!newBistCode) return;
    
    // Check if code exists
    const existing = await this.prisma.ipoListing.findUnique({
        where: { bistCode: newBistCode }
    });
    
    if (existing) {
        console.warn(`Cannot update BIST code to ${newBistCode} because it already exists.`);
        return;
    }

    const updateData: any = { bistCode: newBistCode };
    if (newLogoUrl) {
        updateData.logoUrl = newLogoUrl;
    }

    return this.prisma.ipoListing.update({
        where: { id },
        data: updateData
    });
  }
}
