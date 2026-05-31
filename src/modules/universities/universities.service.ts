import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ParseReviewsDto } from './dto/parse-reviews.dto';
import puppeteer from 'puppeteer';

@Injectable()
export class UniversitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async getUniversities() {
    return this.prisma.university.findMany({
      orderBy: [
        { rating: 'desc' },
        { name: 'asc' },
      ],
      include: {
        reviews: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getReviews(universityId: number) {
    return this.prisma.universityReview.findMany({
      where: { universityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async seedUniversities() {
    const universities = [
      {
        name: 'Al-Farabi Kazakh National University',
        city: 'Алматы',
        description: 'Один из крупнейших университетов Казахстана.',
        website: 'https://www.kaznu.kz',
      },
      {
        name: 'Nazarbayev University',
        city: 'Астана',
        description: 'Современный исследовательский университет.',
        website: 'https://nu.edu.kz',
      },
      {
        name: 'Astana IT University',
        city: 'Астана',
        description: 'IT-университет цифровых технологий.',
        website: 'https://astanait.edu.kz',
      },
      {
        name: 'Kazakh-British Technical University',
        city: 'Алматы',
        description: 'Технический и бизнес-ориентированный университет.',
        website: 'https://kbtu.edu.kz',
      },
      {
        name: 'Satbayev University',
        city: 'Алматы',
        description: 'Технический университет инженерных направлений.',
        website: 'https://satbayev.university',
      },
    ];

    for (const university of universities) {
      await this.prisma.university.upsert({
        where: { name: university.name },
        update: university,
        create: university,
      });
    }

    return {
      message: 'Universities seeded',
      count: universities.length,
    };
  }

  async parseDefaultReviews() {
    return this.parseReviews({
        sources: [
        {
            universityName: 'Astana IT University',
            source: 'example-parser',
            url: 'https://example.com',
            reviewSelector: 'p',
            textSelector: '',
        },
        {
            universityName: 'Nazarbayev University',
            source: 'example-parser',
            url: 'https://example.com',
            reviewSelector: 'p',
            textSelector: '',
        },
        {
            universityName: 'Kazakh-British Technical University',
            source: 'example-parser',
            url: 'https://example.com',
            reviewSelector: 'p',
            textSelector: '',
        },
        ],
    });
    }

    private isUsefulReviewText(text: string) {
        const normalized = text.trim();

        if (normalized.length < 25) return false;
        if (normalized.length > 700) return false;

        const bannedParts = [
            'Контакты',
            'Инфо',
            'Отзывы',
            'Цены',
            'Фото',
            'Карта',
            'Полезно',
            'Читать целиком',
            'Службы',
            'Реклама',
            'Перейти на сайт',
            'Показать полностью',
            'Подробнее',
            'Официальный ответ',
            'Написать отзыв',
            'Добавить отзыв',
        ];

        return !bannedParts.some((part) =>
            normalized.toLowerCase().includes(part.toLowerCase()),
        );
        }

  async parseReviews(dto: ParseReviewsDto) {
    let saved = 0;
    let skipped = 0;

    const debug: any[] = [];

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        for (const source of dto.sources) {
        const university = await this.prisma.university.findFirst({
            where: {
            name: source.universityName,
            },
        });

        if (!university) {
            skipped++;
            continue;
        }

        const page = await browser.newPage();

        try {
            await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
            );

            await page.goto(source.url, {
            waitUntil: 'networkidle2',
            timeout: 60000,
            });

            const pageTitle = await page.title();

            const bodyPreview = await page.evaluate(() => {
            return document.body?.innerText?.slice(0, 1500) ?? '';
            });

            if (
            bodyPreview.includes('2ГИС советует обновить браузер') ||
            bodyPreview.includes('обновить браузер') ||
            bodyPreview.includes('Пропустить обновление браузера')
            ) {
            skipped++;

            debug.push({
                universityName: source.universityName,
                source: source.source,
                url: source.url,
                pageTitle,
                bodyPreview,
                reason: 'Blocked by browser update page',
            });

            continue;
            }

            debug.push({
            universityName: source.universityName,
            source: source.source,
            url: source.url,
            pageTitle,
            bodyPreview,
            });

            if (source.waitSelector) {
            await page.waitForSelector(source.waitSelector, {
                timeout: 15000,
            });
            }

            const reviews = await page.evaluate((config) => {
                const reviewNodes = Array.from(
                    document.querySelectorAll(config.reviewSelector),
                );

                const parsedBySelector = reviewNodes
                    .map((node) => {
                    const root = node as HTMLElement;

                    const textElement = config.textSelector
                        ? root.querySelector(config.textSelector)
                        : root;

                    const authorElement = config.authorSelector
                        ? root.querySelector(config.authorSelector)
                        : null;

                    const ratingElement = config.ratingSelector
                        ? root.querySelector(config.ratingSelector)
                        : null;

                    return {
                        text: textElement?.textContent?.trim() ?? '',
                        author: authorElement?.textContent?.trim() ?? null,
                        ratingText: ratingElement?.textContent?.trim() ?? '',
                    };
                    })
                    .filter((item) => item.text.length > 0);

                if (parsedBySelector.length > 0) {
                    return parsedBySelector;
                }

                return [];

                }, source);

            for (const review of reviews) {
                if (!this.isUsefulReviewText(review.text)) {
                    skipped++;
                    continue;
                }
            const ratingMatch = review.ratingText.match(/\d+([.,]\d+)?/);

            const rating = ratingMatch
                ? Number(ratingMatch[0].replace(',', '.'))
                : null;

            await this.prisma.universityReview.upsert({
                where: {
                universityId_source_text: {
                    universityId: university.id,
                    source: source.source,
                    text: review.text,
                },
                },
                update: {
                author: review.author,
                rating,
                sourceUrl: source.url,
                },
                create: {
                universityId: university.id,
                author: review.author,
                rating,
                text: review.text,
                source: source.source,
                sourceUrl: source.url,
                },
            });

            saved++;
            }
        } catch (error) {
            skipped++;
        } finally {
            await page.close();
        }
        }
    } finally {
        await browser.close();
    }

    return {
        message: 'Reviews parsed',
        saved,
        skipped,
        debug,
    };
    }
}