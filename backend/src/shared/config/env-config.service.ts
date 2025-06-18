import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEnvConfigService } from './interface/env-config.service.interface';

@Injectable()
export class EnvConfigService implements IEnvConfigService {
  constructor(private readonly configService: ConfigService) {}

  getEnviroment(): string | undefined {
    return this.configService.get<string>('NODE_ENV');
  }

  getJwtExpire(): string | undefined {
    return this.configService.get<string>('JWT_EXPIRE');
  }

  getJwtSecret(): string | undefined {
    return this.configService.get<string>('JWT_SECRET');
  }

  getDatabaseHost(): string | undefined {
    return this.configService.get<string>('DATABASE_HOST');
  }

  getDatabaseName(): string | undefined {
    return this.configService.get<string>('DATABASE_NAME');
  }

  getDatabaseUsername(): string | undefined {
    return this.configService.get<string>('DATABASE_USERNAME');
  }

  getDatabasePassword(): string | undefined {
    return this.configService.get<string>('DATABASE_PASSWORD');
  }

  getDatabasePort(): number | undefined {
    return Number(this.configService.get<string>('DATABASE_PORT'));
  }
}
