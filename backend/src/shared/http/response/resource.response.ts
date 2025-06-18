import { MetadataResponse } from './metadata.response';
import { LinksResponse } from './links.response';
import { ApiProperty } from '@nestjs/swagger';

export class ResourceResponse {
  @ApiProperty()
  metadata?: MetadataResponse;

  @ApiProperty({
    isArray: true,
    type: LinksResponse,
  })
  links?: LinksResponse[];
}
