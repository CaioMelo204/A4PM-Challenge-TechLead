import { ResourceResponse } from '../../../shared/http/response/resource.response';
import { ApiProperty } from '@nestjs/swagger';
import { Recipe } from '../../../shared/database/entity/recipe.entity';

export class RecipeResponseData {
  @ApiProperty()
  id: number;

  @ApiProperty()
  id_usuarios: number;

  @ApiProperty()
  id_categorias: number | null;

  @ApiProperty()
  nome: string | null;

  @ApiProperty()
  tempo_preparo_minutos: number | null;

  @ApiProperty()
  porcoes: number | null;

  @ApiProperty()
  modo_preparo: string;

  @ApiProperty()
  ingredientes: string | null;

  @ApiProperty()
  criado_em: Date;

  @ApiProperty()
  alterado_em: Date;
}

export class RecipeResponse extends ResourceResponse {
  @ApiProperty({
    type: RecipeResponseData,
  })
  data: RecipeResponseData;

  @ApiProperty()
  message: string;
}
