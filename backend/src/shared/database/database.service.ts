import { Injectable, OnModuleInit } from '@nestjs/common';
import { IEnvConfigService } from '../config/interface/env-config.service.interface';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(private readonly configService: IEnvConfigService) {}

  async onModuleInit() {
    if (!this.configService.getDatabaseHost()) {
      throw new Error(
        'Variáveis de ambiente do banco de dados não carregadas.',
      );
    }
  }
}
