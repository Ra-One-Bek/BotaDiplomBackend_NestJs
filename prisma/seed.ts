import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function createQuestion(params: {
  moduleId: number;
  order: number;
  text: string;
  type: QuestionType;
  options: Array<{
    text: string;
    value?: string;
    order: number;
    weights: Record<string, number>;
  }>;
  description?: string;
  metadata?: Record<string, unknown>;
}) {
  const { moduleId, order, text, type, options, description, metadata } = params;

  await prisma.question.create({
    data: {
      moduleId,
      order,
      text,
      type,
      description,
      metadata: metadata as any,
      options: {
        create: options,
      },
    },
  });
}

async function main() {
  await prisma.userAnswer.deleteMany();
  await prisma.userModuleProgress.deleteMany();
  await prisma.answerOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessmentModule.deleteMany();
  await prisma.profession.deleteMany();

  const modules = await Promise.all([
    prisma.assessmentModule.create({
      data: {
        code: 'temperament',
        title: 'Темперамент личности',
        description: 'Определение базового темперамента и поведенческого стиля.',
        sortOrder: 1,
      },
    }),
    prisma.assessmentModule.create({
      data: {
        code: 'thinking_style',
        title: 'Личность и стиль мышления',
        description: 'Аналитика, структура, люди или креатив.',
        sortOrder: 2,
      },
    }),
    prisma.assessmentModule.create({
      data: {
        code: 'interests',
        title: 'Интересы и мотивация',
        description: 'Что тебе действительно нравится делать.',
        sortOrder: 3,
      },
    }),
    prisma.assessmentModule.create({
      data: {
        code: 'study_profile',
        title: 'Учебный профиль',
        description: 'Какие типы дисциплин и задач тебе ближе.',
        sortOrder: 4,
      },
    }),
    prisma.assessmentModule.create({
      data: {
        code: 'values',
        title: 'Образ жизни и ценности',
        description: 'Что для тебя важнее: статус, польза, творчество или свобода.',
        sortOrder: 5,
      },
    }),
    prisma.assessmentModule.create({
      data: {
        code: 'anti_profession',
        title: 'Анти-профессия',
        description: 'Что тебе точно не подходит по рутине и формату работы.',
        sortOrder: 6,
      },
    }),
  ]);

  const temperamentModule = modules.find((m) => m.code === 'temperament');
  if (!temperamentModule) {
    throw new Error('temperament module not found');
  }

  const thinkingStyleModule = modules.find((m) => m.code === 'thinking_style');
if (!thinkingStyleModule) {
  throw new Error('thinking_style module not found');
}

const interestsModule = modules.find((m) => m.code === 'interests');
if (!interestsModule) {
  throw new Error('interests module not found');
}

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 1,
    text: 'Какой у вас характер?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Спокойный, медлительный, миролюбивый',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
          'direction.analytics': 1,
        },
      },
      {
        order: 2,
        text: 'Робкий, обидчивый, нерешительный',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
          'direction.creative': 1,
        },
      },
      {
        order: 3,
        text: 'Энергичный, шаловливый, задиристый',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
          'direction.business': 1,
        },
      },
      {
        order: 4,
        text: 'Жизнелюбивый, оптимистичный, общительный',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
          'direction.social': 1,
        },
      },
    ],
  });

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 2,
    text: 'Какие эмоции чаще?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Положительные, без бурных реакций',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
        },
      },
      {
        order: 2,
        text: 'Страх',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
        },
      },
      {
        order: 3,
        text: 'Гнев, бурные эмоции',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
        },
      },
      {
        order: 4,
        text: 'Положительные, много смеха',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
        },
      },
    ],
  });

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 3,
    text: 'Какие игры нравятся?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Уединённые, тихие',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
          'direction.analytics': 1,
        },
      },
      {
        order: 2,
        text: 'Уединённые; шумные — только с близкими',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
        },
      },
      {
        order: 3,
        text: 'Азартные, шумные, агрессивные',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
          'direction.business': 1,
        },
      },
      {
        order: 4,
        text: 'Всякие, но весёлые',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
          'direction.social': 1,
        },
      },
    ],
  });

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 4,
    text: 'Реакция на наказание?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Без эмоций',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
        },
      },
      {
        order: 2,
        text: 'С обидой',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
        },
      },
      {
        order: 3,
        text: 'На словесные — спокойно, на другие — протест',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
        },
      },
      {
        order: 4,
        text: 'Спокойно',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
        },
      },
    ],
  });

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 5,
    text: 'В неожиданных ситуациях?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Малоэмоционально',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
        },
      },
      {
        order: 2,
        text: 'Избегаю',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
        },
      },
      {
        order: 3,
        text: 'Сопротивляюсь',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
        },
      },
      {
        order: 4,
        text: 'Любопытство',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
        },
      },
    ],
  });

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 6,
    text: 'Общительность?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Предпочитаю уединение',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
          'anti.communication': 1,
        },
      },
      {
        order: 2,
        text: 'Только с близкими',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
        },
      },
      {
        order: 3,
        text: 'Нужны зрители',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
          'direction.business': 1,
        },
      },
      {
        order: 4,
        text: 'Люблю всех',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
          'direction.social': 1,
        },
      },
    ],
  });

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 7,
    text: 'Лидерство среди сверстников?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Нет',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
        },
      },
      {
        order: 2,
        text: 'В узком кругу',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
        },
      },
      {
        order: 3,
        text: 'Сам выдвигаюсь',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
          'values.leader': 1,
        },
      },
      {
        order: 4,
        text: 'Прирождённый лидер',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
          'values.leader': 1,
        },
      },
    ],
  });

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 8,
    text: 'Особенности памяти?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Медленно, но надолго',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
          'direction.analytics': 1,
        },
      },
      {
        order: 2,
        text: 'По-разному, вникаю в мелочи',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
          'direction.creative': 1,
        },
      },
      {
        order: 3,
        text: 'Быстро детали, быстро забываю',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
        },
      },
      {
        order: 4,
        text: 'Быстро и долго',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
        },
      },
    ],
  });

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 9,
    text: 'Усвоение нового?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Медленно, обстоятельно',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
        },
      },
      {
        order: 2,
        text: 'Зависит от обстоятельств',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
        },
      },
      {
        order: 3,
        text: 'На лету, но забываю',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
        },
      },
      {
        order: 4,
        text: 'Быстро и легко',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
        },
      },
    ],
  });

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 10,
    text: 'Утомляемость?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Очень низкая',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
        },
      },
      {
        order: 2,
        text: 'Высокая',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
          'anti.stress': 1,
        },
      },
      {
        order: 3,
        text: 'Зависит от эмоций',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
        },
      },
      {
        order: 4,
        text: 'Средняя',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
        },
      },
    ],
  });

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 11,
    text: 'Особенности речи?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Медленная, невыразительная',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
        },
      },
      {
        order: 2,
        text: 'Тихая, неуверенная',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
        },
      },
      {
        order: 3,
        text: 'Эмоциональная, быстрая',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
        },
      },
      {
        order: 4,
        text: 'Живая, с мимикой',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
          'direction.social': 1,
        },
      },
    ],
  });

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 12,
    text: 'Движения?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Солидные, неторопливые',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
        },
      },
      {
        order: 2,
        text: 'Суетливые, неуверенные',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
        },
      },
      {
        order: 3,
        text: 'Резкие, порывистые',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
        },
      },
      {
        order: 4,
        text: 'Ритмичные, уверенные',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
        },
      },
    ],
  });

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 13,
    text: 'Привыкание к школе/новому?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Боязнь перемен',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
          'anti.uncertainty': 1,
        },
      },
      {
        order: 2,
        text: 'Трудная адаптация',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
          'anti.uncertainty': 1,
        },
      },
      {
        order: 3,
        text: 'Лёгкое, но неохотно подчиняюсь',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
          'values.freedom_stability': 1,
        },
      },
      {
        order: 4,
        text: 'Быстрая и лёгкая',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
        },
      },
    ],
  });

  await createQuestion({
    moduleId: temperamentModule.id,
    order: 14,
    text: 'Особенности сна?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Быстро засыпаю, вяло просыпаюсь',
        value: 'A',
        weights: {
          'temperament.phlegmatic': 1,
        },
      },
      {
        order: 2,
        text: 'Долго укладываюсь, весело просыпаюсь',
        value: 'B',
        weights: {
          'temperament.melancholic': 1,
        },
      },
      {
        order: 3,
        text: 'Трудно засыпаю, разное состояние',
        value: 'C',
        weights: {
          'temperament.choleric': 1,
        },
      },
      {
        order: 4,
        text: 'Быстро, крепко, весело',
        value: 'D',
        weights: {
          'temperament.sanguine': 1,
        },
      },
    ],
  });



  if (!thinkingStyleModule) {
    throw new Error('thinking_style module not found');
  }

  if (!interestsModule) {
    throw new Error('interests module not found');
  }

  // =========================
  // MODULE 2: THINKING STYLE
  // =========================

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 1,
    text: 'Тебе дали сложное новое задание:',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Сначала попробую понять, в чём суть',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'Составлю план, как делать',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'Обсужу с кем-то',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Попробую разные варианты',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 2,
    text: 'Если ты не понял тему:',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Попробую разобраться сам(а)',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'Найду объяснение, где всё по шагам',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'Спрошу у кого-то',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Посмотрю примеры',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 3,
    text: 'Как ты обычно решаешь задачи?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Думаю шаг за шагом',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'Делаю по плану',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'Обсуждаю с другими',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Пробую разные способы',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 4,
    text: 'Тебе нужно сделать проект:',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Сначала разбираюсь, что нужно сделать',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'Планирую, что и когда делать',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'Делюсь задачами с другими',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Придумываю интересную идею',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 5,
    text: 'Если что-то не получается:',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Думаю, в чём ошибка',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'Меняю план',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'Прошу помощи',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Пробую сделать по-другому',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 6,
    text: 'Как тебе удобнее работать?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Сам(а), спокойно и сосредоточенно',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'Когда есть чёткий план',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'С другими людьми',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Свободно, как хочется',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 7,
    text: 'Тебе дали много новой информации:',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Попробую сам(а) понять',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'Разложу всё по порядку',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'Обсужу с кем-то',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Придумаю что-то новое',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 8,
    text: 'Что тебе больше нравится?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Решать задачи',
        value: 'A',
        weights: { analytical: 2, technical: 1 },
      },
      {
        order: 2,
        text: 'Наводить порядок',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'Общаться',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Придумывать идеи',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 9,
    text: 'Если нужно что-то решить:',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Смотрю на факты',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'Сравниваю варианты',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'Спрашиваю мнение других',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Иду по своей идее',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 10,
    text: 'Если есть несколько вариантов:',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Выбираю самый логичный',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'Самый понятный и удобный',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'Тот, который лучше для всех',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Самый необычный',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 11,
    text: 'Ты больше любишь:',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Думать и анализировать',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'Делать всё по порядку',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'Общаться с людьми',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Придумывать новое',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 12,
    text: 'В новой ситуации ты:',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Сначала думаешь',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'Планируешь',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'Общаешься',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Пробуешь',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 13,
    text: 'Если проект не получился:',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Думаю, что пошло не так',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'Улучшаю план',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'Обсуждаю с другими',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Придумываю новый вариант',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: thinkingStyleModule.id,
    order: 14,
    text: 'Тебе интереснее:',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Понять, как всё устроено',
        value: 'A',
        weights: { analytical: 2, technical: 1 },
      },
      {
        order: 2,
        text: 'Делать всё по системе',
        value: 'B',
        weights: { structure: 2 },
      },
      {
        order: 3,
        text: 'Работать с людьми',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'Создавать что-то новое',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  // =========================
  // MODULE 3: INTERESTS
  // =========================

  const likeOption = (
    questionText: string,
    order: number,
    weights: Record<string, number>,
  ) =>
    createQuestion({
      moduleId: interestsModule.id,
      order,
      text: questionText,
      type: QuestionType.LIKE_DISLIKE,
      options: [
        {
          order: 1,
          text: 'Нравится',
          value: 'LIKE',
          weights,
        },
        {
          order: 2,
          text: 'Не нравится',
          value: 'DISLIKE',
          weights: {},
        },
      ],
    });

  await likeOption('Создавать мобильные приложения', 1, {
    technical: 2,
    analytical: 1,
  });

  await likeOption('Придумывать дизайн сайтов или приложений', 2, {
    creative: 2,
    technical: 1,
  });

  await likeOption('Работать с числами и таблицами', 3, {
    analytical: 2,
    structure: 1,
  });

  await likeOption('Помогать людям решать их проблемы', 4, {
    social: 2,
  });

  await likeOption('Объяснять что-то другим (учить)', 5, {
    social: 2,
    structure: 1,
  });

  await likeOption('Организовывать мероприятия', 6, {
    business: 2,
    social: 1,
  });

  await likeOption('Снимать и монтировать видео', 7, {
    creative: 2,
  });

  await likeOption('Писать тексты или статьи', 8, {
    creative: 2,
    social: 1,
  });

  await likeOption('Работать с техникой (разбирать, собирать)', 9, {
    technical: 2,
    analytical: 1,
  });

  await likeOption('Придумывать бизнес-идеи', 10, {
    business: 2,
    creative: 1,
  });

  await likeOption('Работать с детьми', 11, {
    social: 2,
  });

  await likeOption('Изучать, как устроен человек (психология)', 12, {
    social: 2,
    analytical: 1,
  });

  await likeOption('Анализировать данные и искать закономерности', 13, {
    analytical: 2,
  });

  await likeOption('Создавать что-то своими руками', 14, {
    technical: 2,
    creative: 1,
  });

  await likeOption('Работать над проектом вместе с другими', 15, {
    social: 2,
    business: 1,
  });

  await likeOption('Работать самостоятельно', 16, {
    analytical: 1,
    structure: 1,
  });

  await likeOption('Выступать перед людьми', 17, {
    social: 2,
    business: 1,
  });

  await likeOption('Рисовать или заниматься творчеством', 18, {
    creative: 2,
  });

  await likeOption('Решать сложные задачи', 19, {
    analytical: 2,
    technical: 1,
  });

  await likeOption('Планировать и организовывать процессы', 20, {
    structure: 2,
    business: 1,
  });

  await likeOption('Работать с природой или животными', 21, {
    social: 1,
    analytical: 1,
  });

  await likeOption('Пробовать новые приложения и разбираться, как они работают', 22, {
    technical: 2,
    analytical: 1,
  });

  await likeOption('Помогать людям принимать решения', 23, {
    social: 2,
    business: 1,
  });

  await likeOption('Делать несколько задач одновременно', 24, {
    business: 2,
    structure: 1,
  });

  await likeOption('Придумывать что-то новое и необычное', 25, {
    creative: 2,
  });





    const studyProfileModule = modules.find((m) => m.code === 'study_profile');
  const valuesModule = modules.find((m) => m.code === 'values');
  const antiProfessionModule = modules.find((m) => m.code === 'anti_profession');

  if (!studyProfileModule) {
    throw new Error('study_profile module not found');
  }

  if (!valuesModule) {
    throw new Error('values module not found');
  }

  if (!antiProfessionModule) {
    throw new Error('anti_profession module not found');
  }

  // =========================
  // MODULE 4: STUDY PROFILE
  // =========================

  await createQuestion({
    moduleId: studyProfileModule.id,
    order: 1,
    text: 'Если бы в расписании на завтра можно было оставить только один тип уроков, что бы ты выбрал?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Точные науки (Математика, Физика, Информатика)',
        value: 'A',
        weights: { analytical: 2, technical: 2 },
      },
      {
        order: 2,
        text: 'Естественные науки (Биология, Химия, География)',
        value: 'B',
        weights: { analytical: 1, social: 1 },
      },
      {
        order: 3,
        text: 'Гуманитарный цикл (Литература, История, Обществознание)',
        value: 'C',
        weights: { social: 2, creative: 1 },
      },
      {
        order: 4,
        text: 'Творчество и спорт (МХК, ИЗО, Физкультура)',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: studyProfileModule.id,
    order: 2,
    text: 'Какой вид домашнего задания вызывает у тебя меньше всего желания «отложить его на потом»?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Решение задач, где есть один четкий правильный ответ',
        value: 'A',
        weights: { analytical: 2, structure: 1 },
      },
      {
        order: 2,
        text: 'Написание эссе, сочинений или рассуждений на свободную тему',
        value: 'B',
        weights: { creative: 2, social: 1 },
      },
      {
        order: 3,
        text: 'Лабораторные работы, опыты или создание макетов/проектов',
        value: 'C',
        weights: { technical: 2, analytical: 1 },
      },
      {
        order: 4,
        text: 'Чтение параграфов и пересказ событий/фактов',
        value: 'D',
        weights: { structure: 2, social: 1 },
      },
    ],
  });

  await createQuestion({
    moduleId: studyProfileModule.id,
    order: 3,
    text: 'Когда учитель объясняет новую сложную тему, что помогает тебе понять её быстрее?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Логические схемы, формулы и графики',
        value: 'A',
        weights: { analytical: 2, technical: 1 },
      },
      {
        order: 2,
        text: 'Живые примеры из жизни, истории и метафоры',
        value: 'B',
        weights: { social: 2, creative: 1 },
      },
      {
        order: 3,
        text: 'Возможность сразу попробовать сделать что-то руками или за компьютером',
        value: 'C',
        weights: { technical: 2, creative: 1 },
      },
      {
        order: 4,
        text: 'Структурированный текст и конспект в тетради',
        value: 'D',
        weights: { structure: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: studyProfileModule.id,
    order: 4,
    text: 'Представь, что тебе нужно подготовить проект. Какую роль в команде ты выберешь?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: '«Аналитик»: буду искать данные, считать цифры и строить графики',
        value: 'A',
        weights: { analytical: 2, technical: 1 },
      },
      {
        order: 2,
        text: '«Оратор»: подготовлю красивую речь и выступлю перед классом',
        value: 'B',
        weights: { social: 2, business: 1 },
      },
      {
        order: 3,
        text: '«Оформитель»: сделаю крутую презентацию, видео или дизайн',
        value: 'C',
        weights: { creative: 2 },
      },
      {
        order: 4,
        text: '«Архивариус»: соберу всю информацию в один структурированный документ',
        value: 'D',
        weights: { structure: 2, analytical: 1 },
      },
    ],
  });

  await createQuestion({
    moduleId: studyProfileModule.id,
    order: 5,
    text: 'Какая интеллектуальная «победа» приносит тебе больше всего удовольствия?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Разобраться в запутанном коде или сложной теореме',
        value: 'A',
        weights: { analytical: 2, technical: 2 },
      },
      {
        order: 2,
        text: 'Выучить 50 новых иностранных слов или прочитать сложную книгу',
        value: 'B',
        weights: { social: 2, structure: 1 },
      },
      {
        order: 3,
        text: 'Выиграть в школьных дебатах или переспорить учителя',
        value: 'C',
        weights: { social: 2, business: 1 },
      },
      {
        order: 4,
        text: 'Спроектировать или собрать что-то',
        value: 'D',
        weights: { technical: 2, creative: 1 },
      },
    ],
  });

  const scaleQuestion = (
    order: number,
    text: string,
    weightsByScore: Record<number, Record<string, number>>,
  ) =>
    createQuestion({
      moduleId: studyProfileModule.id,
      order,
      text,
      type: QuestionType.SCALE,
      options: [
        {
          order: 1,
          text: '1 — совсем не нравится',
          value: '1',
          weights: weightsByScore[1] ?? {},
        },
        {
          order: 2,
          text: '2',
          value: '2',
          weights: weightsByScore[2] ?? {},
        },
        {
          order: 3,
          text: '3',
          value: '3',
          weights: weightsByScore[3] ?? {},
        },
        {
          order: 4,
          text: '4',
          value: '4',
          weights: weightsByScore[4] ?? {},
        },
        {
          order: 5,
          text: '5 — очень нравится',
          value: '5',
          weights: weightsByScore[5] ?? {},
        },
      ],
    });

  await scaleQuestion(
    6,
    'Оцени свой интерес к сфере: Числа и алгоритмы (Математика, Информатика)',
    {
      1: {},
      2: { analytical: 1 },
      3: { analytical: 2 },
      4: { analytical: 3, technical: 1 },
      5: { analytical: 4, technical: 2 },
    },
  );

  await scaleQuestion(
    7,
    'Оцени свой интерес к сфере: Живая природа и человек (Биология, Экология)',
    {
      1: {},
      2: { analytical: 1 },
      3: { analytical: 1, social: 1 },
      4: { analytical: 2, social: 1 },
      5: { analytical: 2, social: 2 },
    },
  );

  await scaleQuestion(
    8,
    'Оцени свой интерес к сфере: Слова и смыслы (Русский язык, Литература, Иностранные языки)',
    {
      1: {},
      2: { social: 1 },
      3: { social: 2 },
      4: { social: 2, creative: 1 },
      5: { social: 3, creative: 2 },
    },
  );

  await scaleQuestion(
    9,
    'Оцени свой интерес к сфере: Общество и прошлое (История, Право, Экономика)',
    {
      1: {},
      2: { social: 1 },
      3: { social: 2, business: 1 },
      4: { social: 2, business: 2 },
      5: { social: 3, business: 2 },
    },
  );

  await scaleQuestion(
    10,
    'Оцени свой интерес к сфере: Материя и энергия (Физика, Химия)',
    {
      1: {},
      2: { analytical: 1 },
      3: { analytical: 2, technical: 1 },
      4: { analytical: 3, technical: 1 },
      5: { analytical: 4, technical: 2 },
    },
  );

  // =========================
  // MODULE 5: VALUES
  // =========================

  await createQuestion({
    moduleId: valuesModule.id,
    order: 1,
    text: 'Что для тебя будет главным показателем успеха через 10 лет?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Мое имя в списках самых богатых и влиятельных людей',
        value: 'A',
        weights: { business: 2, social: 1 },
      },
      {
        order: 2,
        text: 'Благодарность людей, которым я помог или чью жизнь изменил',
        value: 'B',
        weights: { social: 2 },
      },
      {
        order: 3,
        text: 'Признание коллег за то, что я создал что-то уникальное и новое',
        value: 'C',
        weights: { creative: 2, technical: 1 },
      },
      {
        order: 4,
        text: 'Возможность работать из любой точки мира и проводить время с семьей',
        value: 'D',
        weights: { structure: 1, creative: 1 },
      },
    ],
  });

  await createQuestion({
    moduleId: valuesModule.id,
    order: 2,
    text: 'Какой график работы кажется тебе самым подходящим?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Насыщенный день в офисе с 9 до 18, встречи, переговоры и четкий план',
        value: 'A',
        weights: { business: 2, structure: 1 },
      },
      {
        order: 2,
        text: 'Гибкий график: я сам решаю, когда работать, главное — выполнить задачу',
        value: 'B',
        weights: { creative: 2, technical: 1 },
      },
      {
        order: 3,
        text: 'Стабильный и предсказуемый режим, чтобы работа не мешала личной жизни',
        value: 'C',
        weights: { structure: 2 },
      },
      {
        order: 4,
        text: 'Работа «рывками»: периоды полного погружения в проект и долгие перерывы на отдых',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: valuesModule.id,
    order: 3,
    text: 'В какой компании ты бы хотел работать?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'В огромной международной корпорации с филиалами по всему миру',
        value: 'A',
        weights: { business: 2, structure: 1 },
      },
      {
        order: 2,
        text: 'В маленьком, но уютном стартапе, где все — как одна семья',
        value: 'B',
        weights: { social: 2, creative: 1 },
      },
      {
        order: 3,
        text: 'В государственной структуре, где всё надежно и по закону',
        value: 'C',
        weights: { structure: 2 },
      },
      {
        order: 4,
        text: 'Я хочу работать только на себя и развивать собственный бренд',
        value: 'D',
        weights: { creative: 2, business: 1 },
      },
    ],
  });

  await createQuestion({
    moduleId: valuesModule.id,
    order: 4,
    text: 'Представь, что тебе нужно выбрать между двумя вакансиями. Что перевесит?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Высокая зарплата и бонусы, даже если работа будет скучной',
        value: 'A',
        weights: { business: 2 },
      },
      {
        order: 2,
        text: 'Смысл и польза того, что я делаю, даже если платят меньше',
        value: 'B',
        weights: { social: 2 },
      },
      {
        order: 3,
        text: 'Постоянное обучение и возможность стать крутым экспертом в своей узкой теме',
        value: 'C',
        weights: { analytical: 2, technical: 1 },
      },
      {
        order: 4,
        text: 'Полная свобода действий и отсутствие контроля со стороны начальства',
        value: 'D',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: valuesModule.id,
    order: 5,
    text: 'Что тебя больше всего пугает в будущей работе?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Отсутствие карьерного роста — когда годами сидишь на одном месте',
        value: 'A',
        weights: { business: 2 },
      },
      {
        order: 2,
        text: 'Ощущение, что мой труд бесполезен и никому не нужен',
        value: 'B',
        weights: { social: 2 },
      },
      {
        order: 3,
        text: 'Однообразие и отсутствие возможности проявить творчество',
        value: 'C',
        weights: { creative: 2 },
      },
      {
        order: 4,
        text: 'Нестабильность — когда не знаешь, сколько заработаешь в следующем месяце',
        value: 'D',
        weights: { structure: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: valuesModule.id,
    order: 6,
    text: 'Какое окружение на работе для тебя идеальное?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'Сильные конкуренты, которые заставляют меня расти и становиться лучше',
        value: 'A',
        weights: { business: 2 },
      },
      {
        order: 2,
        text: 'Единомышленники, с которыми мы горим общей идеей',
        value: 'B',
        weights: { social: 2 },
      },
      {
        order: 3,
        text: 'Тихий кабинет, где меня никто не отвлекает от моих задач',
        value: 'C',
        weights: { analytical: 2, structure: 1 },
      },
      {
        order: 4,
        text: 'Постоянно новые люди: клиенты, партнеры, разные знакомства каждый день',
        value: 'D',
        weights: { social: 2, business: 1 },
      },
    ],
  });

  await createQuestion({
    moduleId: valuesModule.id,
    order: 7,
    text: 'На что ты готов тратить свои силы больше всего?',
    type: QuestionType.SINGLE_CHOICE,
    options: [
      {
        order: 1,
        text: 'На борьбу за лидерство и управление большой командой',
        value: 'A',
        weights: { business: 2, social: 1 },
      },
      {
        order: 2,
        text: 'На глубокое изучение науки, технологий или искусства',
        value: 'B',
        weights: { analytical: 2, technical: 1, creative: 1 },
      },
      {
        order: 3,
        text: 'На общение, поддержку и заботу о других людях',
        value: 'C',
        weights: { social: 2 },
      },
      {
        order: 4,
        text: 'На создание комфортной и спокойной жизни для себя и близких',
        value: 'D',
        weights: { structure: 2 },
      },
    ],
  });

  // =========================
  // MODULE 6: ANTI-PROFESSION
  // =========================

  await createQuestion({
    moduleId: antiProfessionModule.id,
    order: 1,
    text: 'Что для тебя менее неприятно?',
    description: 'A) 8 часов подряд заполнять Excel и проверять цифры / B) 8 часов подряд выслушивать жалобы клиентов',
    type: QuestionType.FORCED_CHOICE,
    options: [
      {
        order: 1,
        text: 'A) Excel и цифры',
        value: 'A',
        weights: { analytical: 2, structure: 1 },
      },
      {
        order: 2,
        text: 'B) Жалобы клиентов',
        value: 'B',
        weights: { social: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: antiProfessionModule.id,
    order: 2,
    text: 'Что для тебя менее неприятно?',
    description: 'A) Делать одно и то же каждый день по шаблону / B) Каждый день не понимать, что вообще делать',
    type: QuestionType.FORCED_CHOICE,
    options: [
      {
        order: 1,
        text: 'A) Работа по шаблону',
        value: 'A',
        weights: { structure: 2 },
      },
      {
        order: 2,
        text: 'B) Неопределённость',
        value: 'B',
        weights: { creative: 2, business: 1 },
      },
    ],
  });

  await createQuestion({
    moduleId: antiProfessionModule.id,
    order: 3,
    text: 'Что для тебя менее неприятно?',
    description: 'A) Работать в полной тишине без людей / B) Работать в шуме и постоянных разговорах',
    type: QuestionType.FORCED_CHOICE,
    options: [
      {
        order: 1,
        text: 'A) В тишине без людей',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'B) В шуме и разговорах',
        value: 'B',
        weights: { social: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: antiProfessionModule.id,
    order: 4,
    text: 'Что для тебя менее неприятно?',
    description: 'A) Отвечать за жизнь человека / B) Отвечать за деньги компании',
    type: QuestionType.FORCED_CHOICE,
    options: [
      {
        order: 1,
        text: 'A) За жизнь человека',
        value: 'A',
        weights: { social: 2 },
      },
      {
        order: 2,
        text: 'B) За деньги компании',
        value: 'B',
        weights: { business: 2, analytical: 1 },
      },
    ],
  });

  await createQuestion({
    moduleId: antiProfessionModule.id,
    order: 5,
    text: 'Что для тебя менее неприятно?',
    description: 'A) Жёсткий график с 9 до 18 / B) Свободный график, но работаешь когда придётся',
    type: QuestionType.FORCED_CHOICE,
    options: [
      {
        order: 1,
        text: 'A) Жёсткий график',
        value: 'A',
        weights: { structure: 2 },
      },
      {
        order: 2,
        text: 'B) Свободный график с плавающей нагрузкой',
        value: 'B',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: antiProfessionModule.id,
    order: 6,
    text: 'Что для тебя менее неприятно?',
    description: 'A) Читать сложные тексты и анализировать / B) Уговаривать людей купить то, что им не особо нужно',
    type: QuestionType.FORCED_CHOICE,
    options: [
      {
        order: 1,
        text: 'A) Читать и анализировать',
        value: 'A',
        weights: { analytical: 2 },
      },
      {
        order: 2,
        text: 'B) Уговаривать людей',
        value: 'B',
        weights: { social: 2, business: 1 },
      },
    ],
  });

  await createQuestion({
    moduleId: antiProfessionModule.id,
    order: 7,
    text: 'Что для тебя менее неприятно?',
    description: 'A) Целый день за компьютером / B) Целый день на ногах',
    type: QuestionType.FORCED_CHOICE,
    options: [
      {
        order: 1,
        text: 'A) За компьютером',
        value: 'A',
        weights: { technical: 2, analytical: 1 },
      },
      {
        order: 2,
        text: 'B) На ногах',
        value: 'B',
        weights: { social: 1, business: 1 },
      },
    ],
  });

  await createQuestion({
    moduleId: antiProfessionModule.id,
    order: 8,
    text: 'Что для тебя менее неприятно?',
    description: 'A) Когда тебе говорят, что делать / B) Когда тебе вообще ничего не говорят',
    type: QuestionType.FORCED_CHOICE,
    options: [
      {
        order: 1,
        text: 'A) Строгий начальник и понятные задачи',
        value: 'A',
        weights: { structure: 2 },
      },
      {
        order: 2,
        text: 'B) Полная самостоятельность',
        value: 'B',
        weights: { creative: 2, business: 1 },
      },
    ],
  });

  await createQuestion({
    moduleId: antiProfessionModule.id,
    order: 9,
    text: 'Что для тебя менее неприятно?',
    description: 'A) Скучная, но стабильная работа / B) Интересная, но сегодня есть — завтра нет',
    type: QuestionType.FORCED_CHOICE,
    options: [
      {
        order: 1,
        text: 'A) Стабильная работа',
        value: 'A',
        weights: { structure: 2 },
      },
      {
        order: 2,
        text: 'B) Нестабильная, но интересная',
        value: 'B',
        weights: { creative: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: antiProfessionModule.id,
    order: 10,
    text: 'Что для тебя менее неприятно?',
    description: 'A) Исправлять чужие косяки / B) Жить с мыслью, что любой косяк — твой',
    type: QuestionType.FORCED_CHOICE,
    options: [
      {
        order: 1,
        text: 'A) Исправлять чужие ошибки',
        value: 'A',
        weights: { analytical: 2, structure: 1 },
      },
      {
        order: 2,
        text: 'B) Полная личная ответственность',
        value: 'B',
        weights: { business: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: antiProfessionModule.id,
    order: 11,
    text: 'Что для тебя менее неприятно?',
    description: 'A) Постоянно учиться новому / B) Делать одно и то же годами без развития',
    type: QuestionType.FORCED_CHOICE,
    options: [
      {
        order: 1,
        text: 'A) Постоянно учиться новому',
        value: 'A',
        weights: { analytical: 1, creative: 1, technical: 1 },
      },
      {
        order: 2,
        text: 'B) Делать одно и то же без развития',
        value: 'B',
        weights: { structure: 2 },
      },
    ],
  });

  await createQuestion({
    moduleId: antiProfessionModule.id,
    order: 12,
    text: 'Что для тебя менее неприятно?',
    description: 'A) Работать с техникой и системами / B) Работать с людьми и их эмоциями',
    type: QuestionType.FORCED_CHOICE,
    options: [
      {
        order: 1,
        text: 'A) С техникой и системами',
        value: 'A',
        weights: { technical: 2, analytical: 1 },
      },
      {
        order: 2,
        text: 'B) С людьми и эмоциями',
        value: 'B',
        weights: { social: 2 },
      },
    ],
  });




  await prisma.profession.createMany({
    data: [
      {
        name: 'Frontend разработчик',
        description: 'Разрабатывает пользовательские интерфейсы',
        category: 'IT',
        tags: ['ui', 'web', 'apps'],
        weights: {
          analytical: 6,
          creative: 9,
          social: 5,
        },
      },
      {
        name: 'Backend разработчик',
        description: 'Работает с серверной логикой и API',
        category: 'IT',
        tags: ['api', 'server', 'database'],
        weights: {
          analytical: 10,
          creative: 3,
          social: 2,
        },
      },
      {
        name: 'UX/UI дизайнер',
        description: 'Проектирует пользовательский опыт',
        category: 'Design',
        tags: ['design', 'interface', 'product'],
        weights: {
          analytical: 5,
          creative: 10,
          social: 6,
        },
      },
      {
        name: 'Графический дизайнер',
        description: 'Создает визуальный контент',
        category: 'Design',
        tags: ['branding', 'visual', 'art'],
        weights: {
          analytical: 3,
          creative: 10,
          social: 4,
        },
      },
      {
        name: 'Психолог',
        description: 'Работает с людьми и их состоянием',
        category: 'Social',
        tags: ['help', 'people', 'consulting'],
        weights: {
          analytical: 4,
          creative: 5,
          social: 10,
        },
      },
      {
        name: 'Учитель',
        description: 'Обучает и развивает учеников',
        category: 'Education',
        tags: ['education', 'people', 'communication'],
        weights: {
          analytical: 6,
          creative: 6,
          social: 9,
        },
      },
      {
        name: 'Бизнес-аналитик',
        description: 'Анализирует процессы и улучшает бизнес',
        category: 'Business',
        tags: ['management', 'analysis', 'strategy'],
        weights: {
          analytical: 10,
          creative: 4,
          social: 6,
        },
      },
      {
        name: 'Менеджер проектов',
        description: 'Управляет командами и задачами',
        category: 'Management',
        tags: ['planning', 'team', 'delivery'],
        weights: {
          analytical: 7,
          creative: 5,
          social: 10,
        },
      },
      {
        name: 'Data Analyst',
        description: 'Анализирует данные и делает выводы',
        category: 'IT',
        tags: ['data', 'logic', 'numbers'],
        weights: {
          analytical: 10,
          creative: 3,
          social: 3,
        },
      },
      {
        name: 'Системный аналитик',
        description: 'Проектирует архитектуру систем',
        category: 'IT',
        tags: ['requirements', 'logic', 'systems'],
        weights: {
          analytical: 10,
          creative: 4,
          social: 4,
        },
      },
    ],
  });

  

  console.log('Seed completed');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });