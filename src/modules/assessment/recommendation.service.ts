import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(userId: number) {
    const answers = await this.prisma.userAnswer.findMany({
      where: { userId },
      include: {
        answerOption: true,
      },
    });

    const userProfile: Record<string, number> = {};

    for (const answer of answers) {
      const weights = answer.answerOption.weights as Record<string, number>;

      for (const key in weights) {
        userProfile[key] = (userProfile[key] || 0) + weights[key];
      }
    }

    const professions = await this.prisma.profession.findMany();

    const scored = professions.map((profession) => {
      const weights = profession.weights as Record<string, number>;

      let score = 0;

      for (const key in weights) {
        const userValue = userProfile[key] || 0;
        const professionValue = weights[key];

        score += Math.min(userValue, professionValue);
      }

      return {
        ...profession,
        score,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return {
      profile: userProfile,
      topProfession: scored[0],
      alternatives: scored.slice(1, 3),
    };
  }
}