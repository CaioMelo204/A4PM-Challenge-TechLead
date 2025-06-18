import { ApiProperty } from '@nestjs/swagger';

export class MetadataResponse {
  @ApiProperty()
  version: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  requestId: string;

  @ApiProperty()
  userId?: number;
}
