import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ICategoryEntity } from '../interface/category.entity.interface';
import { Recipe } from './recipe.entity';

@Entity('categorias')
export class Category implements ICategoryEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  nome: string | null;

  @OneToMany(() => Recipe, (recipe) => recipe.categoria)
  receitas: Recipe[];
}
