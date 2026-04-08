import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProfessionsController } from './professions.controller';
import { ProfessionsService } from './professions.service';

@Module({
  controllers: [ProfessionsController],
  providers: [ProfessionsService, PrismaService],
})
export class ProfessionsModule {}