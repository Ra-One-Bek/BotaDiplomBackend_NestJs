import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';

@Module({
  controllers: [TestsController],
  providers: [TestsService, PrismaService],
})
export class TestsModule {}