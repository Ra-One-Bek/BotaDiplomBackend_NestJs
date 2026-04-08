import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { SubmitModuleDto } from './dto/submit-module.dto';
import { RecommendationService } from './recommendation.service';

@Controller('assessment')
export class AssessmentController {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly recommendationService: RecommendationService,
  ) {}

  @Get('modules')
  getModules() {
    return this.assessmentService.getModules();
  }

  @Get('modules/progress/:userId')
  getModulesProgress(@Param('userId', ParseIntPipe) userId: number) {
    return this.assessmentService.getModulesProgress(userId);
  }

  @Get('modules/:moduleCode/questions')
  getModuleQuestions(@Param('moduleCode') moduleCode: string) {
    return this.assessmentService.getModuleQuestions(moduleCode);
  }

  @Post('modules/:moduleCode/submit')
  submitModule(
    @Param('moduleCode') moduleCode: string,
    @Body() dto: SubmitModuleDto,
  ) {
    return this.assessmentService.submitModule(moduleCode, dto);
  }

  @Get('results/profile/:userId')
  getProfile(@Param('userId', ParseIntPipe) userId: number) {
    return this.assessmentService.getProfile(userId);
  }

  @Get('recommendations/:userId')
    async getRecommendations(@Param('userId') userId: string) {
    return this.recommendationService.getRecommendations(Number(userId));
    }

  
}