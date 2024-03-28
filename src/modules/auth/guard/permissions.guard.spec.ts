import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './premissions.guard';

describe('PremissionsGuard', () => {
  it('should be defined', () => {
    const reflector = new Reflector();
    expect(new PermissionsGuard(reflector)).toBeDefined();
  });
});
