import { RecipeResponseData } from './recipe.response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetadataResponse } from '../../../shared/http/response/pagination-metadata.response';
import { LinksResponse } from '../../../shared/http/response/links.response';

export class RecipesResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({
    isArray: true,
    type: RecipeResponseData,
  })
  data: RecipeResponseData[];

  @ApiProperty()
  metadata: PaginationMetadataResponse;

  @ApiProperty({
    isArray: true,
    type: LinksResponse,
  })
  links: LinksResponse[];
}
