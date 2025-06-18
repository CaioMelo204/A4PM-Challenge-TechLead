import { IsNumberString, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { OrderType } from '../types/order.type';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationRequest {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  @Transform((value) => Number(value) || undefined)
  limit?: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  @Transform((value) => Number(value) || undefined)
  page?: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches('^(asc|desc)$')
  order?: OrderType;
}
