import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from "dotenv";
import { UserModule } from './user/user.module';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION_URI),
    UserModule],
})
export class AppModule {}
