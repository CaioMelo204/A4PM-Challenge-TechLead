import { ApiProperty } from '@nestjs/swagger';

export class LinksResponse {
  @ApiProperty()
  rel: string;

  @ApiProperty()
  href: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  title: string;
}
