import { Category } from '../../../shared/database/entity/category.entity';
import { FindAllCategoryRepositoryDto } from '../dto/find-all.category.repository.dto';

export abstract class ICategoryRepository {
  abstract findAll(
    dto: FindAllCategoryRepositoryDto,
  ): Promise<[Category[], number]>;
  abstract findOne(id: number): Promise<Category | null>;
}
