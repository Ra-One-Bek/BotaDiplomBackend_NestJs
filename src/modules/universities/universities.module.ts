import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UniversitiesController } from './universities.controller';
import { UniversitiesService } from './universities.service';

@Module({
  controllers: [UniversitiesController],
  providers: [UniversitiesService, PrismaService],
})
export class UniversitiesModule {}