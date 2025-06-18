import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Like } from 'typeorm';
import { CategoryRepository } from '../../repository/category.repository';
import { Category } from '../../../../shared/database/entity/category.entity';
import { FindAllCategoryRepositoryDto } from '../../dto/find-all.category.repository.dto';

class MockRepository<T> {
  public findAndCount = jest.fn();
  public findOne = jest.fn();
}

describe('CategoryRepository', () => {
  let categoryRepository: CategoryRepository;
  let repository: MockRepository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryRepository,
        {
          provide: getRepositoryToken(Category),
          useClass: MockRepository,
        },
      ],
    }).compile();

    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
    repository = module.get<MockRepository<Category>>(
      getRepositoryToken(Category),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(categoryRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return categories and count with default parameters', async () => {
      const mockCategories: Category[] = [
        { id: 1, nome: 'Category A' } as Category,
      ];
      const mockCount = 1;
      repository.findAndCount.mockResolvedValue([mockCategories, mockCount]);

      const dto: FindAllCategoryRepositoryDto = {
        offset: 0,
        limit: 10,
        order: 'desc',
      };
      const result = await categoryRepository.findAll(dto);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { nome: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual([mockCategories, mockCount]);
    });

    it('should return categories and count with name filter and custom order', async () => {
      const mockCategories: Category[] = [
        { id: 1, nome: 'Filtered Category' } as Category,
      ];
      const mockCount = 1;
      repository.findAndCount.mockResolvedValue([mockCategories, mockCount]);

      const dto: FindAllCategoryRepositoryDto = {
        offset: 5,
        limit: 20,
        nome: 'Filtered',
        order: 'asc',
      };
      const result = await categoryRepository.findAll(dto);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { nome: Like(`%${dto.nome}%`) },
        order: { nome: 'asc' },
        skip: 5,
        take: 20,
      });
      expect(result).toEqual([mockCategories, mockCount]);
    });
  });

  describe('findOne', () => {
    it('should return a category if found', async () => {
      const mockCategory: Category = {
        id: 1,
        nome: 'Found Category',
      } as Category;
      repository.findOne.mockResolvedValue(mockCategory);

      const result = await categoryRepository.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should return null if category is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await categoryRepository.findOne(999);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });
  });
});
