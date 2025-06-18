import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { IUserRepository } from '../interface/user.repository.interface';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { Hashing } from '../../../shared/utils/hashing';

jest.mock('../../../shared/utils/hashing', () => ({
  Hashing: {
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
  },
}));

const mockUserRepository = {
  findByLogin: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: IUserRepository;
  let jwtService: JwtService;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: IUserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        Logger,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<IUserRepository>(IUserRepository);
    jwtService = module.get<JwtService>(JwtService);
    logger = module.get<Logger>(Logger);

    jest.spyOn(logger, 'log').mockImplementation(() => {});
    jest.spyOn(logger, 'debug').mockImplementation(() => {});
    jest.spyOn(logger, 'warn').mockImplementation(() => {});
    jest.spyOn(logger, 'error').mockImplementation(() => {});
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

  describe('login', () => {
    const loginDto: LoginDto = {
      login: 'test@example.com',
      senha: 'password123',
    };
    const mockUser = {
      id: 'user-id-123',
      login: 'test@example.com',
      senha: 'hashedpassword',
      nome: 'Test User',
      criado_em: new Date(),
    };
    const mockAccessToken = 'mockedAccessToken';

    it('should successfully log in a user and return an access token', async () => {
      (userRepository.findByLogin as jest.Mock).mockResolvedValue(mockUser);
      (Hashing.comparePassword as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue(mockAccessToken);

      const result = await service.login(loginDto);

      expect(userRepository.findByLogin).toHaveBeenCalledWith(loginDto.login);
      expect(Hashing.comparePassword).toHaveBeenCalledWith(
        mockUser.senha,
        loginDto.senha,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        user_id: mockUser.id,
      });
      expect(result.data.accessToken).toEqual(mockAccessToken);
      expect(result.message).toEqual('Login bem-sucedido!');
      expect(result.metadata.userId).toEqual(mockUser.id);
    });

    it('should throw NotFoundException if user is not found', async () => {
      (userRepository.findByLogin as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if password is invalid', async () => {
      (userRepository.findByLogin as jest.Mock).mockResolvedValue(mockUser);
      (Hashing.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      nome: 'New User',
      login: 'newuser@example.com',
      senha: 'newpassword123',
    };
    const mockCreatedUser = {
      id: 'new-user-id-456',
      login: 'newuser@example.com',
      nome: 'New User',
      senha: 'newhashedpassword',
      criado_em: new Date(),
    };

    it('should successfully register a new user', async () => {
      (userRepository.findByLogin as jest.Mock).mockResolvedValue(null);
      (Hashing.hashPassword as jest.Mock).mockResolvedValue(
        'newhashedpassword',
      );
      (userRepository.create as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await service.register(registerDto);

      expect(userRepository.findByLogin).toHaveBeenCalledWith(
        registerDto.login,
      );
      expect(Hashing.hashPassword).toHaveBeenCalledWith(registerDto.senha);
      expect(userRepository.create).toHaveBeenCalledWith({
        login: registerDto.login,
        nome: registerDto.nome,
        senha: 'newhashedpassword',
      });
      expect(result.data.id).toEqual(mockCreatedUser.id);
      expect(result.message).toEqual('Usuário registrado com sucesso!');
      expect(result.metadata.userId).toEqual(mockCreatedUser.id);
    });

    it('should throw ConflictException if login already exists', async () => {
      (userRepository.findByLogin as jest.Mock).mockResolvedValue(
        mockCreatedUser,
      );

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
