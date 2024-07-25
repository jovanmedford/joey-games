import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import session from 'express-session';

describe('login tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(
      session({
        secret: process.env.LOGIN_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
      })
    );
    await app.init();
  });

  it('successful login', async () => {
    let testUser = {
      email: 'joey@games.com',
      password: process.env.JOEY_PASSWORD,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username');
  });

  it('invalid password', async () => {
    let testUser = {
      email: 'joey@games.com',
      password: 'bad_password',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);
    expect(response.status).toBe(401);
    expect(response.body).not.toHaveProperty('username');
  });

  it('user not found', async () => {
    let testUser = {
      email: 'poppy@games.com',
      password: 'bad_password',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);
    expect(response.status).toBe(401);
    expect(response.body).not.toHaveProperty('username');
  });

  it('user already signed in', async () => {
    let testUser = {
      email: 'joey@games.com',
      password: 'process.env.JOEY_PASSWORD',
    };

    await request(app.getHttpServer()).post('/auth/login').send(testUser);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    expect(response.status).toBe(401);
    expect(response.body).not.toHaveProperty('username');
  });

  it('logout user', async () => {
    let testUser = {
      email: 'joey@games.com',
      password: 'process.env.JOEY_PASSWORD',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    const response2 = await request(app.getHttpServer())
      .post('/auth/logout')
  });
});
