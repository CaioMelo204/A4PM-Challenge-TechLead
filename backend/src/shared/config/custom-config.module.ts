import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { EnvConfigService } from './env-config.service';
import { IEnvConfigService } from './interface/env-config.service.interface';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        async () => {
          // exemplo de loading de parametros podendo ser recebido por um SSM por exemplo
          // const params = await SSMConfigService.loadParams();
          // process.env = { ...process.env, ...params };
          // return params;
          process.env = { ...process.env };
        },
      ],
    }),
  ],
  providers: [
    {
      provide: IEnvConfigService,
      useClass: EnvConfigService,
    },
  ],
  exports: [IEnvConfigService],
})
export class EnvConfigModule extends ConfigModule {
  static forRoot(options?: ConfigModuleOptions): Promise<DynamicModule> {
    return super.forRoot({
      ...options,
      envFilePath: [`${process.cwd()}/.env.${process.env.STAGE || 'dev'}`],
    });
  }
}
