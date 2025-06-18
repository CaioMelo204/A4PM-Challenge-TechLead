import { IUserEntity } from '../interface/user.entity.interface';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Recipe } from './recipe.entity';

@Entity('usuarios')
export class User implements IUserEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nome: string | null;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  login: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  senha: string;

  @Column({ type: 'datetime', nullable: false })
  criado_em: Date;

  @Column({ type: 'datetime', nullable: false })
  alterado_em: Date;

  @OneToMany(() => Recipe, (recipe) => recipe.usuario)
  receitas: Recipe[];
}
