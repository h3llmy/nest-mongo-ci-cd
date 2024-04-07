import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategies } from './strategies/jwt.strategies';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { PermissionsGuard } from './guard/permissions.guard';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    JwtStrategies,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AuthModule {}
