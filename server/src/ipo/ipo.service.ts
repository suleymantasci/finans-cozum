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

    if (status && status.length > 0) {
      where.status = { in: status };
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

    // Fetch ALL matching records to sort in memory by parsed date string
    const [allListings, total] = await Promise.all([
      this.prisma.ipoListing.findMany({
        where,
        include: {
          detail: true,
          results: true,
          applicationPlaces: true,
        },
        // Remove DB sorting by ipoDate string since it is not chronologically accurate
        // We can sort by createdAt as a secondary sort or just rely on manual sort
      }),
      this.prisma.ipoListing.count({ where }),
    ]);

    // Manual Sorting Logic
    const sortedListings = allListings.sort((a, b) => {
      // Primary Sort: New listings first (if isNew is significant)
      // Actually sticking to user request: pure Date sort primarily?
      // User said "tarihe göre sıralama ... sıralamayıda ona göre yapalım"
      // But typically we want "isNew" items on top or highlighted?
      // Original code had `isNew: 'desc'` then date. I will preserve that.
      
      if (a.isNew !== b.isNew) {
          return a.isNew ? -1 : 1; // true comes first
      }

      const dateA = this.parseDateFromStr(a.ipoDate);
      const dateB = this.parseDateFromStr(b.ipoDate);

      return dateB - dateA; // Descending (Latest date first)
    });


    // Pagination logic
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedListings = sortedListings.slice(startIndex, endIndex);

    const data: IpoResponseDto[] = paginatedListings.map((listing) => ({
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

  private parseDateFromStr(dateStr: string): number {
      if (!dateStr) return 0;
      const clean = dateStr.trim().toLowerCase();
      
      // Find Year
      const yearMatch = clean.match(/\d{4}/);
      const year = yearMatch ? parseInt(yearMatch[0]) : 0;
      if (year === 0) return 0; // No valid year found, treat as 0 (oldest/unknown)

      // Find Month
      // Order matters to match longest strings first if overlaps? 
      // But standard months are distinct enough. 
      // "mart" vs "mart" ok.
      const months = ['ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran', 'temmuz', 'ağustos', 'eylül', 'ekim', 'kasım', 'aralık'];
      let monthIndex = 0; // Default Jan
      let foundMonth = false;
      
      // We search for the first occurring month name? Or iterate month names?
      // Iterate month names and find first match in string?
      // If string is "28 şubat - 1 mart", we want "şubat" (Feb).
      // So we should find the POSITION of match.
      
      let minPos = 9999;
      
      months.forEach((m, index) => {
          const idx = clean.indexOf(m);
          if (idx !== -1 && idx < minPos) {
              minPos = idx;
              monthIndex = index;
              foundMonth = true;
          }
      });
      
      // If no month found, default to Jan 1st of Year?
      // Or 0? Retain year at least.
      
      // Find Day
      // We want the number immediately preceding the month?
      // Or just the first number in the string that is NOT the year.
      const strWithoutYear = clean.replace(new RegExp(year.toString(), 'g'), '');
      const dayMatch = strWithoutYear.match(/(\d+)/);
      const day = dayMatch ? parseInt(dayMatch[1]) : 1;
      
      return new Date(year, monthIndex, day).getTime();
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

  /**
   * Check if listing exists by BIST code or detail URL
   */
  async findListingByBistCodeOrUrl(bistCode: string, detailUrl: string) {
    return this.prisma.ipoListing.findFirst({
      where: {
        OR: [
          { bistCode },
          { detailUrl },
        ],
      },
      include: {
        detail: true,
      },
    });
  }

  /**
   * Check if detail was modified by comparing lastModified
   */
  async hasDetailChanged(listingId: string, newLastModified: string | null): Promise<boolean> {
    const existingDetail = await this.prisma.ipoDetail.findUnique({
      where: { listingId },
      select: { lastModified: true },
    });

    if (!existingDetail) return true; // No detail exists, should update
    if (!newLastModified) return false; // No new lastModified info, assume unchanged

    return existingDetail.lastModified !== newLastModified;
  }
}
