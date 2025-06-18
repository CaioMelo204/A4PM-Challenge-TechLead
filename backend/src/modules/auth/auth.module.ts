import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from './repository/user.repository';
import { IUserRepository } from './interface/user.repository.interface';
import { IAuthService } from './interface/auth.service.interface';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../shared/database/entity/user.entity';
import { AuthGuard } from './guard/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { IEnvConfigService } from '../../shared/config/interface/env-config.service.interface';
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: IEnvConfigService) => {
        return {
          global: true,
          secret: configService.getJwtSecret(),
          signOptions: {
            expiresIn: configService.getJwtExpire(),
          },
        };
      },
      inject: [IEnvConfigService],
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IAuthService,
      useClass: AuthService,
    },
    AuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthGuard],
})
export class AuthModule {}
