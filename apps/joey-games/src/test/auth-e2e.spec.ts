import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { emailExistsMessage, userExistsMessage } from '../lib/constants';

describe('signup form tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('valid email, password and username creates new user', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'joey@games.com',
        username: 'joeygames1',
        password: 'jo123',
      })
      .expect(HttpStatus.OK)
      .expect({ email: 'joey@games.com', username: 'joeygames1' });
  });

  it(`rejects invalid email`, () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'bademail', username: 'New name', password: 'word' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('rejects empty username', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test@email.com', username: '', password: 'p@ssw0rd' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('rejects empty password', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'test@email.com',
        username: 'joeygames2',
        password: '',
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('rejects if username already exists', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'newjoey@games.com',
        username: 'joeygames1',
        password: 'jo123',
      });

    expect(response.status).toEqual(HttpStatus.CONFLICT);
    expect(response.body.message).toContain(userExistsMessage);
  });

  it('rejects if email already exists', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'joey@games.com',
        username: 'joeygames2',
        password: 'jo123',
      });

    expect(response.status).toEqual(HttpStatus.CONFLICT);
    expect(response.body.message).toContain(emailExistsMessage);
  });

  afterAll(async () => {
    await app.close();
  });
});
