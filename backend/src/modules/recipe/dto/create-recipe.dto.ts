import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecipeDto {
  id_usuarios: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id_categorias: number | null;

  @IsString()
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  nome: string | null;

  @IsNumber()
  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  tempo_preparo_minutos: number | null;

  @IsNumber()
  @Min(1)
  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  porcoes: number | null;

  @IsString()
  @ApiProperty({
    type: String,
    required: true,
  })
  modo_preparo: string;

  @IsString()
  @ApiProperty({
    type: String,
    required: false,
  })
  ingredientes: string | null;
}
