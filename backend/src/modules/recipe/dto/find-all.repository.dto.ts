import { PaginationInterface } from '../../../shared/interface/pagination.interface';

export interface FindAllRepositoryDto extends PaginationInterface {
  id_categorias?: number;
  nome?: string;
  ingredientes?: string;
  porcoes?: number;
  id_usuarios: number;
}
