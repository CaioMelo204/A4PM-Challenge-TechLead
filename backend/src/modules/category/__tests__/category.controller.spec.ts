import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../category.controller';
import { ICategoryService } from '../interface/category.service.interface';
import { SearchCategoryDto } from '../dto/search.category.dto';
import { TokenDataInterface } from '../../../shared/decorators/token-data.interface';
import { AuthGuard } from '../../auth/guard/auth.guard';
import { CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CategoriesResponseDto } from '../dto/categories.response.dto';
import { CategoryResponseDto } from '../dto/category.response.dto';

const mockCategoryService: ICategoryService = {
  search: jest.fn(),
  findOne: jest.fn(),
};

const mockAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };

const mockTokenData: TokenDataInterface = {
  user_id: 123,
};

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: ICategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: ICategoryService,
          useValue: mockCategoryService,
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<ICategoryService>(ICategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call categoryService.search with query and user ID and return categories', async () => {
      const searchDto: SearchCategoryDto = {
        nome: 'doces',
        page: 1,
        limit: 5,
      };
      const expectedCategoriesResponse: CategoriesResponseDto = {
        data: [{ id: 1, nome: 'Doces' } as any],
        metadata: {},
        links: [],
      } as any;

      jest
        .spyOn(service, 'search')
        .mockResolvedValue(expectedCategoriesResponse);

      const result = await controller.findAll(searchDto, mockTokenData);

      expect(service.search).toHaveBeenCalledWith(
        searchDto,
        mockTokenData.user_id,
      );
      expect(result).toEqual(expectedCategoriesResponse);
    });
  });

  describe('findOne', () => {
    it('should call categoryService.findOne with ID and user ID and return a category', async () => {
      const categoryId = '1';
      const expectedCategoryResponse: CategoryResponseDto = {
        data: { id: 1, nome: 'Salgados' } as any,
        message: 'Category found',
        metadata: {},
        links: [],
      } as any;

      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(expectedCategoryResponse);

      const result = await controller.findOne(categoryId, mockTokenData);

      expect(service.findOne).toHaveBeenCalledWith(
        +categoryId,
        mockTokenData.user_id,
      );
      expect(result).toEqual(expectedCategoryResponse);
    });
  });
});
