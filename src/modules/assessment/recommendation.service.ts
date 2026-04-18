import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MlService } from './ml.service';

type ScoreMap = Record<string, number>;

@Injectable()
export class RecommendationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mlService: MlService,
  ) {}

  async getRecommendations(userId: number) {
    const modules = await this.prisma.assessmentModule.findMany({
      where: { isActive: true },
      select: { id: true, code: true, title: true, sortOrder: true },
      orderBy: { sortOrder: 'asc' },
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

    const completedRows = progressRows.filter(
      (row) => row.status === 'COMPLETED',
    );
    const completedModules = completedRows.length;
    const totalModules = modules.length;

    const rawScores: ScoreMap = {};
    for (const row of completedRows) {
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
      directions: this.pickTopListByPrefix(rawScores, 'direction.', 5),
      antiTags: this.pickTopListByPrefix(rawScores, 'anti.', 5),
      completedModules: completedRows.map((row) => ({
        id: row.moduleId,
        code: row.module?.code,
        title: row.module?.title,
        completedAt: row.updatedAt,
      })),
      rawScores,
    };

    const completionPercent =
      totalModules === 0
        ? 0
        : Math.round((completedModules / totalModules) * 100);

    if (completedModules === 0) {
      return {
        profile,
        topProfession: null,
        alternatives: [],
        completion: {
          completedModules,
          totalModules,
          percent: completionPercent,
          isPartial: true,
          isEmpty: true,
        },
        explanation:
          'Пройди модули, чтобы мы подобрали подходящую профессию и показали процент совпадения.',
        hybridRecommendation: {
          finalDirection: null,
          source: 'insufficient-data',
        },
        recommendedCourses: [],
      };
    }

    const ruleTopDirection =
      this.pickTopByPrefix(rawScores, 'direction.')?.key ?? null;

    let mlTopDirection: string | null = null;
    try {
      const mlResult = await this.mlService.predict({
        rawScores,
        topDirectionFromRules: ruleTopDirection ?? undefined,
      });
      mlTopDirection = mlResult?.predictedDirection ?? null;
    } catch {
      mlTopDirection = null;
    }

    const finalDirection = mlTopDirection ?? ruleTopDirection;

    const professions = finalDirection
      ? await this.prisma.profession.findMany({
          where: { category: finalDirection },
          take: 12,
        })
      : [];

    const scoredProfessions = await this.getScoredAlternatives(rawScores);
    const enrichedScored = this.attachMatchPercent(scoredProfessions);

    let merged: Array<Record<string, any>> = [...enrichedScored];

    if (professions.length > 0) {
      const fromCategory = professions.map((profession) => {
        const scored = enrichedScored.find((item) => item.id === profession.id);

        return {
          ...profession,
          score: scored?.score ?? 0,
          matchPercent: scored?.matchPercent ?? 0,
        };
      });

      const extra = enrichedScored.filter((item) => {
        return !fromCategory.some((p) => p.id === item.id);
      });

      merged = [...fromCategory, ...extra];
    }

    merged.sort((a, b) => {
      const left = Number(a.score ?? 0);
      const right = Number(b.score ?? 0);
      return right - left;
    });

    const topProfession = merged.length > 0 ? merged[0] : null;
    const alternatives =
      merged.length > 1 ? merged.slice(1, Math.min(7, merged.length)) : [];

    const isPartial = completedModules < totalModules;

    return {
      profile,
      topProfession,
      alternatives,
      completion: {
        completedModules,
        totalModules,
        percent: completionPercent,
        isPartial,
        isEmpty: false,
      },
      explanation: isPartial
        ? 'Это предварительный результат. Пройди все модули, чтобы получить более точную рекомендацию.'
        : 'Результат сформирован на основе всех модулей профориентации.',
      hybridRecommendation: {
        finalDirection,
        source:
          mlTopDirection == null
            ? 'rule-based'
            : finalDirection === ruleTopDirection
              ? 'rule-based'
              : 'hybrid-ml',
        ruleTopDirection,
        mlTopDirection,
      },
      recommendedCourses: this.buildMockCourses(
        finalDirection,
        topProfession?.name,
      ),
    };
  }

  private attachMatchPercent(
    professions: Array<Record<string, any>>,
  ): Array<Record<string, any>> {
    if (professions.length === 0) {
      return [];
    }

    const scores = professions.map((item) => Number(item.score ?? 0));
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    if (maxScore <= 0) {
      return professions.map((item) => ({
        ...item,
        matchPercent: 0,
      }));
    }

    return professions.map((item, index) => {
      const score = Number(item.score ?? 0);

      let percent: number;
      if (maxScore === minScore) {
        percent = index === 0 ? 78 : 65;
      } else {
        const normalized = (score - minScore) / (maxScore - minScore);
        percent = Math.round(55 + normalized * 35);
      }

      return {
        ...item,
        matchPercent: this.clamp(percent, 35, 92),
      };
    });
  }

  private buildMockCourses(
    finalDirection: string | null,
    professionName?: string,
  ) {
    const normalizedProfession = String(professionName ?? '').toLowerCase();

    const byProfession: Record<string, Array<Record<string, string>>> = {
      'ui/ux дизайнер': [
        {
          title: 'UI/UX Design Fundamentals',
          provider: 'Proffy Academy',
          description:
            'Основы UX-исследований, user flow, wireframes и дизайн интерфейсов.',
          level: 'Начальный',
          duration: '6 недель',
        },
        {
          title: 'Figma с нуля до прототипа',
          provider: 'Proffy Academy',
          description:
            'Практика работы в Figma: компоненты, auto layout, прототипы.',
          level: 'Начальный',
          duration: '4 недели',
        },
        {
          title: 'UX Research и тестирование',
          provider: 'Proffy Academy',
          description:
            'Как изучать пользователей, проводить интервью и улучшать продукт.',
          level: 'Средний',
          duration: '5 недель',
        },
      ],
      'frontend разработчик': [
        {
          title: 'HTML, CSS, JavaScript',
          provider: 'Proffy Academy',
          description:
            'Базовый стек frontend-разработчика и создание адаптивных страниц.',
          level: 'Начальный',
          duration: '8 недель',
        },
        {
          title: 'React для начинающих',
          provider: 'Proffy Academy',
          description:
            'Компоненты, props, state, маршрутизация и практика на мини-проектах.',
          level: 'Средний',
          duration: '6 недель',
        },
        {
          title: 'Frontend Portfolio Projects',
          provider: 'Proffy Academy',
          description:
            'Собери 3 проекта для портфолио: landing, dashboard и app UI.',
          level: 'Средний',
          duration: '7 недель',
        },
      ],
      'графический дизайнер': [
        {
          title: 'Основы графического дизайна',
          provider: 'Proffy Academy',
          description:
            'Композиция, цвет, типографика и визуальная иерархия.',
          level: 'Начальный',
          duration: '5 недель',
        },
        {
          title: 'Adobe Illustrator / Figma',
          provider: 'Proffy Academy',
          description:
            'Создание баннеров, постеров и digital-графики.',
          level: 'Средний',
          duration: '6 недель',
        },
        {
          title: 'Брендинг и визуальный стиль',
          provider: 'Proffy Academy',
          description:
            'Разработка айдентики и фирменного стиля для проектов.',
          level: 'Средний',
          duration: '5 недель',
        },
      ],
      'менеджер проектов': [
        {
          title: 'Project Management Basics',
          provider: 'Proffy Academy',
          description:
            'Основы планирования, сроков, ролей в команде и контроля задач.',
          level: 'Начальный',
          duration: '6 недель',
        },
        {
          title: 'Agile и Scrum',
          provider: 'Proffy Academy',
          description:
            'Как работают современные продуктовые команды и спринты.',
          level: 'Средний',
          duration: '4 недели',
        },
        {
          title: 'Коммуникация и лидерство',
          provider: 'Proffy Academy',
          description:
            'Навыки общения, фасилитации и управления командой.',
          level: 'Средний',
          duration: '5 недель',
        },
      ],
    };

    if (normalizedProfession && byProfession[normalizedProfession]) {
      return byProfession[normalizedProfession];
    }

    const byDirection: Record<string, Array<Record<string, string>>> = {
      it: [
        {
          title: 'Python для начинающих',
          provider: 'Proffy Academy',
          description:
            'Основы синтаксиса, логики и решения задач на Python.',
          level: 'Начальный',
          duration: '6 недель',
        },
        {
          title: 'Web Development Start',
          provider: 'Proffy Academy',
          description:
            'Первые шаги в создании сайтов и веб-приложений.',
          level: 'Начальный',
          duration: '7 недель',
        },
        {
          title: 'Алгоритмическое мышление',
          provider: 'Proffy Academy',
          description:
            'Как разбивать задачи на шаги и писать более сильные решения.',
          level: 'Средний',
          duration: '5 недель',
        },
      ],
      creative: [
        {
          title: 'Дизайн интерфейсов',
          provider: 'Proffy Academy',
          description:
            'Основы визуального проектирования и UX-подхода.',
          level: 'Начальный',
          duration: '6 недель',
        },
        {
          title: 'Figma и прототипирование',
          provider: 'Proffy Academy',
          description:
            'Создание интерактивных макетов и экранов приложений.',
          level: 'Средний',
          duration: '4 недели',
        },
        {
          title: 'Креативное мышление',
          provider: 'Proffy Academy',
          description:
            'Практики генерации идей и решения визуальных задач.',
          level: 'Начальный',
          duration: '3 недели',
        },
      ],
      business: [
        {
          title: 'Маркетинг и продукт',
          provider: 'Proffy Academy',
          description:
            'База для понимания рынка, пользователей и стратегии.',
          level: 'Начальный',
          duration: '5 недель',
        },
        {
          title: 'Менеджмент проектов',
          provider: 'Proffy Academy',
          description:
            'Планирование задач, рисков и работы команды.',
          level: 'Средний',
          duration: '6 недель',
        },
        {
          title: 'Основы лидерства',
          provider: 'Proffy Academy',
          description:
            'Как брать ответственность и эффективно вести команду.',
          level: 'Средний',
          duration: '4 недели',
        },
      ],
      engineering: [
        {
          title: 'Инженерное мышление',
          provider: 'Proffy Academy',
          description:
            'Как проектировать решения и мыслить системно.',
          level: 'Начальный',
          duration: '5 недель',
        },
        {
          title: '3D и CAD основы',
          provider: 'Proffy Academy',
          description:
            'Знакомство с цифровым моделированием и проектированием.',
          level: 'Средний',
          duration: '6 недель',
        },
        {
          title: 'Физика для инженерии',
          provider: 'Proffy Academy',
          description:
            'Практическое применение физики в инженерных задачах.',
          level: 'Средний',
          duration: '5 недель',
        },
      ],
      medicine: [
        {
          title: 'Биология человека',
          provider: 'Proffy Academy',
          description:
            'База для тех, кому интересны медицина и биологические науки.',
          level: 'Начальный',
          duration: '6 недель',
        },
        {
          title: 'Основы анатомии',
          provider: 'Proffy Academy',
          description:
            'Строение организма и ключевые системы тела.',
          level: 'Начальный',
          duration: '5 недель',
        },
        {
          title: 'Научное мышление',
          provider: 'Proffy Academy',
          description:
            'Как анализировать данные и работать с гипотезами.',
          level: 'Средний',
          duration: '4 недели',
        },
      ],
      education: [
        {
          title: 'Навыки преподавания',
          provider: 'Proffy Academy',
          description:
            'Как объяснять, вовлекать и удерживать внимание.',
          level: 'Начальный',
          duration: '5 недель',
        },
        {
          title: 'Педагогика и коммуникация',
          provider: 'Proffy Academy',
          description:
            'Базовые принципы обучения и поддержки учеников.',
          level: 'Средний',
          duration: '5 недель',
        },
        {
          title: 'Публичные выступления',
          provider: 'Proffy Academy',
          description:
            'Подача материала, речь, уверенность и структура.',
          level: 'Средний',
          duration: '4 недели',
        },
      ],
    };

    if (finalDirection && byDirection[finalDirection]) {
      return byDirection[finalDirection];
    }

    return [
      {
        title: 'Самоопределение и выбор профессии',
        provider: 'Proffy Academy',
        description:
          'Курс для понимания сильных сторон, интересов и карьерных направлений.',
        level: 'Начальный',
        duration: '3 недели',
      },
      {
        title: 'Критическое мышление',
        provider: 'Proffy Academy',
        description:
          'Полезный навык для любой профессии и учебной траектории.',
        level: 'Начальный',
        duration: '4 недели',
      },
      {
        title: 'Коммуникация и командная работа',
        provider: 'Proffy Academy',
        description:
          'Развитие универсальных навыков для проектов, учёбы и карьеры.',
        level: 'Начальный',
        duration: '4 недели',
      },
    ];
  }

  private async getScoredAlternatives(rawScores: ScoreMap) {
    const professions = await this.prisma.profession.findMany();

    const scored = professions.map((profession) => {
      const weights = this.toScoreMap(profession.weights);
      let score = 0;

      for (const key of Object.keys(weights)) {
        const userValue = Number(rawScores[key] ?? 0);
        const professionValue = Number(weights[key] ?? 0);

        if (professionValue <= 0) continue;

        const overlap = Math.min(userValue, professionValue);
        const userSignal = this.getWeightedUserSignal(key, userValue);
        const professionSignal = professionValue;

        if (key.startsWith('anti.')) {
          score -= overlap * 2.2;
          continue;
        }

        score += Math.min(userSignal, professionSignal);
      }

      score += this.getProfessionCategoryBoost(profession.category, rawScores);
      score -= this.getAntiPenalty(profession.category, rawScores);
      score -= this.getLeadershipPenaltyForNonManagerFit(profession, rawScores);

      return {
        ...profession,
        score: Number(score.toFixed(2)),
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  private getWeightedUserSignal(key: string, userValue: number): number {
    if (key.startsWith('direction.')) {
      return userValue * 2.8;
    }

    if (key.startsWith('thinkingStyle.')) {
      return userValue * 2.0;
    }

    if (key.startsWith('studyProfile.')) {
      return userValue * 1.8;
    }

    if (key.startsWith('values.')) {
      return userValue * 1.15;
    }

    if (key.startsWith('temperament.')) {
      return userValue * 0.65;
    }

    if (key.startsWith('anti.')) {
      return userValue * 2.2;
    }

    return userValue;
  }

  private getProfessionCategoryBoost(
    category: string | null | undefined,
    rawScores: ScoreMap,
  ): number {
    const normalized = String(category ?? '').toLowerCase();

    const directionScore = (direction: string) =>
      Number(rawScores[`direction.${direction}`] ?? 0);

    const thinkingScore = (thinking: string) =>
      Number(rawScores[`thinkingStyle.${thinking}`] ?? 0);

    const studyScore = (profile: string) =>
      Number(rawScores[`studyProfile.${profile}`] ?? 0);

    const valueScore = (value: string) =>
      Number(rawScores[`values.${value}`] ?? 0);

    let boost = 0;

    if (normalized === 'it') {
      boost += directionScore('it') * 3.4;
      boost += thinkingScore('analytic') * 1.8;
      boost += studyScore('stem') * 1.5;
      boost += valueScore('freedom') * 0.8;
    }

    if (normalized === 'creative' || normalized === 'design') {
      boost += directionScore('creative') * 3.5;
      boost += thinkingScore('creative') * 2.2;
      boost += valueScore('freedom') * 1.0;
    }

    if (normalized === 'business' || normalized === 'management') {
      boost += directionScore('business') * 2.4;
      boost += valueScore('income') * 0.9;
      boost += valueScore('leader') * 1.0;
      boost += Number(rawScores['temperament.choleric'] ?? 0) * 0.55;
    }

    if (normalized === 'engineering') {
      boost += directionScore('engineering') * 3.0;
      boost += thinkingScore('analytic') * 1.7;
      boost += studyScore('stem') * 1.7;
    }

    if (normalized === 'medicine') {
      boost += directionScore('medicine') * 3.0;
      boost += studyScore('stem') * 1.3;
      boost += valueScore('helping') * 1.2;
    }

    if (normalized === 'education') {
      boost += directionScore('education') * 2.8;
      boost += valueScore('helping') * 1.3;
    }

    return Number(boost.toFixed(2));
  }

  private getAntiPenalty(
    category: string | null | undefined,
    rawScores: ScoreMap,
  ): number {
    const normalized = String(category ?? '').toLowerCase();

    const antiScore = (tag: string) => Number(rawScores[`anti.${tag}`] ?? 0);

    let penalty = 0;

    if (normalized === 'it') {
      penalty += antiScore('it') * 4.0;
    }

    if (normalized === 'creative' || normalized === 'design') {
      penalty += antiScore('creative') * 4.0;
    }

    if (normalized === 'business' || normalized === 'management') {
      penalty += antiScore('business') * 4.0;
    }

    if (normalized === 'engineering') {
      penalty += antiScore('engineering') * 4.0;
    }

    if (normalized === 'medicine') {
      penalty += antiScore('medicine') * 4.0;
    }

    if (normalized === 'education') {
      penalty += antiScore('education') * 4.0;
    }

    return Number(penalty.toFixed(2));
  }

  private getLeadershipPenaltyForNonManagerFit(
    profession: Record<string, any>,
    rawScores: ScoreMap,
  ): number {
    const professionName = String(profession.name ?? '').toLowerCase();
    const category = String(profession.category ?? '').toLowerCase();

    const business = Number(rawScores['direction.business'] ?? 0);
    const creative = Number(rawScores['direction.creative'] ?? 0);
    const it = Number(rawScores['direction.it'] ?? 0);
    const leadership = Number(rawScores['values.leader'] ?? 0);
    const choleric = Number(rawScores['temperament.choleric'] ?? 0);

    const looksLikeManager =
      professionName.includes('менедж') ||
      professionName.includes('manager') ||
      professionName.includes('project') ||
      category === 'business' ||
      category === 'management';

    if (!looksLikeManager) {
      return 0;
    }

    const productExecutionSignal = creative + it;
    const managementSignal = business + leadership + choleric * 0.6;

    if (productExecutionSignal > managementSignal) {
      return Number(
        ((productExecutionSignal - managementSignal) * 1.8).toFixed(2),
      );
    }

    return 0;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
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

  private pickTopListByPrefix(
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
}