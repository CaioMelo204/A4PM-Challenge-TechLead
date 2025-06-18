import { ApiProperty } from '@nestjs/swagger';
import { LinksResponse } from '../../../shared/http/response/links.response';
import { MetadataResponse } from '../../../shared/http/response/metadata.response';
import { PaginationMetadataResponse } from '../../../shared/http/response/pagination-metadata.response';

export class CategoriesResponseData {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nome: string | null;
}

export class CategoriesResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({
    isArray: true,
    type: CategoriesResponseData,
  })
  data: CategoriesResponseData[];

  @ApiProperty({
    type: MetadataResponse,
  })
  metadata: PaginationMetadataResponse;

  @ApiProperty({
    type: LinksResponse,
    isArray: true,
  })
  links: LinksResponse[];
}
