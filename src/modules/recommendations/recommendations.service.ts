import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendations(userId: number) {
    const latestResult = await this.prisma.testResult.findFirst({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!latestResult) {
      throw new NotFoundException('Результат теста не найден');
    }

    const professions = await this.prisma.profession.findMany({
      where: {
        category: latestResult.dominantField,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return {
      dominantField: latestResult.dominantField,
      summary: latestResult.summary,
      professions,
    };
  }
}