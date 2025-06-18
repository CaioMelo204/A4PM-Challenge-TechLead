import { PaginationInterface } from '../../../shared/interface/pagination.interface';

export interface FindAllCategoryRepositoryDto extends PaginationInterface {
  nome?: string;
}
