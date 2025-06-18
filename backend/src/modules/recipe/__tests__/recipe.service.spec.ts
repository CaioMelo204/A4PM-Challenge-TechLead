import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RecipeService } from '../recipe.service';
import { IRecipeRepository } from '../interface/recipe.repository.interface';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';
import { SearchRecipeDto } from '../dto/search-recipe.dto';
import { RecipeResponseHttp } from '../http/recipe.response.http';
import { RecipesReponseHttp } from '../http/recipes.response.http';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-request-id'),
}));

const MOCK_DATE = '2025-06-14T10:00:00.000Z';
const originalDate = global.Date;

const mockRecipeRepository: IRecipeRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByUserIdAndId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('RecipeService', () => {
  let service: RecipeService;
  let recipeRepository: IRecipeRepository;

  beforeAll(() => {
    // @ts-ignore
    global.Date = class extends originalDate {
      constructor(date?: string) {
        super(date || MOCK_DATE);
      }
      toISOString() {
        return MOCK_DATE;
      }
    };
  });

  afterAll(() => {
    global.Date = originalDate;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeService,
        {
          provide: IRecipeRepository,
          useValue: mockRecipeRepository,
        },
      ],
    }).compile();

    service = module.get<RecipeService>(RecipeService);
    recipeRepository = module.get<IRecipeRepository>(IRecipeRepository);

    jest
      .spyOn(RecipeResponseHttp, 'toJSON')
      .mockImplementation((message, recipe, metadata) => ({
        message,
        data: recipe,
        metadata,
        links: [],
      }));
    jest.spyOn(RecipesReponseHttp, 'toJSON').mockImplementation(
      (message, recipes, pagination, sort, metadata, filters) =>
        ({
          message,
          data: recipes,
          pagination,
          sort,
          metadata,
          filters,
          links: [],
        }) as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateRecipeDto = {
      nome: 'Bolo de Chocolate',
      id_usuarios: 123,
      porcoes: 8,
      tempo_preparo_minutos: 60,
      modo_preparo: 'Misture tudo e asse',
      ingredientes: 'Farinha, Chocolate',
      id_categorias: 1,
    };

    const createdRecipe = {
      id: 1,
      ...createDto,
    };

    it('should successfully create a recipe', async () => {
      jest
        .spyOn(recipeRepository, 'create')
        .mockResolvedValue(createdRecipe as any);

      const result = await service.create(createDto);

      expect(recipeRepository.create).toHaveBeenCalledWith(createDto);
      expect(RecipeResponseHttp.toJSON).toHaveBeenCalledWith(
        'Receita criada com sucesso!',
        createdRecipe,
        expect.objectContaining({
          requestId: 'mock-request-id',
          userId: createDto.id_usuarios,
          timestamp: MOCK_DATE,
          version: '1.0.0',
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          message: 'Receita criada com sucesso!',
          data: createdRecipe,
        }),
      );
    });

    it('should throw InternalServerErrorException on repository error during creation', async () => {
      jest
        .spyOn(recipeRepository, 'create')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('search', () => {
    const searchDto = {
      limit: 10,
      page: 1,
      order: 'desc',
      nome: 'Bolo',
    };
    const userId = 123;
    const mockRecipes = [{ id: 1, nome: 'Bolo de Fubá', id_usuarios: userId }];
    const mockCount = 1;

    it('should successfully search for recipes', async () => {
      jest
        .spyOn(recipeRepository, 'findAll')
        .mockResolvedValue([mockRecipes as any, mockCount]);

      const result = await service.search(searchDto as any, userId);

      expect(recipeRepository.findAll).toHaveBeenCalledWith({
        order: searchDto.order,
        id_usuarios: userId,
        limit: searchDto.limit,
        offset: (searchDto.page - 1) * searchDto.limit,
        porcoes: undefined,
        nome: searchDto.nome,
        ingredientes: undefined,
      });
      expect(RecipesReponseHttp.toJSON).toHaveBeenCalledWith(
        'receitas buscadas com Sucesso!',
        mockRecipes,
        expect.objectContaining({
          current_page: searchDto.page,
          limit: searchDto.limit,
          total_pages: Math.ceil(mockCount / searchDto.limit),
          total_records: mockCount,
        }),
        expect.objectContaining({
          direction: searchDto.order,
          field: 'criado_em',
        }),
        expect.objectContaining({
          requestId: 'mock-request-id',
          userId: userId,
          timestamp: MOCK_DATE,
          version: '1.0.0',
        }),
        expect.objectContaining({
          nome: searchDto.nome,
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          message: 'receitas buscadas com Sucesso!',
          data: mockRecipes,
        }),
      );
    });

    it('should use default pagination values if not provided', async () => {
      const defaultSearchDto: SearchRecipeDto = { nome: 'Pão' };
      jest.spyOn(recipeRepository, 'findAll').mockResolvedValue([[], 0]);

      await service.search(defaultSearchDto, userId);

      expect(recipeRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 25,
          offset: 0,
          order: 'desc',
        }),
      );
    });

    it('should throw InternalServerErrorException on repository error during search', async () => {
      jest
        .spyOn(recipeRepository, 'findAll')
        .mockRejectedValue(new Error('DB search error'));

      await expect(service.search(searchDto as any, userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    const recipeId = 1;
    const userId = 123;
    const foundRecipe = {
      id: recipeId,
      nome: 'Bolo de Banana',
      id_usuarios: userId,
      descricao: 'Receita simples',
    };

    it('should successfully find a recipe by ID', async () => {
      jest
        .spyOn(recipeRepository, 'findByUserIdAndId')
        .mockResolvedValue(foundRecipe as any);

      const result = await service.findOne(recipeId, userId);

      expect(recipeRepository.findByUserIdAndId).toHaveBeenCalledWith(
        recipeId,
        userId,
      );
      expect(RecipeResponseHttp.toJSON).toHaveBeenCalledWith(
        'Receita Obtida com sucesso!',
        foundRecipe,
        expect.objectContaining({
          requestId: 'mock-request-id',
          userId: userId,
          timestamp: MOCK_DATE,
          version: '1.0.0',
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          message: 'Receita Obtida com sucesso!',
          data: foundRecipe,
        }),
      );
    });

    it('should throw NotFoundException if recipe is not found', async () => {
      jest.spyOn(recipeRepository, 'findByUserIdAndId').mockResolvedValue(null);

      await expect(service.findOne(recipeId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on repository error during findOne', async () => {
      jest
        .spyOn(recipeRepository, 'findByUserIdAndId')
        .mockRejectedValue(new Error('DB find error'));

      await expect(service.findOne(recipeId, userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const updateDto: UpdateRecipeDto = {
      id: 1,
      id_usuarios: 123,
      nome: 'Bolo de Cenoura',
      porcoes: 10,
    };
    const existingRecipe = {
      id: updateDto.id,
      nome: 'Bolo Antigo',
      id_usuarios: updateDto.id_usuarios,
      descricao: 'desc antiga',
    };
    const updatedRecipe = {
      ...existingRecipe,
      nome: updateDto.nome,
      porcoes: updateDto.porcoes,
    };

    it('should successfully update a recipe', async () => {
      jest
        .spyOn(recipeRepository, 'findByUserIdAndId')
        .mockResolvedValue(existingRecipe as any);
      jest
        .spyOn(recipeRepository, 'update')
        .mockResolvedValue(updatedRecipe as any);

      const result = await service.update(updateDto);

      expect(recipeRepository.findByUserIdAndId).toHaveBeenCalledWith(
        updateDto.id,
        updateDto.id_usuarios,
      );
      expect(recipeRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: updateDto.id,
          id_usuarios: updateDto.id_usuarios,
          nome: updateDto.nome,
          porcoes: updateDto.porcoes,
        }),
      );
      expect(RecipeResponseHttp.toJSON).toHaveBeenCalledWith(
        'Receita Modificada com sucesso!',
        updatedRecipe,
        expect.objectContaining({
          requestId: 'mock-request-id',
          userId: updateDto.id_usuarios,
          timestamp: MOCK_DATE,
          version: '1.0.0',
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          message: 'Receita Modificada com sucesso!',
          data: updatedRecipe,
        }),
      );
    });

    it('should throw NotFoundException if recipe to update is not found', async () => {
      jest.spyOn(recipeRepository, 'findByUserIdAndId').mockResolvedValue(null);

      await expect(service.update(updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on repository error during update', async () => {
      jest
        .spyOn(recipeRepository, 'findByUserIdAndId')
        .mockResolvedValue(existingRecipe as any);
      jest
        .spyOn(recipeRepository, 'update')
        .mockRejectedValue(new Error('DB update error'));

      await expect(service.update(updateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('delete', () => {
    const recipeId = 1;
    const userId = 123;
    const existingRecipe = {
      id: recipeId,
      nome: 'Receita a Deletar',
      id_usuarios: userId,
      descricao: 'desc',
    };

    it('should successfully delete a recipe', async () => {
      jest
        .spyOn(recipeRepository, 'findByUserIdAndId')
        .mockResolvedValue(existingRecipe as any);
      jest.spyOn(recipeRepository, 'delete').mockResolvedValue(undefined);

      const result = await service.delete(recipeId, userId);

      expect(recipeRepository.findByUserIdAndId).toHaveBeenCalledWith(
        recipeId,
        userId,
      );
      expect(recipeRepository.delete).toHaveBeenCalledWith(recipeId, userId);
      expect(RecipeResponseHttp.toJSON).toHaveBeenCalledWith(
        'Receita Deletada com sucesso!',
        existingRecipe,
        expect.objectContaining({
          requestId: 'mock-request-id',
          userId: userId,
          timestamp: MOCK_DATE,
          version: '1.0.0',
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          message: 'Receita Deletada com sucesso!',
          data: existingRecipe,
        }),
      );
    });

    it('should throw NotFoundException if recipe to delete is not found', async () => {
      jest.spyOn(recipeRepository, 'findByUserIdAndId').mockResolvedValue(null);

      await expect(service.delete(recipeId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on repository error during delete', async () => {
      jest
        .spyOn(recipeRepository, 'findByUserIdAndId')
        .mockResolvedValue(existingRecipe as any);
      jest
        .spyOn(recipeRepository, 'delete')
        .mockRejectedValue(new Error('DB delete error'));

      await expect(service.delete(recipeId, userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
