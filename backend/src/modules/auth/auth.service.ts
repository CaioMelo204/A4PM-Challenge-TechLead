import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IAuthService } from './interface/auth.service.interface';
import { IUserRepository } from './interface/user.repository.interface';
import { IRegisterResponseDto, RegisterDto } from './dto/register.dto';
import { Hashing } from '../../shared/utils/hashing';
import { ILoginResponseDto, LoginDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name, {
    timestamp: true,
  });

  constructor(
    private readonly userRepository: IUserRepository,
    private jwtService: JwtService,
  ) {}

  async login({ login, senha }: LoginDto): Promise<ILoginResponseDto> {
    const requestId = uuidv4();

    this.logger.log('Iniciando processo de login', {
      requestId,
      context: AuthService.name,
      inputLoginIdentifier: login.substring(0, 3),
    });

    try {
      const user = await this.userRepository.findByLogin(login);

      this.logger.debug('Consulta de usuário no banco de dados', {
        requestId,
        context: AuthService.name,
        userFound: !!user,
        userId: user ? user.id : 'N/A',
      });

      if (!user) {
        this.logger.warn('Tentativa de login falhou: Usuário não encontrado', {
          requestId,
          context: AuthService.name,
          inputLoginIdentifier: login.substring(0, 3) + '...',
        });
        throw new NotFoundException('User not found');
      }

      const passwordIsValid = await Hashing.comparePassword(user.senha, senha);

      this.logger.debug('Verificação de senha concluída', {
        requestId,
        context: AuthService.name,
        userId: user.id,
        passwordCheckStatus: passwordIsValid ? 'SUCCESS' : 'FAILED',
      });

      if (!passwordIsValid) {
        this.logger.warn(
          'Tentativa de login falhou: Senha inválida para o usuário',
          {
            requestId,
            context: AuthService.name,
            userId: user.id,
            inputLoginIdentifier: login.substring(0, 3) + '...',
          },
        );
        throw new NotFoundException('User not found');
      }

      const accessToken = await this.jwtService.signAsync({
        user_id: user.id,
      });

      this.logger.log('Token JWT gerado com sucesso', {
        requestId,
        context: AuthService.name,
        userId: user.id,
      });

      const response: ILoginResponseDto = {
        data: {
          accessToken: accessToken,
        },
        message: 'Login bem-sucedido!',
        metadata: {
          requestId: requestId,
          timestamp: new Date().toISOString(),
          userId: user.id,
          version: '1.0.0',
        },
      };

      this.logger.log('Login de usuário concluído com sucesso', {
        requestId,
        context: AuthService.name,
        userId: user.id,
      });

      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Erro inesperado durante o processo de login', {
        requestId,
        context: AuthService.name,
        inputLoginIdentifier: login.substring(0, 3) + '...',
        errorMessage: error.message,
        errorStack: error.stack,
      });
      throw new InternalServerErrorException();
    }
  }

  async register({
    senha,
    nome,
    login,
  }: RegisterDto): Promise<IRegisterResponseDto> {
    const requestId = uuidv4();

    this.logger.log('Iniciando processo de registro de usuário', {
      requestId,
      context: AuthService.name,
      inputLoginIdentifier: login.substring(0, 3) + '...',
      inputUserNameIdentifier: nome.substring(0, 3) + '...',
    });

    try {
      const existingUser = await this.userRepository.findByLogin(login);

      this.logger.debug('Verificação de login existente no DB', {
        requestId,
        context: AuthService.name,
        loginExists: !!existingUser,
        existingUserId: existingUser ? existingUser.id : 'N/A',
      });

      if (existingUser) {
        this.logger.warn('Tentativa de registro falhou: Login já existe', {
          requestId,
          context: AuthService.name,
          inputLoginIdentifier: login.substring(0, 3) + '...',
          existingUserId: existingUser.id,
        });
        throw new ConflictException('Login already exists');
      }

      const hashedPassword = await Hashing.hashPassword(senha);
      this.logger.debug('Senha hasheada com sucesso', {
        requestId,
        context: AuthService.name,
      });

      const newUser = await this.userRepository.create({
        login,
        nome,
        senha: hashedPassword,
      });

      this.logger.log('Novo usuário criado no banco de dados', {
        requestId,
        context: AuthService.name,
        newUserId: newUser.id,
        newUserLogin: newUser.login,
      });

      const response: IRegisterResponseDto = {
        data: {
          id: newUser.id,
          nome: String(newUser.nome),
          login: newUser.login,
          criado_em: new Date(newUser.criado_em).toISOString(),
        },
        message: 'Usuário registrado com sucesso!',
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          userId: newUser.id,
          version: '1.0.0',
        },
      };

      this.logger.log('Registro de usuário concluído com sucesso', {
        requestId,
        context: AuthService.name,
        userId: newUser.id,
      });

      return response;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      this.logger.error('Erro inesperado durante o processo de registro', {
        requestId,
        context: AuthService.name,
        inputLoginIdentifier: login.substring(0, 3) + '...',
        inputUserNameIdentifier: nome.substring(0, 3) + '...',
        errorMessage: error.message,
        errorStack: error.stack,
      });
      throw new InternalServerErrorException();
    }
  }
}
