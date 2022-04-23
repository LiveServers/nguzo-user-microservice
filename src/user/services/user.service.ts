import { Injectable, Logger, HttpStatus, HttpException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import {JwtService} from "@nestjs/jwt";
import { User } from 'src/schemas/user.schema';
import {UserRepository} from "../../repositories/user.repository";
import {AuthService} from "./auth.service";
import encrypt from '../../utils/encrypt';
import decrypt from '../../utils/decrypt';

const logger = new Logger();
dotenv.config();

@Injectable()
export class UserService {
  constructor(@Inject("OTP_CLIENT") private client:ClientProxy, private readonly userRepository:UserRepository, private jwtService:JwtService,private authService:AuthService){}

  /**
   * @param token
   */
  async setCurrentRefreshToken(token:string,userId:string){
    try{
      const ecryptedToken = await encrypt(token)
      await this.userRepository.updateUserToken(ecryptedToken,userId);
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
    }catch(e){  logger.log(`Auth service running on http:localhost:${process.env.PORT}`);
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
        await this.setCurrentRefreshToken(accessTokenCookie?.token,response._id);
        return accessTokenCookie;
    }catch(e){
        logger.log(e);
        throw new HttpException(e,HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async getToken(id:string, token:string){
    try{
      const user = await this.userRepository.findById(id);
      if(user?.hashedRefreshToken === "" || user?.hashedRefreshToken === null){
        throw new HttpException("Unauthorized",HttpStatus.UNAUTHORIZED);
      }
      const decryptedToken = await decrypt(user?.hashedRefreshToken);
      if(token !== decryptedToken){
          throw new HttpException("Unauthorized",HttpStatus.UNAUTHORIZED);
      }
      return decryptedToken;
    }catch(e){
      logger.log(e);
      throw new HttpException(e,HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async logOut(id:string){
    try{
      await this.userRepository.deleteToken(id);
    }catch(e){
      throw new HttpException(e,HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkEmailBeforeResetingPassword(email:string){
    try{
      // we have to send email with otp that the person has to enter
      const response = await this.userRepository.findByEmail(email);
      if(!response){
        throw new HttpException("Email not registered",HttpStatus.NOT_FOUND);
      }
      const data = {
        otpKey:response?.email,
        otpType:"Alphanumeric",
        expirationDuration:"100",
        otpLength:"4",
      }
      await this.client.emit('generate-otp',data);
      return {
        status: true,
        message: "Email Verification Sent Successfully",
      }
    }catch(e){
      throw new HttpException(e,HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async resetPassword(email){}
}
