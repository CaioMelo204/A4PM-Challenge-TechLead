import { MetadataResponse } from '../../../shared/http/response/metadata.response';
import { LinksResponse } from '../../../shared/http/response/links.response';
import { RecipeResponse, RecipeResponseData } from '../dto/recipe.response.dto';

export class RecipeResponseHttp {
  static toJSON(
    message: string,
    data: RecipeResponseData,
    meta: MetadataResponse,
  ): RecipeResponse {
    const defaultLinks: LinksResponse[] = [
      {
        rel: 'self',
        href: '/recipe/' + data.id,
        method: 'GET',
        title: 'Detalhes da Receita',
      },
      {
        rel: 'update',
        href: '/recipe/' + data.id,
        method: 'PATCH',
        title: 'Update da Receita',
      },
      {
        rel: 'delete',
        href: '/recipe/' + data.id,
        method: 'DELETE',
        title: 'Deletar a Receita',
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
