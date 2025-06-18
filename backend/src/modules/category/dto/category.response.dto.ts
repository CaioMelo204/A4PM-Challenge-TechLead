import { ApiProperty } from '@nestjs/swagger';
import { MetadataResponse } from '../../../shared/http/response/metadata.response';
import { LinksResponse } from '../../../shared/http/response/links.response';
import { CategoriesResponseData } from './categories.response.dto';

export class CategoryResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({
    isArray: true,
    type: CategoriesResponseData,
  })
  data: CategoriesResponseData;

  @ApiProperty({
    type: MetadataResponse,
  })
  metadata: MetadataResponse;

  @ApiProperty({
    type: LinksResponse,
    isArray: true,
  })
  links: LinksResponse[];
}
