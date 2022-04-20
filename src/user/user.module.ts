import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {JwtModule} from "@nestjs/jwt";
import * as dotenv from "dotenv";
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
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: {expiresIn: '300s'}
    })],
    controllers: [UserController],
    providers: [UserService,UserRepository,AuthService],
})
export class UserModule {}
