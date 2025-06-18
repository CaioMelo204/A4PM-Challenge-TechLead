import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/shared/database/entity/user.entity';
import { Recipe } from '../src/shared/database/entity/recipe.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Hashing } from '../src/shared/utils/hashing';

describe('RecipeController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let recipeRepository: Repository<Recipe>;
  let authToken: string;
  let testUser: User;
  let anotherUser: User;

  const TEST_USER_EMAIL = 'e2e_recipe_user@example.com';
  const TEST_USER_PASSWORD = 'e2eRecipePassword123!';
  const ANOTHER_USER_EMAIL = 'e2e_another_user@example.com';
  const ANOTHER_USER_PASSWORD = 'anotherRecipePassword123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    recipeRepository = moduleFixture.get<Repository<Recipe>>(
      getRepositoryToken(Recipe),
    );

    const passwordHash = await Hashing.hashPassword(TEST_USER_PASSWORD);
    testUser = await userRepository.save({
      login: TEST_USER_EMAIL,
      senha: passwordHash,
      nome: 'test user',
      criado_em: new Date(),
      alterado_em: new Date(),
    });

    const anotherPasswordHash = await Hashing.hashPassword(
      ANOTHER_USER_PASSWORD,
    );
    anotherUser = await userRepository.save({
      login: ANOTHER_USER_EMAIL,
      senha: anotherPasswordHash,
      nome: 'test anotherUser',
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
    await recipeRepository.query('DELETE FROM receitas');
  });

  afterAll(async () => {
    await recipeRepository.query('DELETE FROM receitas');
    await userRepository.query('DELETE FROM usuarios');
    await app.close();
  });

  describe('POST /recipe', () => {
    const createRecipeDto = {
      nome: 'Bolo de Aniversário',
      descricao: 'Um bolo simples e gostoso',
      porcoes: 8,
      tempo_preparo_minutos: 60,
      modo_preparo: 'Misture e asse.',
      ingredientes: ['farinha', 'açúcar', 'ovos'],
    };

    it('should create a new recipe for an authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .post('/recipe')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createRecipeDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.message).toEqual('Receita criada com sucesso!');
      expect(response.body.data).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          nome: createRecipeDto.nome,
          id_usuarios: testUser.id,
        }),
      );

      const recipeInDb = await recipeRepository.findOneBy({
        id: response.body.data.id,
      });
      expect(recipeInDb).toBeDefined();
      expect(recipeInDb?.id_usuarios).toEqual(testUser.id);
    });

    it('should return 401 Unauthorized if no token is provided', async () => {
      await request(app.getHttpServer())
        .post('/recipe')
        .send(createRecipeDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /recipe', () => {
    beforeEach(async () => {
      await recipeRepository.save([
        {
          nome: 'Torta de Maçã',
          id_usuarios: testUser.id,
          porcoes: 6,
          tempo_preparo_minutos: 90,
          modo_preparo: 'Fazer torta',
          ingredientes: 'maçã, massa',
          criado_em: new Date(),
          alterado_em: new Date(),
        },
        {
          nome: 'Bolo de Cenoura',
          id_usuarios: testUser.id,
          porcoes: 10,
          tempo_preparo_minutos: 70,
          modo_preparo: 'Fazer bolo',
          ingredientes: 'cenoura, ovo',
          criado_em: new Date(),
          alterado_em: new Date(),
        },
        {
          nome: 'Salada de Frutas',
          id_usuarios: anotherUser.id,
          porcoes: 2,
          tempo_preparo_minutos: 15,
          modo_preparo: 'Cortar frutas',
          ingredientes: 'frutas',
          criado_em: new Date(),
          alterado_em: new Date(),
        },
      ]);
    });

    it('should return recipes for an authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/recipe')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.message).toEqual('receitas buscadas com Sucesso!');
      expect(response.body.data.length).toEqual(2);
      expect(
        response.body.data.some((r: any) => r.nome === 'Salada de Frutas'),
      ).toBeFalsy();
      expect(
        response.body.data.some((r: any) => r.nome === 'Torta de Maçã'),
      ).toBeTruthy();
      expect(
        response.body.data.some((r: any) => r.nome === 'Bolo de Cenoura'),
      ).toBeTruthy();
      expect(response.body.metadata.userId).toEqual(testUser.id);
    });

    it('should filter recipes by name using query param', async () => {
      const response = await request(app.getHttpServer())
        .get('/recipe?nome=Bolo')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data.length).toEqual(1);
      expect(response.body.data[0].nome).toEqual('Bolo de Cenoura');
    });

    it('should return 401 Unauthorized if no token is provided', async () => {
      await request(app.getHttpServer())
        .get('/recipe')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /recipe/:id', () => {
    let ownedRecipe: Recipe;
    let foreignRecipe: Recipe;

    beforeEach(async () => {
      ownedRecipe = await recipeRepository.save({
        nome: 'Pizza Caseira',
        id_usuarios: testUser.id,
        porcoes: 4,
        tempo_preparo_minutos: 45,
        modo_preparo: 'Assar',
        ingredientes: 'massa, queijo',
        criado_em: new Date(),
        alterado_em: new Date(),
      });
      foreignRecipe = await recipeRepository.save({
        nome: 'Lasanha',
        id_usuarios: anotherUser.id,
        porcoes: 6,
        tempo_preparo_minutos: 120,
        modo_preparo: 'Cozinhar',
        ingredientes: 'massa, carne',
        criado_em: new Date(),
        alterado_em: new Date(),
      });
    });

    it('should return a recipe by ID for the owning user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/recipe/${ownedRecipe.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.message).toEqual('Receita Obtida com sucesso!');
      expect(response.body.data.id).toEqual(ownedRecipe.id);
      expect(response.body.data.id_usuarios).toEqual(testUser.id);
    });

    it('should return 404 Not Found if recipe does not exist', async () => {
      const nonExistentId = 9999;
      await request(app.getHttpServer())
        .get(`/recipe/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 Not Found if recipe belongs to another user', async () => {
      await request(app.getHttpServer())
        .get(`/recipe/${foreignRecipe.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 401 Unauthorized if no token is provided', async () => {
      await request(app.getHttpServer())
        .get(`/recipe/${ownedRecipe.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /recipe/:id', () => {
    let ownedRecipe: Recipe;
    let foreignRecipe: Recipe;

    beforeEach(async () => {
      ownedRecipe = await recipeRepository.save({
        nome: 'Bolacha',
        id_usuarios: testUser.id,
        porcoes: 20,
        tempo_preparo_minutos: 30,
        modo_preparo: 'Assar bolacha',
        ingredientes: 'farinha',
        criado_em: new Date(),
        alterado_em: new Date(),
      });
      foreignRecipe = await recipeRepository.save({
        nome: 'Pão de Queijo',
        id_usuarios: anotherUser.id,
        porcoes: 12,
        tempo_preparo_minutos: 40,
        modo_preparo: 'Assar pão',
        ingredientes: 'queijo',
        criado_em: new Date(),
        alterado_em: new Date(),
      });
    });

    it('should update a recipe for the owning user', async () => {
      const updateDto = { nome: 'Bolacha Crocante', porcoes: 25 };
      const response = await request(app.getHttpServer())
        .patch(`/recipe/${ownedRecipe.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body.message).toEqual('Receita Modificada com sucesso!');
      expect(response.body.data).toEqual(
        expect.objectContaining({
          id: ownedRecipe.id,
          nome: updateDto.nome,
          porcoes: updateDto.porcoes,
          id_usuarios: testUser.id,
        }),
      );

      const recipeInDb = await recipeRepository.findOneBy({
        id: ownedRecipe.id,
      });
      expect(recipeInDb?.nome).toEqual(updateDto.nome);
      expect(recipeInDb?.porcoes).toEqual(updateDto.porcoes);
    });

    it('should return 404 Not Found if recipe to update does not exist', async () => {
      const nonExistentId = 9999;
      const updateDto = { nome: 'Non Existent' };
      await request(app.getHttpServer())
        .patch(`/recipe/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 Not Found if recipe belongs to another user', async () => {
      const updateDto = { nome: 'Updated Foreign Recipe' };
      await request(app.getHttpServer())
        .patch(`/recipe/${foreignRecipe.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 401 Unauthorized if no token is provided', async () => {
      const updateDto = { nome: 'Unauthorized Update' };
      await request(app.getHttpServer())
        .patch(`/recipe/${ownedRecipe.id}`)
        .send(updateDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /recipe/:id', () => {
    let ownedRecipe: Recipe;
    let foreignRecipe: Recipe;

    beforeEach(async () => {
      ownedRecipe = await recipeRepository.save({
        nome: 'Biscoito',
        id_usuarios: testUser.id,
        porcoes: 15,
        tempo_preparo_minutos: 20,
        modo_preparo: 'Fazer biscoito',
        ingredientes: 'farinha',
        criado_em: new Date(),
        alterado_em: new Date(),
      });
      foreignRecipe = await recipeRepository.save({
        nome: 'Mousse',
        id_usuarios: anotherUser.id,
        porcoes: 4,
        tempo_preparo_minutos: 30,
        modo_preparo: 'Fazer mousse',
        ingredientes: 'chocolate',
        criado_em: new Date(),
        alterado_em: new Date(),
      });
    });

    it('should delete a recipe for the owning user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/recipe/${ownedRecipe.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.message).toEqual('Receita Deletada com sucesso!');
      expect(response.body.data.id).toEqual(ownedRecipe.id);
      expect(response.body.data.id_usuarios).toEqual(testUser.id);

      const recipeInDb = await recipeRepository.findOneBy({
        id: ownedRecipe.id,
      });
      expect(recipeInDb).toBeNull();
    });

    it('should return 404 Not Found if recipe to delete does not exist', async () => {
      const nonExistentId = 9999;
      await request(app.getHttpServer())
        .delete(`/recipe/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 404 Not Found if recipe belongs to another user', async () => {
      await request(app.getHttpServer())
        .delete(`/recipe/${foreignRecipe.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 401 Unauthorized if no token is provided', async () => {
      await request(app.getHttpServer())
        .delete(`/recipe/${ownedRecipe.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
