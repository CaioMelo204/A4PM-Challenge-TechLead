import { MetadataResponse } from '../../../shared/http/response/metadata.response';
import { LinksResponse } from '../../../shared/http/response/links.response';
import { CategoriesResponseData } from '../dto/categories.response.dto';
import { CategoryResponseDto } from '../dto/category.response.dto';

export class CategoryResponseHttp {
  static toJSON(
    message: string,
    data: CategoriesResponseData,
    meta: MetadataResponse,
  ): CategoryResponseDto {
    const defaultLinks: LinksResponse[] = [
      {
        rel: 'self',
        href: '/recipe/' + data.id,
        method: 'GET',
        title: 'Detalhes da Receita',
      },
      {
        rel: 'recipes',
        href: '/recipe?id_categorias=' + data.id,
        method: 'GET',
        title: 'Receitas buscadas pela categoria',
      },
    ];

    return {
      message,
      data: data,
      links: defaultLinks,
      metadata: meta,
    };
  }
}
