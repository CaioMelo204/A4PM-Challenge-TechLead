import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/shared/database/entity/user.entity';
import { Category } from '../src/shared/database/entity/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Hashing } from '../src/shared/utils/hashing';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let categoryRepository: Repository<Category>;
  let authToken: string;
  let testUser: User;

  const TEST_USER_EMAIL = 'e2e_category_user@example.com';
  const TEST_USER_PASSWORD = 'e2ePassword123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    categoryRepository = moduleFixture.get<Repository<Category>>(
      getRepositoryToken(Category),
    );

    const passwordHash = await Hashing.hashPassword(TEST_USER_PASSWORD);
    testUser = await userRepository.save({
      login: TEST_USER_EMAIL,
      senha: passwordHash,
      nome: 'test user',
      criado_em: new Date(),
      alterado_em: new Date(),
    });

    const loginDto = { login: TEST_USER_EMAIL, senha: TEST_USER_PASSWORD };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(HttpStatus.OK);

    authToken = response.body.data.accessToken;
  });

  beforeEach(async () => {
    await categoryRepository.query('DELETE FROM categorias');
  });

  afterAll(async () => {
    await userRepository.query('DELETE FROM usuarios');
    await app.close();
  });

  describe('GET /category', () => {
    it('should return a list of categories for an authenticated user', async () => {
      await categoryRepository.save([{ nome: 'Salgados' }, { nome: 'Doces' }]);

      const response = await request(app.getHttpServer())
        .get('/category')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.message).toEqual('categorias buscadas com Sucesso!');
      expect(response.body.data.length).toEqual(2);
      expect(response.body.metadata.userId).toEqual(testUser.id);
    });

    it('should return an empty list if no categories exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/category')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);
      expect(response.body.data.length).toEqual(0);
      expect(response.body.message).toEqual('categorias buscadas com Sucesso!');
    });

    it('should filter categories by name using query param', async () => {
      await categoryRepository.save([
        { nome: 'Bolo de Chocolate' },
        { nome: 'Bolo de Fubá' },
        { nome: 'Torta de Limão' },
      ]);

      const response = await request(app.getHttpServer())
        .get('/category?nome=Bolo')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);
      expect(response.body.data.length).toEqual(2);
    });

    it('should return 401 Unauthorized if no token is provided', async () => {
      await request(app.getHttpServer())
        .get('/category')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /category/:id', () => {
    let createdCategory: Category;

    beforeEach(async () => {
      createdCategory = await categoryRepository.save({ nome: 'Massas' });
    });

    it('should return a category by ID for an authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/category/${createdCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.message).toEqual('Categoria Obtida com sucesso!');
      expect(response.body.data).toEqual({
        id: createdCategory.id,
        nome: createdCategory.nome,
      });
      expect(response.body.metadata.userId).toEqual(testUser.id);
    });

    it('should return 404 Not Found if category does not exist', async () => {
      const nonExistentId = 9999;
      const response = await request(app.getHttpServer())
        .get(`/category/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toEqual('Categoria não encontrada');
      expect(response.body.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });

    it('should return 401 Unauthorized if no token is provided', async () => {
      await request(app.getHttpServer())
        .get(`/category/${createdCategory.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
