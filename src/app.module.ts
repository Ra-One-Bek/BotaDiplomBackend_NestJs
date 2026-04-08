import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import envConfiguration from './config/env.configuration';
import { validationSchema } from './config/validation.schema';
import { PrismaService } from './database/prisma.service';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfessionsModule } from './modules/professions/professions.module';
import { AiModule } from './modules/ai/ai.module';
import { AssessmentModule } from './modules/assessment/assessment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfiguration],
      validationSchema,
    }),
    AuthModule,
    UsersModule,
    ProfessionsModule,
    AiModule,
    AssessmentModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}