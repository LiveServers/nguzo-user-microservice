import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {JwtModule} from "@nestjs/jwt";
import * as dotenv from "dotenv";
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserSchema, User } from 'src/schemas/user.schema';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import {AuthService} from './services/auth.service';
import {UserRepository} from "../repositories/user.repository";

dotenv.config();

@Module({
    imports: [MongooseModule.forFeature([{
        name:User.name,
        schema:UserSchema
    }]),
    // ClientsModule.register([{
    //   name: "AUTH_CLIENT",
    //   transport: Transport.TCP,
    //   options: {
    //     host: 'localhost',
    //     port: parseInt(process.env.AUTH_PORT,10),
    //   },
    // }]),
    ClientsModule.register([
      {
        name:'OTP_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.SERVER_PORT_QUEUE],
          queue: process.env.QUEUE_NAME,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: {expiresIn: '300s'}
    })],
    controllers: [UserController],
    providers: [UserService,UserRepository,AuthService],
})
export class UserModule {}
