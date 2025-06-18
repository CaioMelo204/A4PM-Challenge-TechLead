import {
  PaginationMetadata,
  PaginationMetadataResponse,
  SortMetadata,
} from '../../../shared/http/response/pagination-metadata.response';
import { MetadataResponse } from '../../../shared/http/response/metadata.response';
import { LinksResponse } from '../../../shared/http/response/links.response';
import {
  CategoriesResponseData,
  CategoriesResponseDto,
} from '../dto/categories.response.dto';

export class CategoriesResponseHttp {
  static toJSON(
    message: string,
    data: CategoriesResponseData[],
    pagination: PaginationMetadata,
    sort: SortMetadata,
    metadata: MetadataResponse,
    filters?: Object,
  ): CategoriesResponseDto {
    let queryParams: string = '?';

    if (filters) {
      for (const key of Object.keys(filters)) {
        if (filters[key]) {
          queryParams += `${key}=${filters[key]}&`;
        }
      }
    }

    const defaultLinks: LinksResponse[] = [
      {
        rel: 'self',
        href: `/category${queryParams}order=${sort.direction}&page=${pagination.current_page}&limit=${pagination.limit}`,
        method: 'GET',
        title: 'Pagina Atual de Resultados',
      },
      {
        rel: 'first',
        href: `/category${queryParams}order=${sort.direction}&page=1&limit=${pagination.limit}`,
        method: 'GET',
        title: 'Primeira Página de Resultados',
      },
      ...(pagination.total_pages > pagination.current_page
        ? [
            {
              rel: 'next',
              href: `/category${queryParams}order=${sort.direction}&page=${pagination.current_page + 1}&limit=${pagination.limit}`,
              method: 'GET',
              title: 'Próxima Página de Resultados',
            },
          ]
        : []),
      ...(pagination.current_page > 1 &&
      pagination.current_page < pagination.total_pages
        ? [
            {
              rel: 'prev',
              href: `/category${queryParams}order=${sort.direction}&page=${pagination.current_page - 1}&limit=${pagination.limit}`,
              method: 'GET',
              title: 'Página Anterior de Resultados',
            },
          ]
        : []),
      {
        rel: 'last',
        href: `/category${queryParams}order=${sort.direction}&page=${pagination.total_pages}&limit=${pagination.limit}`,
        method: 'GET',
        title: 'Última Página de Resultados',
      },
    ];

    const responseMetadata: PaginationMetadataResponse = {
      version: '1.0.0',
      pagination: pagination,
      timestamp: metadata.timestamp,
      userId: metadata.userId,
      sortApplied: sort,
      requestId: metadata.requestId,
    };

    return {
      message,
      data: data,
      metadata: responseMetadata,
      links: defaultLinks,
    };
  }
}
