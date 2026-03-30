import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.answerOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.profession.deleteMany();

  await prisma.question.create({
    data: {
      text: 'Какой вид деятельности вам нравится больше всего?',
      category: 'IT',
      options: {
        create: [
          { text: 'Работать с программами и технологиями', score: 3 },
          { text: 'Рисовать и придумывать дизайн', score: 1 },
          { text: 'Помогать людям', score: 1 },
          { text: 'Организовывать процессы', score: 2 },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      text: 'Какой школьный предмет вам нравится больше?',
      category: 'Design',
      options: {
        create: [
          { text: 'Информатика', score: 2 },
          { text: 'Изобразительное искусство', score: 3 },
          { text: 'Биология', score: 1 },
          { text: 'Экономика', score: 2 },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      text: 'Что вам интереснее?',
      category: 'Medicine',
      options: {
        create: [
          { text: 'Разбираться в строении организма', score: 3 },
          { text: 'Создавать интерфейсы и макеты', score: 1 },
          { text: 'Писать код', score: 1 },
          { text: 'Управлять командой', score: 2 },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      text: 'Какая работа вам ближе?',
      category: 'Business',
      options: {
        create: [
          { text: 'Анализировать рынок и принимать решения', score: 3 },
          { text: 'Лечить и консультировать людей', score: 1 },
          { text: 'Разрабатывать приложения', score: 2 },
          { text: 'Создавать брендинг и визуал', score: 1 },
        ],
      },
    },
  });

  await prisma.profession.createMany({
    data: [
      {
        name: 'Frontend разработчик',
        description: 'Создаёт пользовательские интерфейсы сайтов и приложений.',
        category: 'IT',
      },
      {
        name: 'Backend разработчик',
        description: 'Разрабатывает серверную логику, API и базы данных.',
        category: 'IT',
      },
      {
        name: 'UX/UI дизайнер',
        description: 'Проектирует удобные и красивые цифровые интерфейсы.',
        category: 'Design',
      },
      {
        name: 'Графический дизайнер',
        description: 'Создаёт визуальные материалы, айдентику и брендинг.',
        category: 'Design',
      },
      {
        name: 'Врач',
        description: 'Диагностирует, лечит и консультирует пациентов.',
        category: 'Medicine',
      },
      {
        name: 'Медицинский лаборант',
        description: 'Проводит исследования и лабораторные анализы.',
        category: 'Medicine',
      },
      {
        name: 'Бизнес-аналитик',
        description: 'Исследует процессы компании и предлагает улучшения.',
        category: 'Business',
      },
      {
        name: 'Менеджер проектов',
        description: 'Организует работу команды и контролирует выполнение задач.',
        category: 'Business',
      },
    ],
  });

  console.log('Seed completed');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });