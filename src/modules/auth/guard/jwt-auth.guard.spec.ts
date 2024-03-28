import { JwtAuthGuard } from './jwt-auth.guard';

describe('GuardGuard', () => {
  it('should be defined', () => {
    expect(new JwtAuthGuard()).toBeDefined();
  });
});
