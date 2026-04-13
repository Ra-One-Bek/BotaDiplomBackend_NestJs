import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { RecommendationService } from './recommendation.service';
import { MlService } from './ml.service';

@Module({
  controllers: [AssessmentController],
  providers: [
    AssessmentService,
    PrismaService,
    RecommendationService,
    MlService,
  ],
})
export class AssessmentModule {}