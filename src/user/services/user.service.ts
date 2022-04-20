import { Injectable, Logger, HttpStatus, HttpException } from '@nestjs/common';
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import {JwtService} from "@nestjs/jwt";
import { User } from 'src/schemas/user.schema';
import {UserRepository} from "../../repositories/user.repository";
import {AuthService} from "./auth.service";

const logger = new Logger();
dotenv.config();

@Injectable()
export class UserService {
  constructor(private readonly userRepository:UserRepository, private jwtService:JwtService,private authService:AuthService){}

  /**
   * @param refreshToken
   */
  async setCurrentRefreshToken(refreshToken:string,userId:string){
    try{
      const salt = await bcrypt.genSalt();
      const hashedRefreshToken = await bcrypt.hash(refreshToken,salt);
      await this.userRepository.updateUserRefreshToken(hashedRefreshToken,userId);
    }catch(e){
      logger.log(e);
      throw new HttpException(e,HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signUp(userModelDto,clientIp):Promise<User>{
    try{
      if(!userModelDto){
        throw new HttpException("Cannot be Empty",HttpStatus.BAD_REQUEST);
      }
      /**
       * check if user exists
       * we check against the mobileNumber And email
       * @param  msisdn,email
       *  */ 
      const {msisdnRes,emailRes} = await this.userRepository.findByMsisdnAndEmail(userModelDto.msisdn,userModelDto.email);
      if(msisdnRes || emailRes){
        throw new HttpException("User is Already Registered",HttpStatus.FOUND);
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(userModelDto.password,salt);
      delete userModelDto.password;
      userModelDto.password = hashedPassword;
      userModelDto.clientIp = clientIp;

      // after all this we now need to verify the user by sending either an otp to the provided msisdn or email
      return this.userRepository.save(userModelDto);
    }catch(e){
      logger.log(e);
      throw new HttpException(e,HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

    /**
   * 
   * @param userObject 
   * @param clientIp 
   * @returns token
   */

    async signIn(userObject,clientIp){
    try{
        if(!userObject){
            throw new HttpException("Cannot be Empty",HttpStatus.BAD_REQUEST);
        }
        const response = await this.userRepository.findByEmail(userObject.email);
        if(!response){
            throw new HttpException("Wrong Email or Password",HttpStatus.UNAUTHORIZED);
        }
        /**
         * lets check if ip address match
         */
        logger.log("IP",clientIp,"IP2",response?.clientIp);
        if(clientIp !== response?.clientIp){
          // we send an email to the client telling them that a particular IP address tried accessing their account
          // later on, we will ask them to verify their authenticity, like google
        }
        const match = await bcrypt.compare(userObject?.password,response?.password);

        if(!match){
            throw new HttpException("Wrong Email or Password",HttpStatus.UNAUTHORIZED);
        }
        // for now lets just send back the access token
        const payload = {
            username:response?.firstName+" "+response?.lastName,
            sub: response?._id,
            role: response?.role
        };
        const accessTokenCookie = this.authService.createAccessToken(payload);
        // const refreshTokenCookie = this.authService.createRefreshToken(payload);
        await this.setCurrentRefreshToken(accessTokenCookie?.token,response._id);
        return accessTokenCookie;
    }catch(e){
        logger.log(e);
        throw new HttpException(e,HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
async testFn(){
  try{
// we try to access a protected resource
  }catch(e){

  }
}
}
