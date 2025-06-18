import { PaginationRequest } from '../../../shared/http/request/pagination.request';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchCategoryDto extends PaginationRequest {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  nome?: string;
}
