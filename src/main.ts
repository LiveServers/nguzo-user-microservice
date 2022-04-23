import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

dotenv.config();
const logger = new Logger();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microserviceTCP = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host:"127.0.0.1",
      port: parseInt(process.env.SERVER_PORT_TCP,10),
    },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.SERVER_PORT);
  logger.log(`Auth service running on http:localhost:${process.env.SERVER_PORT}`);
}
bootstrap();
