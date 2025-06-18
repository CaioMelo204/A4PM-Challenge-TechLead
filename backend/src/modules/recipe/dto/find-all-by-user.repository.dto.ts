import { PaginationInterface } from '../../../shared/interface/pagination.interface';

export interface FindAllByUserRepositoryDto extends PaginationInterface {
  userId: number;
}
