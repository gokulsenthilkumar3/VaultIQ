import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { email: string; fullName: string; role: string }) {
    return this.prisma.user.create({
      data: {
        ...data,
        azureId: `local-auth-${Date.now()}`,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });
  }
}
