import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubmitTestDto } from './dto/submit-test.dto';

@Injectable()
export class TestsService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuestions() {
    return this.prisma.question.findMany({
      include: {
        options: {
          select: {
            id: true,
            text: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async submitTest(dto: SubmitTestDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const questionIds = dto.answers.map((item) => item.questionId);
    const optionIds = dto.answers.map((item) => item.answerOptionId);

    const questions = await this.prisma.question.findMany({
      where: {
        id: { in: questionIds },
      },
      include: {
        options: true,
      },
    });

    if (questions.length !== questionIds.length) {
      throw new NotFoundException('Некоторые вопросы не найдены');
    }

    const selectedOptions = questions.flatMap((question) =>
      question.options.filter((option) => optionIds.includes(option.id)),
    );

    const categoryScores: Record<string, number> = {};

    for (const answer of dto.answers) {
      const question = questions.find((q) => q.id === answer.questionId);
      const selectedOption = question?.options.find(
        (opt) => opt.id === answer.answerOptionId,
      );

      if (!question || !selectedOption) continue;

      if (!categoryScores[question.category]) {
        categoryScores[question.category] = 0;
      }

      categoryScores[question.category] += selectedOption.score;
    }

    const dominantField =
      Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      'General';

    const summary = this.generateSummary(dominantField);

    await this.prisma.userAnswer.deleteMany({
      where: { userId: dto.userId },
    });

    await this.prisma.testResult.deleteMany({
      where: { userId: dto.userId },
    });

    await this.prisma.userAnswer.createMany({
      data: dto.answers.map((answer) => ({
        userId: dto.userId,
        questionId: answer.questionId,
        answerOptionId: answer.answerOptionId,
      })),
    });

    const testResult = await this.prisma.testResult.create({
      data: {
        userId: dto.userId,
        summary,
        dominantField,
      },
    });

    return {
      message: 'Тест успешно отправлен',
      result: testResult,
      scores: categoryScores,
    };
  }

  async getResult(userId: number) {
    const result = await this.prisma.testResult.findFirst({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!result) {
      throw new NotFoundException('Результат теста не найден');
    }

    return result;
  }

  private generateSummary(dominantField: string): string {
    switch (dominantField) {
      case 'IT':
        return 'У пользователя выражена склонность к информационным технологиям, аналитике и цифровым инструментам.';
      case 'Design':
        return 'У пользователя выражена склонность к творческим профессиям, визуальному мышлению и проектированию.';
      case 'Medicine':
        return 'У пользователя выражен интерес к биологии, помощи людям и медицинским направлениям.';
      case 'Business':
        return 'У пользователя выражены организаторские способности, интерес к управлению и бизнес-процессам.';
      default:
        return 'У пользователя наблюдаются смешанные интересы, рекомендуется пройти дополнительное тестирование.';
    }
  }
}