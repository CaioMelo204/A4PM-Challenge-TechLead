import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { SearchRecipeDto } from './dto/search-recipe.dto';
import { TokenDataDecorator } from '../../shared/decorators/token-data.decorator';
import { IRecipeService } from './interface/recipe.service.interface';
import { ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RecipeResponse } from './dto/recipe.response.dto';
import { RecipesResponseDto } from './dto/recipes.response.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { TokenDataInterface } from '../../shared/decorators/token-data.interface';

@UseGuards(AuthGuard)
@Controller('recipe')
@ApiBearerAuth('access-token')
export class RecipeController {
  constructor(private readonly recipeService: IRecipeService) {}

  @Post()
  @ApiResponse({
    type: RecipeResponse,
  })
  create(
    @Body() createRecipeDto: CreateRecipeDto,
    @TokenDataDecorator() user: TokenDataInterface,
  ) {
    return this.recipeService.create({
      ...createRecipeDto,
      id_usuarios: user.user_id,
    });
  }

  @Get()
  @ApiResponse({
    type: RecipesResponseDto,
  })
  findAll(
    @Query() query: SearchRecipeDto,
    @TokenDataDecorator() user: TokenDataInterface,
  ) {
    return this.recipeService.search(query, user.user_id);
  }

  @Get(':id')
  @ApiResponse({
    type: RecipeResponse,
  })
  findOne(
    @Param('id') id: string,
    @TokenDataDecorator() user: TokenDataInterface,
  ) {
    return this.recipeService.findOne(+id, user.user_id);
  }

  @ApiResponse({
    type: RecipeResponse,
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @TokenDataDecorator() user: TokenDataInterface,
  ) {
    return this.recipeService.update({
      ...updateRecipeDto,
      id: +id,
      id_usuarios: user.user_id,
    });
  }

  @ApiResponse({
    type: RecipeResponse,
  })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @TokenDataDecorator() user: TokenDataInterface,
  ) {
    return this.recipeService.delete(+id, user.user_id);
  }
}
