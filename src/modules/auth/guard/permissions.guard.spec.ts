import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  it('should be defined', () => {
    const reflector = new Reflector();
    expect(new PermissionsGuard(reflector)).toBeDefined();
  });
});
