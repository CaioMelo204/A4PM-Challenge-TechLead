import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IRecipeEntity } from '../interface/recipe.entity.interface';
import { User } from './user.entity';
import { Category } from './category.entity';

@Entity('receitas')
export class Recipe implements IRecipeEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, nullable: false })
  id_usuarios: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  id_categorias: number | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  nome: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  tempo_preparo_minutos: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  porcoes: number | null;

  @Column({ type: 'text', nullable: false })
  modo_preparo: string;

  @Column({ type: 'text', nullable: true })
  ingredientes: string | null;

  @Column({ type: 'datetime', nullable: false })
  criado_em: Date;

  @Column({ type: 'datetime', nullable: false })
  alterado_em: Date;

  @ManyToOne(() => User, (user) => user.receitas, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuarios', referencedColumnName: 'id' })
  usuario: User;

  @ManyToOne(() => Category, (category) => category.receitas, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_categorias', referencedColumnName: 'id' })
  categoria: Category;
}
