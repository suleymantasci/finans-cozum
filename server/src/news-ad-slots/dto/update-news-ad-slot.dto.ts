import { PartialType } from '@nestjs/mapped-types';
import { CreateNewsAdSlotDto } from './create-news-ad-slot.dto';

export class UpdateNewsAdSlotDto extends PartialType(CreateNewsAdSlotDto) {}


