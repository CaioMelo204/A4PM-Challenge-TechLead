import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Recipe } from './entity/recipe.entity';
import { Category } from './entity/category.entity';
import { DatabaseService } from './database.service';
import { IEnvConfigService } from '../config/interface/env-config.service.interface';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: IEnvConfigService) => {
        if (configService.getEnviroment() === 'test') {
          return {
            type: 'sqlite',
            database: ':memory:',
            entities: [__dirname + '/../database/entity/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
          };
        }

        return {
          type: 'mysql',
          host: configService.getDatabaseHost(),
          port: configService.getDatabasePort(),
          username: configService.getDatabaseUsername(),
          password: configService.getDatabasePassword(),
          database: configService.getDatabaseName(),
          entities: [__dirname + '/../database/entity/**/*.entity{.ts,.js}'],
          synchronize: false,
          autoLoadEntities: true,
          ssl: false,
          logging: true,
        };
      },
      inject: [IEnvConfigService],
    }),
    TypeOrmModule.forFeature([User, Recipe, Category]),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
