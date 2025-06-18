import { IRecipeRepository } from '../interface/recipe.repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Recipe } from '../../../shared/database/entity/recipe.entity';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';
import { FindAllRepositoryDto } from '../dto/find-all.repository.dto';

@Injectable()
export class RecipeRepository implements IRecipeRepository {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async findAll({
    id_categorias,
    limit,
    nome,
    offset,
    ingredientes,
    porcoes,
    order,
    id_usuarios,
  }: FindAllRepositoryDto): Promise<[Recipe[], number]> {
    return await this.recipeRepository.findAndCount({
      where: {
        id_categorias: id_categorias,
        nome: nome ? Like(`%${nome}%`) : undefined,
        ingredientes: ingredientes ? Like(`%${ingredientes}%`) : undefined,
        porcoes,
        id_usuarios,
      },
      order: {
        criado_em: order || 'desc',
      },
      take: limit || 25,
      skip: offset || 0,
    });
  }

  async findByUserIdAndId(
    id: number,
    id_usuarios: number,
  ): Promise<Recipe | null> {
    return await this.recipeRepository.findOne({
      where: {
        id_usuarios,
        id,
      },
    });
  }

  async create({
    ingredientes,
    modo_preparo,
    tempo_preparo_minutos,
    porcoes,
    nome,
    id_usuarios,
    id_categorias,
  }: CreateRecipeDto): Promise<Recipe> {
    return await this.recipeRepository.save({
      ingredientes,
      modo_preparo,
      id_usuarios,
      id_categorias,
      nome,
      porcoes,
      tempo_preparo_minutos,
      criado_em: new Date(),
      alterado_em: new Date(),
    });
  }

  async update({
    id,
    id_usuarios,
    nome,
    ingredientes,
    modo_preparo,
    porcoes,
    tempo_preparo_minutos,
    id_categorias,
  }: UpdateRecipeDto): Promise<Recipe> {
    return await this.recipeRepository.save({
      ingredientes,
      nome,
      porcoes,
      tempo_preparo_minutos,
      modo_preparo,
      id,
      id_usuarios,
      alterado_em: new Date(),
      id_categorias,
    });
  }

  async delete(id: number, id_usuarios: number): Promise<void> {
    await this.recipeRepository.delete({
      id_usuarios,
      id,
    });
  }
}
