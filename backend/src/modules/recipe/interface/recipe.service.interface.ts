import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { SearchRecipeDto } from '../dto/search-recipe.dto';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';
import { RecipeResponse } from '../dto/recipe.response.dto';
import { RecipesResponseDto } from '../dto/recipes.response.dto';

export abstract class IRecipeService {
  abstract search(
    dto: SearchRecipeDto,
    usuarios_id: number,
  ): Promise<RecipesResponseDto>;
  abstract findOne(id: number, usuarios_id: number): Promise<RecipeResponse>;
  abstract create(dto: CreateRecipeDto): Promise<RecipeResponse>;
  abstract update(dto: UpdateRecipeDto): Promise<RecipeResponse>;
  abstract delete(id: number, usuarios_id: number): Promise<RecipeResponse>;
}
