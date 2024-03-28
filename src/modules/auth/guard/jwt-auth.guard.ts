import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Custom JWT (JSON Web Token) authentication guard.
 * Extends `AuthGuard` from `@nestjs/passport`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Override method to customize the handling of the request.
   * @param err - Error encountered during authentication.
   * @param user - User object if authentication is successful.
   * @returns User object if authentication is successful, otherwise undefined.
   */
  handleRequest(err: any, user: any) {
    return user;
  }
}
