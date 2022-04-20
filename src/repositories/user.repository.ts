import { Injectable, Logger, HttpStatus, HttpException } from '@nestjs/common';
import {Model} from "mongoose";
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, User } from 'src/schemas/user.schema';

type UserRes = {
    msisdnRes:User;
    emailRes:User;
}

type Gender = "Male" | "Female";

type EmailRes = {
  firstName:string;
  lastName:string;
  msisdn:string;
  gender:Gender;
  password:string;
  email:string;
  role:string;
  isValidated:boolean;
  clientIp:string;
  _id:string;
}
@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel:Model<UserDocument>) {}

  async save(userModelDto): Promise<User> {
    return this.userModel.create(userModelDto);
  }

  async findByMsisdnAndEmail(msisdn:string,email:string):Promise<UserRes | null>{
    const [msisdnRes,emailRes] = await Promise.all([
        this.userModel.findOne({msisdn},{
            __v:0
        }).exec(),
        this.userModel.findOne({email},{
            __v:0
        }).exec()
    ]);
    return {
        msisdnRes,
        emailRes
    }
  }

  async findByEmail(email:string):Promise<EmailRes | null>{
    return this.userModel.findOne({email},{
      _v:0
    }).exec();
  }

  async updateUserRefreshToken(refreshToken:string,userId:string):Promise<User | null>{
    return this.userModel.findOneAndUpdate({_id:userId},{hashedRefreshToken:refreshToken},{new:true}).exec();
  }
}