import { SearchCategoryDto } from '../dto/search.category.dto';
import { CategoryResponseDto } from '../dto/category.response.dto';
import { CategoriesResponseDto } from '../dto/categories.response.dto';

export abstract class ICategoryService {
  abstract search(
    dto: SearchCategoryDto,
    id_usuarios: number,
  ): Promise<CategoriesResponseDto>;
  abstract findOne(
    id: number,
    id_usuarios: number,
  ): Promise<CategoryResponseDto>;
}
