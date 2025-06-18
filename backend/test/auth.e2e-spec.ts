import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/shared/database/entity/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RegisterDto } from '../src/modules/auth/dto/register.dto';
import { Hashing } from '../src/shared/utils/hashing';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  beforeEach(async () => {
    // Clear the database before each test
    await userRepository.query('DELETE FROM usuarios');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterDto = {
        login: 'newuser@example.com',
        senha: 'Password123!',
        nome: 'newuser',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      const userInDb = await userRepository.findOneBy({
        login: registerDto.login,
      });
      expect(userInDb).toBeDefined();
    });

    it('should return 400 if email already registered', async () => {
      const existingEmail = 'existing@example.com';
      const passwordHash = await Hashing.hashPassword('OldPassword123');
      await userRepository.save({
        login: existingEmail,
        senha: passwordHash,
        nome: 'existing',
        criado_em: new Date(),
        alterado_em: new Date(),
      });

      const registerDto = {
        login: existingEmail,
        senha: 'NewPassword123!',
        nome: 'newuser',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toEqual('Login already exists');
    });
  });

  describe('/auth/login (POST)', () => {
    const userPassword = 'TestPassword123!';
    let registeredUser: User;

    beforeEach(async () => {
      const login = 'loginuser@example.com';
      const passwordHash = await Hashing.hashPassword(userPassword);
      registeredUser = await userRepository.save({
        login,
        senha: passwordHash,
        nome: 'existing',
        criado_em: new Date(),
        alterado_em: new Date(),
      });
    });

    it('should successfully log in an existing user and return a token', async () => {
      const loginDto = { login: registeredUser.login, senha: userPassword };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          data: {
            accessToken: expect.any(String),
          },
        }),
      );
    });

    it('should return 401 for invalid credentials (wrong password)', async () => {
      const loginDto = { login: registeredUser.login, senha: 'WrongPassword!' };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual('User not found');
    });

    it('should return 401 for invalid credentials (non-existent email)', async () => {
      const loginDto = {
        login: 'nonexistent@example.com',
        senha: 'AnyPassword!',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual('User not found');
    });
  });
});
