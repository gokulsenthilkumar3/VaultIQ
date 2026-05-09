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
    const user = await this.prisma.user.findUnique({
      where: { azureId },
    });
    if (!user) return null;
    return user;
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

  // Mock Azure AD validation (for development)
  async devLogin(email: string) {
    let user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Auto-create user for dev purposes if they don't exist
      user = await this.prisma.user.create({
        data: {
          email,
          fullName: email.split('@')[0],
          azureId: `dev-${Math.random().toString(36).substr(2, 9)}`,
          role: email.includes('admin') ? 'ADMIN' : 'USER',
        },
      });
    }

    return this.login(user);
  }
}
