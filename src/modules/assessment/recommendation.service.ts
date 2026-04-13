import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MlService } from './ml.service';

type ScoreMap = Record<string, number>;

@Injectable()
export class RecommendationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mlService: MlService,
  ) {}

  private mapDirectionToCategory(direction: string): string {
    const map: Record<string, string> = {
      business: 'Management',
      creative: 'Design',
      education: 'Education',
      it: 'IT',
      engineering: 'Engineering',
      medicine: 'Medicine',
    };

    return map[direction] ?? direction;
  }

  async getRecommendations(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const modules = await this.prisma.assessmentModule.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    const progressRows = await this.prisma.userModuleProgress.findMany({
      where: { userId },
      include: {
        module: {
          select: { code: true, title: true, sortOrder: true },
        },
      },
      orderBy: {
        module: { sortOrder: 'asc' },
      },
    });

    const completedModules = progressRows.filter(
      (row) => row.status === 'COMPLETED',
    ).length;

    if (completedModules !== modules.length) {
      throw new ForbiddenException(
        'Сначала нужно завершить все модули профориентации',
      );
    }

    const rawScores: ScoreMap = {};

    for (const row of progressRows) {
      const scores = this.toScoreMap(row.scoreBreakdown);
      for (const [key, value] of Object.entries(scores)) {
        rawScores[key] = (rawScores[key] ?? 0) + value;
      }
    }

    const profile = {
      temperament: this.pickTopByPrefix(rawScores, 'temperament.'),
      thinkingStyle: this.pickTopByPrefix(rawScores, 'thinkingStyle.'),
      studyProfile: this.pickTopByPrefix(rawScores, 'studyProfile.'),
      valuesProfile: this.pickTopByPrefix(rawScores, 'values.'),
      antiTags: this.pickManyByPrefix(rawScores, 'anti.', 3, 1),
      directions: this.pickManyByPrefix(rawScores, 'direction.', 5, 1),
      rawScores,
      completedModules: progressRows.map((row) => ({
        code: row.module.code,
        title: row.module.title,
        completedAt: row.completedAt,
      })),
    };

    const ruleTopDirection = profile.directions[0]?.key ?? null;
    if (!ruleTopDirection) {
      throw new NotFoundException('Недостаточно данных для рекомендаций');
    }

    const mlResult = await this.mlService.predictDirection(
      profile.rawScores,
      ruleTopDirection,
    );

    const finalDirection = this.resolveFinalDirection(
      ruleTopDirection,
      mlResult.predictedDirection,
      mlResult.confidence,
    );

    const mappedCategory = this.mapDirectionToCategory(finalDirection);

    const professions = await this.prisma.profession.findMany({
      where: { category: mappedCategory },
      orderBy: { id: 'asc' },
      take: 6,
    });

    const scoredAlternatives = await this.getScoredAlternatives(rawScores);

    const topProfession = professions[0] ?? null;

    const alternatives =
      professions.length > 1
        ? professions.slice(1)
        : scoredAlternatives
            .filter((item) => item.id !== topProfession?.id)
            .slice(0, 3);

    return {
      profile,
      topProfession,
      alternatives,
      hybridRecommendation: {
        finalDirection,
        source:
          finalDirection === ruleTopDirection
            ? 'rule-based'
            : 'hybrid-ml',
        ruleBasedDirection: ruleTopDirection,
        mlPredictedDirection: mlResult.predictedDirection,
        mlConfidence: mlResult.confidence,
        mlProbabilities: mlResult.probabilities,
        modelVersion: mlResult.modelVersion,
      },
      explanation: this.buildExplanation(
        profile,
        ruleTopDirection,
        mlResult.predictedDirection,
        finalDirection,
        mlResult.confidence,
      ),
    };
  }

  private resolveFinalDirection(
    ruleDirection: string,
    mlDirection: string,
    mlConfidence: number,
  ) {
    if (!mlDirection || mlDirection === 'unknown') {
      return ruleDirection;
    }

    if (mlDirection === ruleDirection) {
      return ruleDirection;
    }

    if (mlConfidence >= 0.7) {
      return mlDirection;
    }

    return ruleDirection;
  }

  private async getScoredAlternatives(rawScores: ScoreMap) {
    const professions = await this.prisma.profession.findMany();

    const scored = professions.map((profession) => {
      const weights = this.toScoreMap(profession.weights);
      let score = 0;

      for (const key in weights) {
        const userValue = rawScores[key] || 0;
        const professionValue = weights[key] || 0;
        score += Math.min(userValue, professionValue);
      }

      return {
        ...profession,
        score,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  private toScoreMap(value: unknown): ScoreMap {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    const result: ScoreMap = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      if (typeof val === 'number') {
        result[key] = val;
      }
    });

    return result;
  }

  private pickTopByPrefix(scores: ScoreMap, prefix: string) {
    const entries = Object.entries(scores)
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, value]) => ({
        key: key.replace(prefix, ''),
        value,
      }))
      .sort((a, b) => b.value - a.value);

    return entries[0] ?? null;
  }

  private pickManyByPrefix(
    scores: ScoreMap,
    prefix: string,
    limit: number,
    minValue = 0,
  ) {
    return Object.entries(scores)
      .filter(([key, value]) => key.startsWith(prefix) && value >= minValue)
      .map(([key, value]) => ({
        key: key.replace(prefix, ''),
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  private buildExplanation(
    profile: any,
    ruleDirection: string,
    mlDirection: string,
    finalDirection: string,
    confidence: number,
  ) {
    const reasons: string[] = [];

    if (profile.temperament?.key) {
      reasons.push(`темперамент: ${profile.temperament.key}`);
    }
    if (profile.thinkingStyle?.key) {
      reasons.push(`стиль мышления: ${profile.thinkingStyle.key}`);
    }
    if (profile.studyProfile?.key) {
      reasons.push(`учебный профиль: ${profile.studyProfile.key}`);
    }
    if (profile.valuesProfile?.key) {
      reasons.push(`ценности: ${profile.valuesProfile.key}`);
    }

    return {
      title: `Рекомендуемое направление: ${finalDirection}`,
      summary: `Итог сформирован гибридно. Rule-based результат: ${ruleDirection}. ML-прогноз: ${mlDirection} (confidence ${confidence}). Основания профиля: ${reasons.join(', ')}.`,
    };
  }
}