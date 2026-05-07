import { ConfigService } from '@nestjs/config';

export const redisConfig = (config: ConfigService) => ({
  host: config.getOrThrow<string>('REDIS_HOST'),
  port: config.getOrThrow<number>('REDIS_PORT'),
});
