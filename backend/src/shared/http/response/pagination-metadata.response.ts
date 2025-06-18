import { MetadataResponse } from './metadata.response';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetadata {
  @ApiProperty()
  total_records: number;

  @ApiProperty()
  total_pages: number;

  @ApiProperty()
  current_page: number;

  @ApiProperty()
  limit: number;
}

export class SortMetadata {
  @ApiProperty()
  field: string;

  @ApiProperty()
  direction: string;
}

export class PaginationMetadataResponse extends MetadataResponse {
  @ApiProperty()
  pagination: PaginationMetadata;

  @ApiProperty()
  sortApplied: SortMetadata;
}
