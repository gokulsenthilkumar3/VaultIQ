import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '../types';

/**
 * ProjectScopeGuard — validates that the x-project-id header is present
 * and that the authenticated user has a role within that project.
 *
 * Apply this guard on any route that is scoped to a project.
 */
@Injectable()
export class ProjectScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const projectId = request.headers['x-project-id'] as string | undefined;

    if (!projectId) {
      throw new BadRequestException('Missing required header: x-project-id');
    }

    const user = request.user;

    if (!user || !user.roles) {
      throw new ForbiddenException('User has no project assignments');
    }

    const userRoles: Array<{ role: Role; projectId: string }> = user.roles;

    // SUPER_ADMIN can access any project
    const isSuperAdmin = userRoles.some((r) => r.role === Role.SUPER_ADMIN);
    if (isSuperAdmin) return true;

    const hasProjectAccess = userRoles.some((r) => r.projectId === projectId);

    if (!hasProjectAccess) {
      throw new ForbiddenException(`No access to project: ${projectId}`);
    }

    // Attach resolved projectId to request for downstream use
    request.projectId = projectId;

    return true;
  }
}
