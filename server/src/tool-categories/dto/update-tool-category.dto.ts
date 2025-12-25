import { PartialType } from '@nestjs/mapped-types';
import { CreateToolCategoryDto } from './create-tool-category.dto';

export class UpdateToolCategoryDto extends PartialType(CreateToolCategoryDto) {}


