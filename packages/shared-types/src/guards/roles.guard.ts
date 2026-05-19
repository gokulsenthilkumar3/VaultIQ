import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../types';

export const ROLES_KEY = 'roles';

/**
 * @Roles decorator — attach required roles to a controller or handler.
 * @example @Roles(Role.PROJECT_ADMIN, Role.AGENT)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/**
 * RolesGuard — checks the authenticated user's role against required roles.
 * Must be used AFTER JwtAuthGuard (requires request.user to be set).
 *
 * Respects project scoping: role is validated against the x-project-id header.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @Roles() decorator, allow all authenticated users
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      throw new ForbiddenException('Access denied: no roles assigned');
    }

    const projectId = request.headers['x-project-id'] as string | undefined;
    const userRoles: Array<{ role: Role; projectId: string }> = user.roles;

    const hasRole = userRoles.some((userRole) => {
      const roleMatches = requiredRoles.includes(userRole.role);
      // SUPER_ADMIN bypasses project scoping
      if (userRole.role === Role.SUPER_ADMIN) return true;
      // Other roles must match the project context
      const projectMatches = !projectId || userRole.projectId === projectId;
      return roleMatches && projectMatches;
    });

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: requires one of [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
