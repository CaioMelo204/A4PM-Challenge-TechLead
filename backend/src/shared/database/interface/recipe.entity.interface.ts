export interface IRecipeEntity {
  id: number;
  id_usuarios: number;
  id_categorias: number | null;
  nome: string | null;
  tempo_preparo_minutos: number | null;
  porcoes: number | null;
  modo_preparo: string;
  ingredientes: string | null;
  criado_em: Date;
  alterado_em: Date;
}
