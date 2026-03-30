import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AskAiDto } from './dto/ask-ai.dto';

@Injectable()
export class AiService {
  constructor(private readonly configService: ConfigService) {}

  async askQuestion(dto: AskAiDto) {
    const geminiApiKey = this.configService.get<string>('geminiApiKey');

    if (!geminiApiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY не настроен');
    }

    const normalizedQuestion = dto.question.trim();

    if (!this.isCareerGuidanceQuestion(normalizedQuestion)) {
      throw new BadRequestException(
        'AI помощник отвечает только на вопросы по профориентации, профессиям, навыкам, обучению и карьерным направлениям.',
      );
    }

    const prompt = `
Ты AI-помощник мобильного приложения по профориентации школьников.

Правила ответа:
1. Отвечай только по теме профориентации, профессий, навыков, обучения, карьерных направлений и выбора специальности.
2. Если вопрос выходит за тему профориентации, вежливо откажись.
3. Отвечай простым, понятным языком для школьника.
4. Ответ должен быть полезным, кратким и конкретным.
5. Не выдумывай факты о вузах, зарплатах или рынках труда, если не уверен.
6. Не уходи в посторонние темы.

Вопрос пользователя:
${normalizedQuestion}
`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
            contents: [
            {
                parts: [
                {
                    text: prompt,
                },
                ],
            },
            ],
        },
        {
            headers: {
            'Content-Type': 'application/json',
            },
        },
        );

      const text =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        'Извините, не удалось получить ответ от AI.';

      return {
        answer: text,
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message || '';

      if (message.includes('quota')) {
        return {
          answer:
            'AI временно недоступен из-за лимита запросов. ' +
            'Рекомендуем рассмотреть профессии в IT, если вам нравится аналитика, программирование и технологии.',
        };
      }

      return {
        answer:
          'Не удалось получить ответ от AI. Попробуйте позже.',
      };
    }
  }

  private isCareerGuidanceQuestion(question: string): boolean {
    const lowerQuestion = question.toLowerCase();

    const keywords = [
      'професс',
      'карьер',
      'специальност',
      'навык',
      'работ',
      'учеб',
      'обуч',
      'вуз',
      'университет',
      'колледж',
      'школ',
      'it',
      'дизайн',
      'медицин',
      'бизнес',
      'программист',
      'дизайнер',
      'аналитик',
      'врач',
      'кем стать',
      'куда поступать',
      'направление',
    ];

    return keywords.some((keyword) => lowerQuestion.includes(keyword));
  }
}