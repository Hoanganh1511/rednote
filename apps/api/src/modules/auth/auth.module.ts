import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { default as Redis } from 'ioredis';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SmsService } from './sms.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SmsService,
    JwtStrategy,
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis({
          host: config.getOrThrow('REDIS_HOST'),
          port: config.getOrThrow('REDIS_PORT'),
        }),
    },
  ],
})
export class AuthModule {}
