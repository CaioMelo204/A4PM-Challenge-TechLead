import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { IRecipeRepository } from './interface/recipe.repository.interface';
import { RecipesReponseHttp } from './http/recipes.response.http';
import { v4 as uuidv4 } from 'uuid';
import { RecipeResponseHttp } from './http/recipe.response.http';
import { IRecipeService } from './interface/recipe.service.interface';
import { SearchRecipeDto } from './dto/search-recipe.dto';
import { RecipesResponseDto } from './dto/recipes.response.dto';
import { RecipeResponse } from './dto/recipe.response.dto';

@Injectable()
export class RecipeService implements IRecipeService {
  private readonly logger = new Logger(RecipeService.name, {
    timestamp: true,
  });

  constructor(private readonly recipeRepository: IRecipeRepository) {}

  async create(dto: CreateRecipeDto): Promise<RecipeResponse> {
    const requestId = uuidv4();

    const commonLogMetadata = {
      requestId,
      context: RecipeService.name,
      userId: dto.id_usuarios,
    };

    this.logger.log('Iniciando processo de criação de uma receita', {
      ...commonLogMetadata,
    });

    try {
      const recipe = await this.recipeRepository.create(dto);

      this.logger.debug('Criação da receita', {
        ...commonLogMetadata,
        recipeId: recipe.id,
      });

      const response = RecipeResponseHttp.toJSON(
        'Receita criada com sucesso!',
        recipe,
        {
          requestId,
          userId: dto.id_usuarios,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      );

      this.logger.log('Receita criada com sucesso', {
        ...commonLogMetadata,
        recipeId: recipe.id,
      });

      return response;
    } catch (error) {
      this.logger.error(
        'Erro inesperado durante o processo de criação de receita',
        {
          ...commonLogMetadata,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      );

      throw new InternalServerErrorException();
    }
  }

  async search(
    dto: SearchRecipeDto,
    id_usuarios: number,
  ): Promise<RecipesResponseDto> {
    const requestId = uuidv4();

    const commonLogMetadata = {
      requestId,
      context: RecipeService.name,
      userId: id_usuarios,
    };

    this.logger.log('Iniciando processo de search das receitas', {
      ...commonLogMetadata,
    });

    try {
      const limit = Number(dto.limit) || 25;
      const page = Number(dto.page) || 1;
      const order = dto.order || 'desc';

      const filters = {
        porcoes: dto.porcoes,
        nome: dto.nome,
        ingredientes: dto.ingredientes,
        id_categorias: dto.id_categorias,
      };

      const [recipes, count] = await this.recipeRepository.findAll({
        order: order,
        id_usuarios: id_usuarios,
        limit: limit,
        offset: (page - 1) * limit,
        ...filters,
      });

      this.logger.debug('Consulta de receitas no banco de dados', {
        ...commonLogMetadata,
        resultsFound: count,
      });

      return RecipesReponseHttp.toJSON(
        'receitas buscadas com Sucesso!',
        recipes,
        {
          current_page: page,
          limit: limit,
          total_pages: Math.ceil(count / limit),
          total_records: count,
        },
        {
          direction: order,
          field: 'criado_em',
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
        'Erro inesperado durante o processo de busca de receita',
        {
          ...commonLogMetadata,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      );

      throw new InternalServerErrorException();
    }
  }

  async findOne(id: number, id_usuarios: number): Promise<RecipeResponse> {
    const requestId = uuidv4();

    const commonLogMetadata = {
      requestId,
      context: RecipeService.name,
      userId: id_usuarios,
    };

    this.logger.log('Iniciando processo de obtenção de uma receita', {
      ...commonLogMetadata,
    });

    try {
      const recipe = await this.recipeRepository.findByUserIdAndId(
        id,
        id_usuarios,
      );

      if (!recipe) {
        this.logger.warn('Tentativa de busca falhou: Receita não encontrada', {
          ...commonLogMetadata,
          recipeId: id,
        });
        throw new NotFoundException('Receita não encontrada');
      }

      this.logger.debug('Consultas de receita no banco de dados', {
        ...commonLogMetadata,
        recipeId: recipe.id,
      });

      return RecipeResponseHttp.toJSON('Receita Obtida com sucesso!', recipe, {
        requestId,
        userId: id_usuarios,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        'Erro inesperado durante o processo de obtenção de receita',
        {
          ...commonLogMetadata,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      );

      throw new InternalServerErrorException();
    }
  }

  async update(dto: UpdateRecipeDto): Promise<RecipeResponse> {
    const requestId = uuidv4();

    const commonLogMetadata = {
      requestId,
      context: RecipeService.name,
      userId: dto.id_usuarios,
    };

    this.logger.log('Iniciando processo de update de uma receita', {
      ...commonLogMetadata,
    });

    try {
      const recipe = await this.recipeRepository.findByUserIdAndId(
        dto.id,
        dto.id_usuarios,
      );

      if (!recipe) {
        this.logger.warn('Tentativa de busca falhou: Receita não encontrada', {
          ...commonLogMetadata,
          recipeId: dto.id,
        });
        throw new NotFoundException('Receita não encontrada');
      }

      this.logger.debug('Consultas de receita no banco de dados', {
        ...commonLogMetadata,
        recipeId: recipe.id,
      });

      const updated = await this.recipeRepository.update({
        id: dto.id,
        id_usuarios: dto.id_usuarios,
        porcoes: dto.porcoes,
        nome: dto.nome,
        ingredientes: dto.ingredientes,
        tempo_preparo_minutos: dto.tempo_preparo_minutos,
        modo_preparo: dto.modo_preparo,
        id_categorias: dto.id_categorias,
      });

      this.logger.debug('Receita modificada no banco de dados', {
        ...commonLogMetadata,
        recipeId: updated.id,
      });

      return RecipeResponseHttp.toJSON(
        'Receita Modificada com sucesso!',
        updated,
        {
          requestId,
          userId: dto.id_usuarios,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        'Erro inesperado durante o processo de update de receita',
        {
          ...commonLogMetadata,
          errorMessage: error.message,
          errorStack: error.stack,
        },
      );

      throw new InternalServerErrorException();
    }
  }

  async delete(id: number, id_usuarios: number): Promise<RecipeResponse> {
    const requestId = uuidv4();

    const commonLogMetadata = {
      requestId,
      context: RecipeService.name,
      userId: id_usuarios,
    };

    this.logger.log('Iniciando processo de delete de uma receita', {
      ...commonLogMetadata,
    });

    try {
      const recipe = await this.recipeRepository.findByUserIdAndId(
        id,
        id_usuarios,
      );

      if (!recipe) {
        this.logger.warn('Tentativa de busca falhou: Receita não encontrada', {
          ...commonLogMetadata,
          recipeId: id,
        });
        throw new NotFoundException('Receita não encontrada');
      }

      this.logger.debug('Consultas de receita no banco de dados', {
        ...commonLogMetadata,
        recipeId: recipe.id,
      });

      await this.recipeRepository.delete(id, id_usuarios);

      this.logger.debug('Receita deletada no banco de dados', {
        ...commonLogMetadata,
        recipeId: recipe.id,
      });

      return RecipeResponseHttp.toJSON(
        'Receita Deletada com sucesso!',
        recipe,
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
        'Erro inesperado durante o processo de update de receita',
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
