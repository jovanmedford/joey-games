/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import * as fs from 'fs';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import session from 'express-session';

const httpsOptions = {
  key: fs.readFileSync('./keys/server.key'),
  cert: fs.readFileSync('./keys/server.crt'),
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.enableCors({ origin: `${process.env.UI_ORIGIN}`, credentials: true });
  app.use(
    session({
      name: 'login',
      secret: process.env.LOGIN_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: false,
        sameSite: 'none',
        secure: true,
      },
    })
  );
  app.useGlobalPipes(new ValidationPipe());
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
