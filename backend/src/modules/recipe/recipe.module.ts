import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { IRecipeService } from './interface/recipe.service.interface';
import { IRecipeRepository } from './interface/recipe.repository.interface';
import { RecipeRepository } from './repository/recipe.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from '../../shared/database/entity/recipe.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Recipe]), JwtModule],
  controllers: [RecipeController],
  providers: [
    {
      provide: IRecipeService,
      useClass: RecipeService,
    },
    {
      provide: IRecipeRepository,
      useClass: RecipeRepository,
    },
  ],
})
export class RecipeModule {}
