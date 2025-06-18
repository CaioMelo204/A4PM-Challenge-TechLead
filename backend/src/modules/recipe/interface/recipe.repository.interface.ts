import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';
import { FindAllRepositoryDto } from '../dto/find-all.repository.dto';
import { Recipe } from '../../../shared/database/entity/recipe.entity';

export abstract class IRecipeRepository {
  abstract findAll(dto: FindAllRepositoryDto): Promise<[Recipe[], number]>;
  abstract findByUserIdAndId(
    id: number,
    id_usuarios: number,
  ): Promise<Recipe | null>;
  abstract create(createRecipeDto: CreateRecipeDto): Promise<Recipe>;
  abstract update(updateRecipeDto: UpdateRecipeDto): Promise<Recipe>;
  abstract delete(id: number, id_usuarios: number): Promise<void>;
}
