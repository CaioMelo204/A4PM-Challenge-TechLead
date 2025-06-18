import { Test, TestingModule } from '@nestjs/testing';
import { RecipeController } from '../recipe.controller';
import { IRecipeService } from '../interface/recipe.service.interface';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';
import { SearchRecipeDto } from '../dto/search-recipe.dto';
import { RecipeResponse } from '../dto/recipe.response.dto';
import { RecipesResponseDto } from '../dto/recipes.response.dto';
import { TokenDataInterface } from '../../../shared/decorators/token-data.interface';
import { AuthGuard } from '../../auth/guard/auth.guard';
import { CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const mockRecipeService: IRecipeService = {
  create: jest.fn(),
  search: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };

const mockTokenData: TokenDataInterface = {
  user_id: 123,
};

describe('RecipeController', () => {
  let controller: RecipeController;
  let service: IRecipeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeController],
      providers: [
        {
          provide: IRecipeService,
          useValue: mockRecipeService,
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<RecipeController>(RecipeController);
    service = module.get<IRecipeService>(IRecipeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call recipeService.create with correct data and return the recipe', async () => {
      const createDto: CreateRecipeDto = {
        nome: 'teste',
        modo_preparo: 'teste modo de preparo',
        ingredientes: 'teste ingredientes',
      } as any;
      const expectedRecipeResponse: RecipeResponse = {
        id: 1,
        name: 'Bolo de Chocolate',
        modo_preparo: 'teste modo de preparo',
        id_usuarios: mockTokenData.user_id,
      } as any;

      jest.spyOn(service, 'create').mockResolvedValue(expectedRecipeResponse);

      const result = await controller.create(createDto, mockTokenData);

      expect(service.create).toHaveBeenCalledWith({
        ...createDto,
        id_usuarios: mockTokenData.user_id,
      });
      expect(result).toEqual(expectedRecipeResponse);
    });
  });

  describe('findAll', () => {
    it('should call recipeService.search with query and user ID and return recipes', async () => {
      const searchDto: SearchRecipeDto = {
        nome: 'bolo',
        page: 1,
        limit: 10,
      };
      const expectedRecipesResponse: RecipesResponseDto = {
        data: [
          {
            id: 1,
            nome: 'Bolo de Chocolate',
            modo_preparo: 'teste',
            id_usuarios: mockTokenData.user_id,
          },
        ],
        metadata: {},
        links: {},
      } as any;

      jest.spyOn(service, 'search').mockResolvedValue(expectedRecipesResponse);

      const result = await controller.findAll(searchDto, mockTokenData);

      expect(service.search).toHaveBeenCalledWith(
        searchDto,
        mockTokenData.user_id,
      );
      expect(result).toEqual(expectedRecipesResponse);
    });
  });

  describe('findOne', () => {
    it('should call recipeService.findOne with ID and user ID and return a recipe', async () => {
      const recipeId = '1';
      const expectedRecipeResponse: RecipeResponse = {
        id: 1,
        nome: 'Bolo de Chocolate',
        modo_preparo: 'teste modo de preparo',
        id_usuarios: mockTokenData.user_id,
      } as any;

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedRecipeResponse);

      const result = await controller.findOne(recipeId, mockTokenData);

      expect(service.findOne).toHaveBeenCalledWith(
        +recipeId,
        mockTokenData.user_id,
      );
      expect(result).toEqual(expectedRecipeResponse);
    });
  });

  describe('update', () => {
    it('should call recipeService.update with ID, DTO, and user ID and return the updated recipe', async () => {
      const recipeId = '1';
      const updateDto: UpdateRecipeDto = {
        nome: 'Bolo de Cenoura',
      } as any;
      const expectedRecipeResponse: RecipeResponse = {
        id: 1,
        nome: 'Bolo de Cenoura',
        modo_preparo: 'teste modo de preparo',
        id_usuarios: mockTokenData.user_id,
      } as any;

      jest.spyOn(service, 'update').mockResolvedValue(expectedRecipeResponse);

      const result = await controller.update(
        recipeId,
        updateDto,
        mockTokenData,
      );

      expect(service.update).toHaveBeenCalledWith({
        ...updateDto,
        id: +recipeId,
        id_usuarios: mockTokenData.user_id,
      });
      expect(result).toEqual(expectedRecipeResponse);
    });
  });

  describe('remove', () => {
    it('should call recipeService.delete with ID and user ID and return the deleted recipe', async () => {
      const recipeId = '1';
      const expectedRecipeResponse: RecipeResponse = {
        id: 1,
        nome: 'Bolo de Cenoura',
        modo_preparo: 'teste modo de preparo',
        id_usuarios: mockTokenData.user_id,
      } as any;

      jest.spyOn(service, 'delete').mockResolvedValue(expectedRecipeResponse);

      const result = await controller.remove(recipeId, mockTokenData);

      expect(service.delete).toHaveBeenCalledWith(
        +recipeId,
        mockTokenData.user_id,
      );
      expect(result).toEqual(expectedRecipeResponse);
    });
  });
});
