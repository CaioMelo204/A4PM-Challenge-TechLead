import { Category } from '../../../shared/database/entity/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from '../interface/category.repository.interface';
import { Like, Repository } from 'typeorm';
import { FindAllCategoryRepositoryDto } from '../dto/find-all.category.repository.dto';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll({
    offset,
    order,
    limit,
    nome,
  }: FindAllCategoryRepositoryDto): Promise<[Category[], number]> {
    return await this.categoryRepository.findAndCount({
      where: {
        nome: nome ? Like(`%${nome}%`) : undefined,
      },
      order: {
        nome: order || 'asc',
      },
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: number): Promise<Category | null> {
    return await this.categoryRepository.findOne({
      where: {
        id,
      },
    });
  }
}
