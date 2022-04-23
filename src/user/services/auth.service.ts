import { Injectable, Logger, HttpStatus, HttpException } from '@nestjs/common';
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import {JwtService} from "@nestjs/jwt"
import { User } from 'src/schemas/user.schema';
import {UserRepository} from "../../repositories/user.repository";

const logger = new Logger();
dotenv.config();

@Injectable()
export class AuthService {
  constructor(private readonly userRepository:UserRepository, private jwtService:JwtService){}

    /***
   * here we have methods to create acces and refresh token
   */
  createAccessToken(payload){
    const token = this.jwtService.sign(payload,{
      secret:process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME
    });
    const cookie = `Authentication=${token}; HttpOnly; Path=/; max-age=${process.env.ACCESS_TOKEN_EXPIRATION_TIME}; Secure=${process.env.NODE_ENV === "production"}`;
    return {
        cookie,
        token
    }
  }

  createRefreshToken(payload){
    const token = this.jwtService.sign(payload,{
      secret:process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${process.env.REFRESH_TOKEN_EXPIRATION_TIME}`;
    return {
        cookie,
        token
    }
  }

}