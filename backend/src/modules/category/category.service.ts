import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ICategoryService } from './interface/category.service.interface';
import { ICategoryRepository } from './interface/category.repository.interface';
import { v4 as uuidv4 } from 'uuid';
import { SearchCategoryDto } from './dto/search.category.dto';
import { CategoriesResponseHttp } from './http/categories.response.http';
import { CategoryResponseHttp } from './http/category.response.http';
import { CategoriesResponseDto } from './dto/categories.response.dto';
import { CategoryResponseDto } from './dto/category.response.dto';

@Injectable()
export class CategoryService implements ICategoryService {
  private readonly logger = new Logger(CategoryService.name, {
    timestamp: true,
  });

  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async search(
    dto: SearchCategoryDto,
    id_usuarios: number,
  ): Promise<CategoriesResponseDto> {
    const requestId = uuidv4();

    const commonLogMetadata = {
      requestId,
      context: CategoryService.name,
      userId: id_usuarios,
    };

    this.logger.log('Iniciando processo de search das categorias', {
      ...commonLogMetadata,
    });

    try {
      const limit = dto.limit || 25;
      const page = dto.page || 1;
      const order = dto.order || 'desc';

      const filters = {
        nome: dto.nome,
      };

      const [categories, count] = await this.categoryRepository.findAll({
        order: order,
        limit: limit,
        offset: (page - 1) * limit,
        ...filters,
      });

      this.logger.debug('Consulta de categorias no banco de dados', {
        ...commonLogMetadata,
        resultsFound: count,
      });

      return CategoriesResponseHttp.toJSON(
        'categorias buscadas com Sucesso!',
        categories,
        {
          current_page: page,
          limit: limit,
          total_pages: Math.ceil(count / limit),
          total_records: count,
        },
        {
          direction: order,
          field: 'nome',
        },
        {
          version: '1.0.0',
          userId: id_usuarios,
          timestamp: new Date().toISOString(),
          requestId,
        },
        {
          ...filters,
        },
      );
    } catch (error) {
      this.logger.error(
        'Erro inesperado durante o processo de busca de categorias',
        {
          ...commonLogMetadata,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      );

      throw new InternalServerErrorException();
    }
  }

  async findOne(id: number, id_usuarios: number): Promise<CategoryResponseDto> {
    const requestId = uuidv4();

    const commonLogMetadata = {
      requestId,
      context: CategoryService.name,
      userId: id_usuarios,
    };

    this.logger.log('Iniciando processo de obtenção de uma categoria', {
      ...commonLogMetadata,
    });

    try {
      const category = await this.categoryRepository.findOne(id);

      if (!category) {
        this.logger.warn(
          'Tentativa de busca falhou: categoria não encontrada',
          {
            ...commonLogMetadata,
            recipeId: id,
          },
        );
        throw new NotFoundException('Categoria não encontrada');
      }

      this.logger.debug('Consultas de receita no banco de dados', {
        ...commonLogMetadata,
        recipeId: category.id,
      });

      return CategoryResponseHttp.toJSON(
        'Categoria Obtida com sucesso!',
        category,
        {
          requestId,
          userId: id_usuarios,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        'Erro inesperado durante o processo de obtenção de categoria',
        {
          ...commonLogMetadata,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      );

      throw new InternalServerErrorException();
    }
  }
}
