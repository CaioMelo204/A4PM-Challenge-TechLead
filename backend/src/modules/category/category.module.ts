import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from '../../shared/database/entity/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ICategoryService } from './interface/category.service.interface';
import { ICategoryRepository } from './interface/category.repository.interface';
import { CategoryRepository } from './repository/category.repository';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), AuthModule, JwtModule],
  controllers: [CategoryController],
  providers: [
    {
      provide: ICategoryService,
      useClass: CategoryService,
    },
    {
      provide: ICategoryRepository,
      useClass: CategoryRepository,
    },
  ],
})
export class CategoryModule {}
