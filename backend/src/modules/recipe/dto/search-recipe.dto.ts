import { PaginationRequest } from '../../../shared/http/request/pagination.request';
import {
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchRecipeDto extends PaginationRequest {
  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  @Transform((value) => Number(value) || undefined)
  id_categorias?: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  ingredientes?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  @Transform((value) => Number(value) || undefined)
  porcoes?: number;
}
