import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { IAuthService } from '../interface/auth.service.interface';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: IAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: IAuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<IAuthService>(IAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call authService.login and return its result', async () => {
      const loginDto: LoginDto = {
        login: 'testuser@example.com',
        senha: 'password123',
      };

      const expectedLoginResponse = {
        data: { accessToken: 'mockedAccessToken' },
        message: 'Login bem-sucedido!',
        metadata: { requestId: '123', timestamp: '2025-01-01T00:00:00Z' },
      };

      (authService.login as jest.Mock).mockResolvedValue(expectedLoginResponse);

      const result = await authController.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);

      expect(result).toEqual(expectedLoginResponse);
    });

    it('should throw an error if authService.login throws an error', async () => {
      const loginDto: LoginDto = {
        login: 'invalid@example.com',
        senha: 'wrongpassword',
      };
      const expectedError = new Error('Invalid credentials');

      (authService.login as jest.Mock).mockRejectedValue(expectedError);

      await expect(authController.login(loginDto)).rejects.toThrow(
        expectedError,
      );

      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('register', () => {
    it('should call authService.register and return its result', async () => {
      const registerDto: RegisterDto = {
        nome: 'Teste User',
        login: 'newuser@example.com',
        senha: 'newpassword123',
      };

      const expectedRegisterResponse = {
        data: {
          id: 'newUserId',
          nome: 'Teste User',
          login: 'newuser@example.com',
          criado_em: '2025-01-01T00:00:00Z',
        },
        message: 'Usuário registrado com sucesso!',
        metadata: { requestId: '456', timestamp: '2025-01-01T00:00:00Z' },
      };

      (authService.register as jest.Mock).mockResolvedValue(
        expectedRegisterResponse,
      );

      const result = await authController.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);

      expect(result).toEqual(expectedRegisterResponse);
    });

    it('should throw an error if authService.register throws an error', async () => {
      const registerDto: RegisterDto = {
        nome: 'Existing User',
        login: 'existing@example.com',
        senha: 'somepassword',
      };
      const expectedError = new Error('Login already exists');

      (authService.register as jest.Mock).mockRejectedValue(expectedError);

      await expect(authController.register(registerDto)).rejects.toThrow(
        expectedError,
      );

      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });
});
