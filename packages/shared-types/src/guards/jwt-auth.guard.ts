import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * JwtAuthGuard — validates the Clerk JWT from Authorization header.
 * Applied globally or per-route on all NestJS services.
 *
 * Attach the decoded user to request.user for downstream use.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    const token = authHeader.split(' ')[1];

    // Token verification is delegated to auth-service via a shared verifier.
    // In production this calls Clerk's JWKS endpoint; in tests, override with mock.
    const user = await this.verifyToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = user;
    return true;
  }

  /**
   * Override in tests or subclass to inject a mock verifier.
   */
  protected async verifyToken(token: string): Promise<Record<string, unknown> | null> {
    // Dynamic import to avoid bundling Clerk in packages that don't need it
    try {
      const { verifyToken } = await import('@clerk/clerk-sdk-node' as string);
      const payload = await (verifyToken as Function)(token, {
        secretKey: process.env['CLERK_SECRET_KEY'],
      });
      return payload as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
