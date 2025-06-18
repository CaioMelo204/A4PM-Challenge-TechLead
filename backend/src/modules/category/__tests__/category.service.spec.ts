import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CategoryService } from '../category.service';
import { ICategoryRepository } from '../interface/category.repository.interface';
import { SearchCategoryDto } from '../dto/search.category.dto';
import { CategoriesResponseHttp } from '../http/categories.response.http';
import { CategoryResponseHttp } from '../http/category.response.http';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-request-id'),
}));

const MOCK_DATE = '2025-06-14T10:00:00.000Z';
const originalDate = global.Date;

const mockCategoryRepository: ICategoryRepository = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: ICategoryRepository;

  beforeAll(() => {
    // @ts-ignore
    global.Date = class extends originalDate {
      constructor(date?: string) {
        super(date || MOCK_DATE);
      }
    };
  });

  afterAll(() => {
    global.Date = originalDate;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: ICategoryRepository,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get<ICategoryRepository>(ICategoryRepository);

    jest.spyOn(CategoriesResponseHttp, 'toJSON').mockImplementation(
      (message, categories, pagination, sort, metadata, filters) =>
        ({
          message,
          data: categories,
          pagination,
          sort,
          metadata,
          filters,
          links: [],
        }) as any,
    );
    jest
      .spyOn(CategoryResponseHttp, 'toJSON')
      .mockImplementation((message, category, metadata) => ({
        message,
        data: category,
        metadata,
        links: [],
      }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    const searchDto = {
      limit: 10,
      page: 1,
      order: 'desc',
      nome: 'Sobremesa',
    };
    const userId = 123;
    const mockCategories = [
      { id: 1, nome: 'Doces' },
      { id: 2, nome: 'Bolos' },
    ];
    const mockCount = 2;

    it('should successfully search for categories', async () => {
      jest
        .spyOn(categoryRepository, 'findAll')
        .mockResolvedValue([mockCategories as any, mockCount]);

      const result = await service.search(searchDto as any, userId);

      expect(categoryRepository.findAll).toHaveBeenCalledWith({
        order: searchDto.order,
        limit: searchDto.limit,
        offset: (searchDto.page - 1) * searchDto.limit,
        nome: searchDto.nome,
      });
      expect(CategoriesResponseHttp.toJSON).toHaveBeenCalledWith(
        'categorias buscadas com Sucesso!',
        mockCategories,
        expect.objectContaining({
          current_page: searchDto.page,
          limit: searchDto.limit,
          total_pages: Math.ceil(mockCount / searchDto.limit),
          total_records: mockCount,
        }),
        expect.objectContaining({
          direction: searchDto.order,
          field: 'nome',
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
          message: 'categorias buscadas com Sucesso!',
          data: mockCategories,
        }),
      );
    });

    it('should use default pagination values if not provided', async () => {
      const defaultSearchDto: SearchCategoryDto = { nome: 'Salgados' };
      jest.spyOn(categoryRepository, 'findAll').mockResolvedValue([[], 0]);

      await service.search(defaultSearchDto, userId);

      expect(categoryRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 25,
          offset: 0,
          order: 'desc',
        }),
      );
    });

    it('should throw InternalServerErrorException on repository error during search', async () => {
      jest
        .spyOn(categoryRepository, 'findAll')
        .mockRejectedValue(new Error('DB search error'));

      await expect(service.search(searchDto as any, userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    const categoryId = 1;
    const userId = 123;
    const foundCategory = {
      id: categoryId,
      nome: 'Bebidas',
    };

    it('should successfully find a category by ID', async () => {
      jest
        .spyOn(categoryRepository, 'findOne')
        .mockResolvedValue(foundCategory as any);

      const result = await service.findOne(categoryId, userId);

      expect(categoryRepository.findOne).toHaveBeenCalledWith(categoryId);
      expect(CategoryResponseHttp.toJSON).toHaveBeenCalledWith(
        'Categoria Obtida com sucesso!',
        foundCategory,
        expect.objectContaining({
          requestId: 'mock-request-id',
          userId: userId,
          timestamp: MOCK_DATE,
          version: '1.0.0',
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          message: 'Categoria Obtida com sucesso!',
          data: foundCategory,
        }),
      );
    });

    it('should throw NotFoundException if category is not found', async () => {
      jest.spyOn(categoryRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(categoryId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on repository error during findOne', async () => {
      jest
        .spyOn(categoryRepository, 'findOne')
        .mockRejectedValue(new Error('DB find error'));

      await expect(service.findOne(categoryId, userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
