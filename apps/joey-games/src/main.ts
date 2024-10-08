/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import * as fs from 'fs';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { WsAdapter } from './adapters/ws.adapter';
import { SessionService } from './session/session.service';

const httpsOptions = {
  key: fs.readFileSync('./keys/server.key'),
  cert: fs.readFileSync('./keys/server.crt'),
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.enableCors({ origin: `${process.env.UI_ORIGIN}`, credentials: true });
  const sessionService = app.get(SessionService)
  app.use(sessionService.getMiddleware());
  const adapter = new WsAdapter(app);
  app.useWebSocketAdapter(adapter);
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
