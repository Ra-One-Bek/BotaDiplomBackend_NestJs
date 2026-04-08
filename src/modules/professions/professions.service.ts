import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProfessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.profession.findMany({
      orderBy: { id: 'asc' },
    });
  }
}