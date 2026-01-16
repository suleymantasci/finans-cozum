import { Controller, Get, Post, Query, Param, UseGuards } from '@nestjs/common';
import { IpoService } from './ipo.service';
import { IpoScraperService } from './ipo-scraper.service';
import { IpoFilterDto } from './dto/ipo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('ipo')
export class IpoController {
  constructor(
    private readonly ipoService: IpoService,
    private readonly scraperService: IpoScraperService,
  ) {}

  /**
   * Get all IPO listings with filters
   * GET /api/ipo?status=UPCOMING&page=1&limit=20
   */
  @Get()
  async findAll(@Query() filterDto: IpoFilterDto) {
    return this.ipoService.findAll(filterDto);
  }

  /**
   * Trigger full scrape (admin only)
   * POST /api/ipo/scrape
   */
  @Post('scrape')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async triggerFullScrape() {
    // Run in background
    this.scraperService.scrapeAllIpos().catch((error) => {
      console.error('Full scrape failed:', error);
    });

    return {
      message: 'Full scrape started in background',
    };
  }

  /**
   * Trigger sync - yeni verileri ekler, revizyonları günceller (admin only)
   * POST /api/ipo/sync
   */
  @Post('sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async triggerDailySync() {
    // Run in background
    this.scraperService.scrapeDailyUpdates().catch((error) => {
      console.error('Daily sync failed:', error);
    });

    return {
      message: 'Sync started in background - yeni veriler eklenecek, revizyonlar kontrol edilecek',
    };
  }

  /**
   * Get single IPO by BIST code
   * GET /api/ipo/FRMPL
   * Bu route en sonda olmalı (dinamik route)
   */
  @Get(':bistCode')
  async findOne(@Param('bistCode') bistCode: string) {
    return this.ipoService.findByBistCode(bistCode);
  }
}
