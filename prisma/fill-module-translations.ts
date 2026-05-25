import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Translation = {
  ru: string;
  kk: string;
  en: string;
};

const translations: Translation[] = [
  {
    ru: 'Темперамент личности',
    kk: 'Тұлғаның темпераменті',
    en: 'Personality temperament',
    },
    {
    ru: 'Определение базового темперамента и поведенческого стиля.',
    kk: 'Негізгі темперамент пен мінез-құлық стилін анықтау.',
    en: 'Identifying basic temperament and behavioral style.',
    },
    {
    ru: 'Личность и стиль мышления',
    kk: 'Тұлға және ойлау стилі',
    en: 'Personality and thinking style',
    },
    {
    ru: 'Аналитика, структура, люди или креатив.',
    kk: 'Аналитика, құрылым, адамдар немесе шығармашылық.',
    en: 'Analytics, structure, people, or creativity.',
    },
    {
    ru: 'Интересы и мотивация',
    kk: 'Қызығушылықтар мен мотивация',
    en: 'Interests and motivation',
    },
    {
    ru: 'Что тебе действительно нравится делать.',
    kk: 'Саған шын мәнінде не істеу ұнайтынын анықтау.',
    en: 'What you truly enjoy doing.',
    },
    {
    ru: 'Учебный профиль',
    kk: 'Оқу профилі',
    en: 'Study profile',
    },
    {
    ru: 'Какие типы дисциплин и задач тебе ближе.',
    kk: 'Қандай пәндер мен тапсырмалар саған жақынырақ екенін анықтау.',
    en: 'Which types of subjects and tasks are closer to you.',
    },
    {
    ru: 'Образ жизни и ценности',
    kk: 'Өмір салты және құндылықтар',
    en: 'Lifestyle and values',
    },
    {
    ru: 'Что для тебя важнее: статус, польза, творчество или свобода.',
    kk: 'Сен үшін не маңыздырақ: мәртебе, пайда, шығармашылық немесе еркіндік.',
    en: 'What matters more to you: status, impact, creativity, or freedom.',
    },
    {
    ru: 'Анти-профессия',
    kk: 'Сәйкес келмейтін мамандық',
    en: 'Anti-profession',
    },
    {
    ru: 'Что тебе точно не подходит по рутине и формату работы.',
    kk: 'Жұмыс тәртібі мен форматы бойынша саған нақты сәйкес келмейтін нәрселер.',
    en: 'What definitely does not suit you in terms of routine and work format.',
    },

    {
    ru: 'Какой у вас характер?',
    kk: 'Сіздің мінезіңіз қандай?',
    en: 'What is your personality like?',
    },
    {
    ru: 'Спокойный, медлительный, миролюбивый',
    kk: 'Сабырлы, баяу, бейбіт',
    en: 'Calm, slow, peaceful',
    },
    {
    ru: 'Робкий, обидчивый, нерешительный',
    kk: 'Ұялшақ, ренжігіш, шешім қабылдауда сенімсіз',
    en: 'Shy, sensitive, indecisive',
    },
    {
    ru: 'Энергичный, шаловливый, задиристый',
    kk: 'Қуатты, тентек, қызуқанды',
    en: 'Energetic, playful, combative',
    },
    {
    ru: 'Жизнелюбивый, оптимистичный, общительный',
    kk: 'Өмірсүйгіш, оптимист, көпшіл',
    en: 'Cheerful, optimistic, sociable',
    },
    {
    ru: 'Какие эмоции чаще?',
    kk: 'Қандай эмоциялар жиірек болады?',
    en: 'Which emotions do you experience more often?',
    },
    {
    ru: 'Положительные, без бурных реакций',
    kk: 'Жағымды, қатты реакциясыз',
    en: 'Positive, without strong reactions',
    },
    {
    ru: 'Страх',
    kk: 'Қорқыныш',
    en: 'Fear',
    },
    {
    ru: 'Гнев, бурные эмоции',
    kk: 'Ашу, күшті эмоциялар',
    en: 'Anger, intense emotions',
    },
    {
    ru: 'Положительные, много смеха',
    kk: 'Жағымды, көп күлу',
    en: 'Positive, lots of laughter',
    },
    {
    ru: 'Какие игры нравятся?',
    kk: 'Қандай ойындар ұнайды?',
    en: 'What kinds of games do you like?',
    },
    {
    ru: 'Уединённые, тихие',
    kk: 'Жалғыз ойнайтын, тыныш ойындар',
    en: 'Solitary and quiet games',
    },
    {
    ru: 'Уединённые; шумные — только с близкими',
    kk: 'Жалғыз ойнайтын; шулы ойындар тек жақындармен',
    en: 'Solitary; noisy games only with close people',
    },
    {
    ru: 'Азартные, шумные, агрессивные',
    kk: 'Қызықты, шулы, белсенді ойындар',
    en: 'Exciting, noisy, aggressive games',
    },
    {
    ru: 'Всякие, но весёлые',
    kk: 'Әртүрлі, бірақ көңілді ойындар',
    en: 'Any games, but fun ones',
    },
    {
    ru: 'Реакция на наказание?',
    kk: 'Жазаға реакцияңыз қандай?',
    en: 'How do you react to punishment?',
    },
    {
    ru: 'Без эмоций',
    kk: 'Эмоциясыз',
    en: 'Without emotions',
    },
    {
    ru: 'С обидой',
    kk: 'Ренішпен',
    en: 'With resentment',
    },
    {
    ru: 'На словесные — спокойно, на другие — протест',
    kk: 'Сөзбен айтылғанына сабырлы, басқасына қарсылық білдіремін',
    en: 'Calm with verbal remarks, protest against other forms',
    },
    {
    ru: 'Спокойно',
    kk: 'Сабырлы',
    en: 'Calmly',
    },
    {
    ru: 'В неожиданных ситуациях?',
    kk: 'Күтпеген жағдайларда қандайсыз?',
    en: 'How are you in unexpected situations?',
    },
    {
    ru: 'Малоэмоционально',
    kk: 'Эмоцияны аз білдіремін',
    en: 'With little emotion',
    },
    {
    ru: 'Избегаю',
    kk: 'Қашқақтаймын',
    en: 'I avoid them',
    },
    {
    ru: 'Сопротивляюсь',
    kk: 'Қарсылық білдіремін',
    en: 'I resist',
    },
    {
    ru: 'Любопытство',
    kk: 'Қызығушылық танытамын',
    en: 'Curiosity',
    },
    {
    ru: 'Общительность?',
    kk: 'Қарым-қатынасқа бейімділігіңіз қандай?',
    en: 'How sociable are you?',
    },
    {
    ru: 'Предпочитаю уединение',
    kk: 'Жалғыздықты қалаймын',
    en: 'I prefer solitude',
    },
    {
    ru: 'Только с близкими',
    kk: 'Тек жақын адамдармен',
    en: 'Only with close people',
    },
    {
    ru: 'Нужны зрители',
    kk: 'Маған тыңдаушылар керек',
    en: 'I need an audience',
    },
    {
    ru: 'Люблю всех',
    kk: 'Барлығымен араласқанды ұнатамын',
    en: 'I like everyone',
    },
    {
    ru: 'Лидерство среди сверстников?',
    kk: 'Құрдастар арасында көшбасшылық?',
    en: 'Leadership among peers?',
    },
    {
    ru: 'Нет',
    kk: 'Жоқ',
    en: 'No',
    },
    {
    ru: 'В узком кругу',
    kk: 'Шағын ортада',
    en: 'In a small circle',
    },
    {
    ru: 'Сам выдвигаюсь',
    kk: 'Өзім алға шығамын',
    en: 'I put myself forward',
    },
    {
    ru: 'Прирождённый лидер',
    kk: 'Туа біткен көшбасшы',
    en: 'A natural leader',
    },
    {
    ru: 'Особенности памяти?',
    kk: 'Есте сақтау ерекшелігіңіз қандай?',
    en: 'What are your memory characteristics?',
    },
    {
    ru: 'Медленно, но надолго',
    kk: 'Баяу, бірақ ұзақ уақытқа есте сақтаймын',
    en: 'Slowly, but for a long time',
    },
    {
    ru: 'По-разному, вникаю в мелочи',
    kk: 'Әртүрлі, ұсақ-түйекке мән беремін',
    en: 'It varies; I focus on details',
    },
    {
    ru: 'Быстро детали, быстро забываю',
    kk: 'Тез есте сақтаймын, бірақ тез ұмытып қаламын',
    en: 'I quickly remember details, but forget quickly',
    },
    {
    ru: 'Быстро и долго',
    kk: 'Тез әрі ұзақ есте сақтаймын',
    en: 'Quickly and for a long time',
    },
    {
    ru: 'Усвоение нового?',
    kk: 'Жаңа нәрсені меңгеруіңіз қандай?',
    en: 'How do you learn new things?',
    },
    {
    ru: 'Медленно, обстоятельно',
    kk: 'Баяу, мұқият',
    en: 'Slowly and thoroughly',
    },
    {
    ru: 'Зависит от обстоятельств',
    kk: 'Жағдайға байланысты',
    en: 'Depends on the situation',
    },
    {
    ru: 'На лету, но забываю',
    kk: 'Тез түсінемін, бірақ ұмытып қаламын',
    en: 'I catch on quickly, but forget',
    },
    {
    ru: 'Быстро и легко',
    kk: 'Тез және оңай',
    en: 'Quickly and easily',
    },
    {
    ru: 'Утомляемость?',
    kk: 'Шаршағыштығыңыз қандай?',
    en: 'How quickly do you get tired?',
    },
    {
    ru: 'Очень низкая',
    kk: 'Өте төмен',
    en: 'Very low',
    },
    {
    ru: 'Высокая',
    kk: 'Жоғары',
    en: 'High',
    },
    {
    ru: 'Зависит от эмоций',
    kk: 'Эмоцияға байланысты',
    en: 'Depends on emotions',
    },
    {
    ru: 'Средняя',
    kk: 'Орташа',
    en: 'Average',
    },
    {
    ru: 'Особенности речи?',
    kk: 'Сөйлеу ерекшелігіңіз қандай?',
    en: 'What are your speech characteristics?',
    },
    {
    ru: 'Медленная, невыразительная',
    kk: 'Баяу, мәнерсіз',
    en: 'Slow and not very expressive',
    },
    {
    ru: 'Тихая, неуверенная',
    kk: 'Тыныш, сенімсіз',
    en: 'Quiet and uncertain',
    },
    {
    ru: 'Эмоциональная, быстрая',
    kk: 'Эмоциялы, жылдам',
    en: 'Emotional and fast',
    },
    {
    ru: 'Живая, с мимикой',
    kk: 'Жанды, мимикамен',
    en: 'Lively, with facial expressions',
    },
    {
    ru: 'Движения?',
    kk: 'Қимыл-қозғалысыңыз қандай?',
    en: 'What are your movements like?',
    },
    {
    ru: 'Солидные, неторопливые',
    kk: 'Салмақты, асықпайтын',
    en: 'Steady and unhurried',
    },
    {
    ru: 'Суетливые, неуверенные',
    kk: 'Абыржыған, сенімсіз',
    en: 'Fussy and uncertain',
    },
    {
    ru: 'Резкие, порывистые',
    kk: 'Шалт, екпінді',
    en: 'Sharp and impulsive',
    },
    {
    ru: 'Ритмичные, уверенные',
    kk: 'Ырғақты, сенімді',
    en: 'Rhythmic and confident',
    },
    {
    ru: 'Привыкание к школе/новому?',
    kk: 'Мектепке немесе жаңа жағдайға бейімделуіңіз қандай?',
    en: 'How do you adapt to school or something new?',
    },
    {
    ru: 'Боязнь перемен',
    kk: 'Өзгерістерден қорқу',
    en: 'Fear of change',
    },
    {
    ru: 'Трудная адаптация',
    kk: 'Қиын бейімделу',
    en: 'Difficult adaptation',
    },
    {
    ru: 'Лёгкое, но неохотно подчиняюсь',
    kk: 'Оңай бейімделемін, бірақ бағынуды ұнатпаймын',
    en: 'Easy adaptation, but I dislike obeying',
    },
    {
    ru: 'Быстрая и лёгкая',
    kk: 'Тез және оңай',
    en: 'Fast and easy',
    },
    {
    ru: 'Особенности сна?',
    kk: 'Ұйқы ерекшелігіңіз қандай?',
    en: 'What are your sleep characteristics?',
    },
    {
    ru: 'Быстро засыпаю, вяло просыпаюсь',
    kk: 'Тез ұйықтаймын, баяу оянамын',
    en: 'I fall asleep quickly and wake up slowly',
    },
    {
    ru: 'Долго укладываюсь, весело просыпаюсь',
    kk: 'Ұзақ жатамын, бірақ көңілді оянамын',
    en: 'I take long to fall asleep and wake up cheerful',
    },
    {
    ru: 'Трудно засыпаю, разное состояние',
    kk: 'Қиын ұйықтаймын, күйім әртүрлі болады',
    en: 'I fall asleep with difficulty and wake up differently',
    },
    {
    ru: 'Быстро, крепко, весело',
    kk: 'Тез, қатты ұйықтаймын, көңілді оянамын',
    en: 'Quickly, deeply, and cheerfully',
    },
];

async function main() {
  for (const item of translations) {
    await prisma.assessmentModule.updateMany({
      where: { title: item.ru },
      data: {
        titleRu: item.ru,
        titleKk: item.kk,
        titleEn: item.en,
      },
    });

    await prisma.assessmentModule.updateMany({
      where: { description: item.ru },
      data: {
        descriptionRu: item.ru,
        descriptionKk: item.kk,
        descriptionEn: item.en,
      },
    });

    await prisma.question.updateMany({
      where: { text: item.ru },
      data: {
        textRu: item.ru,
        textKk: item.kk,
        textEn: item.en,
      },
    });

    await prisma.question.updateMany({
      where: { description: item.ru },
      data: {
        descriptionRu: item.ru,
        descriptionKk: item.kk,
        descriptionEn: item.en,
      },
    });

    await prisma.answerOption.updateMany({
      where: { text: item.ru },
      data: {
        textRu: item.ru,
        textKk: item.kk,
        textEn: item.en,
      },
    });
  }

  console.log('Module translations filled');
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