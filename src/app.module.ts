import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import envConfiguration from './config/env.configuration';
import { validationSchema } from './config/validation.schema';
import { PrismaService } from './database/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TestsModule } from './modules/tests/tests.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { ProfessionsModule } from './modules/professions/professions.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfiguration],
      validationSchema,
    }),
    AuthModule,
    UsersModule,
    TestsModule,
    RecommendationsModule,
    ProfessionsModule,
    AiModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}