import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubmitModuleDto } from './dto/submit-module.dto';

type ScoreMap = Record<string, number>;

@Injectable()
export class AssessmentService {
  constructor(private readonly prisma: PrismaService) {}

  async getModules() {
    const modules = await this.prisma.assessmentModule.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        sortOrder: true,
      },
    });

    return modules;
  }

  async getModulesProgress(userId: number) {
    await this.ensureUserExists(userId);

    const modules = await this.prisma.assessmentModule.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        progress: {
          where: { userId },
          select: {
            status: true,
            completedAt: true,
            scoreBreakdown: true,
          },
        },
      },
    });

    const items = modules.map((module) => {
      const progress = module.progress[0];

      return {
        id: module.id,
        code: module.code,
        title: module.title,
        description: module.description,
        sortOrder: module.sortOrder,
        status: progress?.status ?? 'NOT_STARTED',
        completedAt: progress?.completedAt ?? null,
      };
    });

    const completedCount = items.filter(
      (item) => item.status === 'COMPLETED',
    ).length;

    return {
      totalModules: items.length,
      completedModules: completedCount,
      percent: items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100),
      items,
    };
  }

  async getModuleQuestions(moduleCode: string) {
    const module = await this.prisma.assessmentModule.findUnique({
      where: { code: moduleCode },
    });

    if (!module || !module.isActive) {
      throw new NotFoundException('Модуль не найден');
    }

    const questions = await this.prisma.question.findMany({
      where: { moduleId: module.id },
      orderBy: { order: 'asc' },
      include: {
        options: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            text: true,
            value: true,
            order: true,
          },
        },
      },
    });

    return {
      module: {
        id: module.id,
        code: module.code,
        title: module.title,
        description: module.description,
      },
      questions,
    };
  }

  async submitModule(moduleCode: string, dto: SubmitModuleDto) {
    if (!dto.answers || dto.answers.length === 0) {
    throw new BadRequestException('Ответы не переданы');
    }
    
    if (!dto.userId) {
    throw new BadRequestException('userId обязателен');
    }
    const user = await this.ensureUserExists(dto.userId);

    const module = await this.prisma.assessmentModule.findUnique({
      where: { code: moduleCode },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!module || !module.isActive) {
      throw new NotFoundException('Модуль не найден');
    }

    if (module.questions.length === 0) {
      throw new BadRequestException('В модуле пока нет вопросов');
    }

    const questionMap = new Map(module.questions.map((q) => [q.id, q]));
    const providedQuestionIds = new Set(dto.answers.map((a) => a.questionId));

    if (providedQuestionIds.size !== module.questions.length) {
      throw new BadRequestException(
        'Нужно ответить на все вопросы модуля',
      );
    }

    for (const question of module.questions) {
      if (!providedQuestionIds.has(question.id)) {
        throw new BadRequestException(
          `Не получен ответ на вопрос #${question.order}`,
        );
      }
    }

    const scoreBreakdown: ScoreMap = {};

    for (const answer of dto.answers) {
      const question = questionMap.get(answer.questionId!);

      if (!question) {
        throw new BadRequestException(
          `Вопрос ${answer.questionId} не относится к модулю ${moduleCode}`,
        );
      }

      const selectedOption = question.options.find(
        (option) => option.id === answer.answerOptionId,
      );

      if (!selectedOption) {
        throw new BadRequestException(
          `Вариант ответа ${answer.answerOptionId} не относится к вопросу ${answer.questionId}`,
        );
      }

      const weights = this.toScoreMap(selectedOption.weights);

      Object.entries(weights).forEach(([key, value]) => {
        scoreBreakdown[key] = (scoreBreakdown[key] ?? 0) + value;
      });
    }

    await this.prisma.$transaction([
      this.prisma.userAnswer.deleteMany({
        where: {
          userId: user.id,
          moduleId: module.id,
        },
      }),
      this.prisma.userAnswer.createMany({
        data: dto.answers.map((answer) => ({
        userId: user.id,
        moduleId: module.id,
        questionId: answer.questionId!,
        answerOptionId: answer.answerOptionId!,
        })),
      }),
      this.prisma.userModuleProgress.upsert({
        where: {
          userId_moduleId: {
            userId: user.id,
            moduleId: module.id,
          },
        },
        update: {
          status: 'COMPLETED',
          scoreBreakdown,
          completedAt: new Date(),
        },
        create: {
          userId: user.id,
          moduleId: module.id,
          status: 'COMPLETED',
          scoreBreakdown,
          completedAt: new Date(),
        },
      }),
    ]);

    const progress = await this.getModulesProgress(user.id);

    return {
      message: `Модуль "${module.title}" успешно завершён`,
      module: {
        code: module.code,
        title: module.title,
      },
      scoreBreakdown,
      progress,
    };
  }

  async getProfile(userId: number) {
    await this.ensureUserExists(userId);

    const progressRows = await this.prisma.userModuleProgress.findMany({
      where: { userId },
      include: {
        module: {
          select: {
            code: true,
            title: true,
            sortOrder: true,
          },
        },
      },
      orderBy: {
        module: {
          sortOrder: 'asc',
        },
      },
    });

    const mergedScores: ScoreMap = {};

    for (const row of progressRows) {
      const scores = this.toScoreMap(row.scoreBreakdown);

      Object.entries(scores).forEach(([key, value]) => {
        mergedScores[key] = (mergedScores[key] ?? 0) + value;
      });
    }

    const profile = {
      temperament: this.pickTopByPrefix(mergedScores, 'temperament.'),
      thinkingStyle: this.pickTopByPrefix(mergedScores, 'thinkingStyle.'),
      studyProfile: this.pickTopByPrefix(mergedScores, 'studyProfile.'),
      valuesProfile: this.pickTopByPrefix(mergedScores, 'values.'),
      antiTags: this.pickManyByPrefix(mergedScores, 'anti.', 3, 1),
      directions: this.pickManyByPrefix(mergedScores, 'direction.', 5, 1),
      rawScores: mergedScores,
      completedModules: progressRows
        .filter((row) => row.status === 'COMPLETED')
        .map((row) => ({
          code: row.module.code,
          title: row.module.title,
          completedAt: row.completedAt,
        })),
    };

    return profile;
  }

  async getRecommendations(userId: number) {
    await this.ensureUserExists(userId);

    const progress = await this.getModulesProgress(userId);

    if (progress.completedModules !== progress.totalModules) {
      throw new ForbiddenException(
        'Сначала нужно завершить все модули профориентации',
      );
    }

    const profile = await this.getProfile(userId);
    const topDirection = profile.directions[0]?.key ?? null;

    if (!topDirection) {
      throw new NotFoundException('Недостаточно данных для рекомендаций');
    }

    const professions = await this.prisma.profession.findMany({
      where: {
        category: topDirection,
      },
      orderBy: {
        id: 'asc',
      },
      take: 6,
    });

    const explanation = this.buildRecommendationExplanation(profile, topDirection);

    return {
      idealDirection: topDirection,
      idealProfession: professions[0] ?? null,
      alternatives: professions.slice(1),
      profile,
      explanation,
      excludedDirections: profile.antiTags.map((item) => item.key),
    };
  }

  private async ensureUserExists(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
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

  private buildRecommendationExplanation(
    profile: Awaited<ReturnType<AssessmentService['getProfile']>>,
    topDirection: string,
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
      title: `Рекомендуемое направление: ${topDirection}`,
      summary:
        reasons.length > 0
          ? `Рекомендация сформирована на основе профиля пользователя: ${reasons.join(', ')}.`
          : 'Рекомендация сформирована на основе совокупности результатов модулей.',
    };
  }
}