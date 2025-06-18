import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual } from 'typeorm';
import { RecipeRepository } from '../../repository/recipe.repository';
import { Recipe } from '../../../../shared/database/entity/recipe.entity';
import { CreateRecipeDto } from '../../dto/create-recipe.dto';
import { UpdateRecipeDto } from '../../dto/update-recipe.dto';
import { FindAllRepositoryDto } from '../../dto/find-all.repository.dto';

const MOCK_DATE = '2025-06-14T10:00:00.000Z';
const originalDate = global.Date;

class MockRepository<T> {
  public findAndCount = jest.fn();
  public findOne = jest.fn();
  public save = jest.fn();
  public delete = jest.fn();
}

describe('RecipeRepository', () => {
  let recipeRepository: RecipeRepository;
  let repository: MockRepository<Recipe>;

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
        RecipeRepository,
        {
          provide: getRepositoryToken(Recipe),
          useClass: MockRepository,
        },
      ],
    }).compile();

    recipeRepository = module.get<RecipeRepository>(RecipeRepository);
    repository = module.get<MockRepository<Recipe>>(getRepositoryToken(Recipe));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(recipeRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return recipes and count with default pagination and order', async () => {
      const mockRecipes: Recipe[] = [{ id: 1, nome: 'Test Recipe' } as Recipe];
      const mockCount = 1;
      repository.findAndCount.mockResolvedValue([mockRecipes, mockCount]);

      const dto: FindAllRepositoryDto = { id_usuarios: 1 } as any;
      const result = await recipeRepository.findAll(dto);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { id_usuarios: 1 },
        order: { criado_em: 'desc' },
        take: 25,
        skip: 0,
      });
      expect(result).toEqual([mockRecipes, mockCount]);
    });

    it('should return recipes and count with all filters and custom pagination/order', async () => {
      const mockRecipes: Recipe[] = [
        { id: 1, nome: 'Filtered Recipe' } as Recipe,
      ];
      const mockCount = 1;
      repository.findAndCount.mockResolvedValue([mockRecipes, mockCount]);

      const dto: FindAllRepositoryDto = {
        id_usuarios: 1,
        id_categorias: 10,
        nome: 'search test',
        ingredientes: 'test ingredient',
        porcoes: 5,
        limit: 5,
        offset: 5,
        order: 'asc',
      };
      const result = await recipeRepository.findAll(dto);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          id_categorias: 10,
          nome: Like(`%${dto.nome}%`),
          ingredientes: Like(`%${dto.ingredientes}%`),
          porcoes: 5,
          id_usuarios: 1,
        },
        order: { criado_em: 'asc' },
        take: 5,
        skip: 5,
      });
      expect(result).toEqual([mockRecipes, mockCount]);
    });
  });

  describe('findByUserIdAndId', () => {
    it('should return a recipe if found', async () => {
      const mockRecipe: Recipe = {
        id: 1,
        id_usuarios: 123,
        nome: 'Found Recipe',
      } as Recipe;
      repository.findOne.mockResolvedValue(mockRecipe);

      const result = await recipeRepository.findByUserIdAndId(1, 123);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id_usuarios: 123, id: 1 },
      });
      expect(result).toEqual(mockRecipe);
    });

    it('should return null if recipe is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await recipeRepository.findByUserIdAndId(99, 123);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id_usuarios: 123, id: 99 },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should save and return the new recipe with timestamps', async () => {
      const createDto: CreateRecipeDto = {
        ingredientes: 'test',
        modo_preparo: 'teste modo de preparo',
        tempo_preparo_minutos: 30,
        porcoes: 4,
        nome: 'nova Receita',
        id_usuarios: 123,
        id_categorias: 1,
      };
      const expectedRecipe: Recipe = {
        id: 1,
        ...createDto,
        criado_em: new Date(MOCK_DATE),
        alterado_em: new Date(MOCK_DATE),
      } as Recipe;
      repository.save.mockResolvedValue(expectedRecipe);

      const result = await recipeRepository.create(createDto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createDto,
          criado_em: new Date(MOCK_DATE),
          alterado_em: new Date(MOCK_DATE),
        }),
      );
      expect(result).toEqual(expectedRecipe);
    });
  });

  describe('update', () => {
    it('should save and return the updated recipe with new timestamp', async () => {
      const updateDto: UpdateRecipeDto = {
        id: 1,
        id_usuarios: 123,
        nome: 'Updated Test Receita',
        ingredientes: 'test ingredient',
        modo_preparo: 'step2',
        porcoes: 6,
        tempo_preparo_minutos: 45,
        id_categorias: 2,
      };
      const expectedRecipe: Recipe = {
        id: 1,
        id_usuarios: 123,
        nome: 'Updated Test Receita',
        ingredientes: 'test ingredient',
        modo_preparo: 'step2',
        porcoes: 6,
        tempo_preparo_minutos: 45,
        id_categorias: 2,
        criado_em: new Date('2025-06-13T10:00:00.000Z'),
        alterado_em: new Date(MOCK_DATE),
      } as Recipe;
      repository.save.mockResolvedValue(expectedRecipe);

      const result = await recipeRepository.update(updateDto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updateDto,
          alterado_em: new Date(MOCK_DATE),
        }),
      );
      expect(result).toEqual(expectedRecipe);
    });
  });

  describe('delete', () => {
    it('should delete the recipe by user ID and recipe ID', async () => {
      repository.delete.mockResolvedValue(undefined);

      await recipeRepository.delete(1, 123);

      expect(repository.delete).toHaveBeenCalledWith({
        id_usuarios: 123,
        id: 1,
      });
    });
  });
});
