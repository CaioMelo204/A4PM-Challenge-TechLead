import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../../guard/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { IEnvConfigService } from '../../../../shared/config/interface/env-config.service.interface';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { IUserRepository } from '../../interface/user.repository.interface';

const mockConfigService = {
  getJwtSecret: jest.fn(),
};

const mockUserRepository = {
  findById: jest.fn(),
};

const mockJwtService = {
  verifyAsync: jest.fn(),
};

const mockRequest = (headers: Record<string, any> = {}) =>
  ({
    headers,
  }) as Request;

const createMockContext = (request: Request): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getArgByIndex: jest.fn(),
  } as any;
};

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let configService: IEnvConfigService;
  let userRepository: IUserRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: IEnvConfigService,
          useValue: mockConfigService,
        },
        {
          provide: IUserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    configService = module.get<IEnvConfigService>(IEnvConfigService);
    userRepository = module.get<IUserRepository>(IUserRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true and set user if token is valid and user exists', async () => {
      const token = 'valid-token';
      const secret = 'jwt-secret';
      const userIdFromToken = { user_id: '123' };
      const request = mockRequest({ authorization: `Bearer ${token}` });
      const context = createMockContext(request);

      (configService.getJwtSecret as jest.Mock).mockReturnValue(secret);
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(userIdFromToken);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(configService.getJwtSecret).toHaveBeenCalled();
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, { secret });
      expect(request['user']).toEqual({
        user_id: '123',
      });
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      const request = mockRequest({});
      const context = createMockContext(request);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(configService.getJwtSecret).not.toHaveBeenCalled();
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if token type is not Bearer', async () => {
      const request = mockRequest({ authorization: 'Basic some-token' });
      const context = createMockContext(request);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(configService.getJwtSecret).not.toHaveBeenCalled();
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const token = 'invalid-token';
      const secret = 'jwt-secret';
      const request = mockRequest({ authorization: `Bearer ${token}` });
      const context = createMockContext(request);

      (configService.getJwtSecret as jest.Mock).mockReturnValue(secret);
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('Invalid signature'),
      );

      await expect(guard.canActivate(context)).rejects.toThrow(Error);
      expect(configService.getJwtSecret).toHaveBeenCalled();
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, { secret });
      expect(userRepository.findById).not.toHaveBeenCalled();
      expect(request['user']).toBeUndefined();
    });
  });
});
