export interface IUserEntity {
  id: number;
  nome: string | null;
  login: string;
  senha: string;
  criado_em: Date;
  alterado_em: Date;
}
