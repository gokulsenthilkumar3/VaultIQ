import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(azureId: string) {
    return this.prisma.user.findUnique({ where: { azureId } });
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async devLogin(email: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Dev login is disabled in production');
    }
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          fullName: email.split('@')[0].replace(/[._-]/g, ' '),
          azureId: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          role: email.toLowerCase().includes('admin') ? 'ADMIN' : email.toLowerCase().includes('manager') ? 'MANAGER' : 'USER',
        },
      });
    }
    return this.login(user);
  }
}
