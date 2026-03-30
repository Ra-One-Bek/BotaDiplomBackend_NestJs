import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get(':userId')
  getRecommendations(@Param('userId', ParseIntPipe) userId: number) {
    return this.recommendationsService.getRecommendations(userId);
  }
}