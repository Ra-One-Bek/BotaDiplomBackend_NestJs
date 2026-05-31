import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { ParseReviewsDto } from './dto/parse-reviews.dto';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  getUniversities() {
    return this.universitiesService.getUniversities();
  }

  @Get(':id/reviews')
  getReviews(@Param('id', ParseIntPipe) id: number) {
    return this.universitiesService.getReviews(id);
  }

  @Post('seed')
  seedUniversities() {
    return this.universitiesService.seedUniversities();
  }

  @Post('parse-reviews')
    parseReviews(@Body() dto: ParseReviewsDto) {
    return this.universitiesService.parseReviews(dto);
    }

    @Post('parse-default-reviews')
    parseDefaultReviews() {
    return this.universitiesService.parseDefaultReviews();
    }
}