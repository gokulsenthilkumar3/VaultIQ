import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface AuthResponse extends TokenPair {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  // Access token TTL in seconds (15 minutes)
  private readonly ACCESS_TOKEN_TTL = 15 * 60;
  // Refresh token TTL in seconds (7 days)
  private readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(azureId: string) {
    return this.prisma.user.findUnique({ where: { azureId } });
  }

  private buildPayload(user: { id: string; email: string; role: string }) {
    return { email: user.email, sub: user.id, role: user.role };
  }

  async login(user: { id: string; email: string; fullName: string; role: string }): Promise<AuthResponse> {
    const payload = this.buildPayload(user);
    const access_token = this.jwtService.sign(payload, { expiresIn: this.ACCESS_TOKEN_TTL });
    const refresh_token = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: this.REFRESH_TOKEN_TTL },
    );
    return {
      access_token,
      refresh_token,
      expires_in: this.ACCESS_TOKEN_TTL,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    };
  }

  /**
   * Validates a refresh token and issues a new access + refresh token pair.
   * The old refresh token is implicitly invalidated by issuing a new one
   * (token rotation pattern).
   */
  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true },
    });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    const access_token = this.jwtService.sign(this.buildPayload(user), {
      expiresIn: this.ACCESS_TOKEN_TTL,
    });
    const new_refresh_token = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: this.REFRESH_TOKEN_TTL },
    );
    return { access_token, refresh_token: new_refresh_token, expires_in: this.ACCESS_TOKEN_TTL };
  }

  async devLogin(email: string): Promise<AuthResponse> {
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Dev login is disabled in production');
    }
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          fullName: email
            .split('@')[0]
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          azureId: `dev-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          role: email.toLowerCase().includes('admin')
            ? 'ADMIN'
            : email.toLowerCase().includes('manager')
            ? 'MANAGER'
            : 'USER',
        },
      });
    }
    return this.login(user);
  }
}
