import { OrderType } from '../http/types/order.type';

export interface PaginationInterface {
  limit: number;
  offset: number;
  order: OrderType;
}
