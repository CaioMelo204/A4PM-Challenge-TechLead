import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../repository/user.repository';
import { User } from '../../../../shared/database/entity/user.entity';
import { ICreateUserRepositoryDto } from '../../dto/create-user.repository.dto';

const mockUserRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
};

describe('UserRepository', () => {
  let repository: UserRepository;
  let typeormRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    typeormRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.spyOn(global, 'Date').mockImplementation(
      () =>
        ({
          toISOString: () => '2025-01-01T00:00:00Z',
        }) as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should save a new user and return it', async () => {
      const createDto: ICreateUserRepositoryDto = {
        nome: 'Test User',
        login: 'test@example.com',
        senha: 'hashedpassword',
      };
      const expectedUser: User = {
        id: 1,
        ...createDto,
        criado_em: new Date('2025-01-01T00:00:00Z'),
        alterado_em: new Date('2025-01-01T00:00:00Z'),
      } as any;

      (typeormRepository.save as jest.Mock).mockResolvedValue(expectedUser);

      const result = await repository.create(createDto);

      expect(typeormRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findById', () => {
    it('should return a user if found by ID', async () => {
      const userId = 1;
      const expectedUser: User = {
        id: userId,
        nome: 'Test User',
        login: 'test@example.com',
        senha: 'hashedpassword',
        criado_em: new Date(),
        alterado_em: new Date(),
      } as any;

      (typeormRepository.findOne as jest.Mock).mockResolvedValue(expectedUser);

      const result = await repository.findById(userId);

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user not found by ID', async () => {
      const userId = 99;

      (typeormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById(userId);

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByLogin', () => {
    it('should return a user if found by login', async () => {
      const userLogin = 'test@example.com';
      const expectedUser: User = {
        id: 1,
        nome: 'Test User',
        login: userLogin,
        senha: 'hashedpassword',
        criado_em: new Date(),
        alterado_em: new Date(),
      } as any;

      (typeormRepository.findOne as jest.Mock).mockResolvedValue(expectedUser);

      const result = await repository.findByLogin(userLogin);

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { login: userLogin },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user not found by login', async () => {
      const userLogin = 'nonexistent@example.com';

      (typeormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findByLogin(userLogin);

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { login: userLogin },
      });
      expect(result).toBeNull();
    });
  });
});
