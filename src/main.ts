import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

dotenv.config();
const logger = new Logger();

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule,{
    transport: Transport.TCP,
    options: {
      host:"127.0.0.1",
      port: process.env.SERVER_PORT,
    },
  });
  logger.log(`Auth service running on http:localhost:${process.env.SERVER_PORT}`);
  app.listen();
}
bootstrap();
