import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ReviewSourceConfigDto {
  @IsString()
  universityName!: string;

  @IsString()
  source!: string;

  @IsString()
  url!: string;

  @IsString()
  reviewSelector!: string;

  @IsString()
  textSelector!: string;

  @IsOptional()
  @IsString()
  authorSelector?: string;

  @IsOptional()
  @IsString()
  ratingSelector?: string;

  @IsOptional()
  @IsString()
  waitSelector?: string;

  

  @IsOptional()
  debug?: boolean;
  
}

export class ParseReviewsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewSourceConfigDto)
  sources!: ReviewSourceConfigDto[];
}