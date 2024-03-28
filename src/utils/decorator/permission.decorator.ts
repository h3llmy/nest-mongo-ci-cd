import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/user/entities/user.entity';

/**
 * Decorator to set metadata related to permissions for a route or a controller method.
 * @param roles - Array of user roles or 'authorize' string indicating permission requirements.
 * @returns Metadata indicating the required permissions.
 */
export const Permission = (...roles: (UserRole | 'authorize')[]) =>
  SetMetadata('permission', roles);
