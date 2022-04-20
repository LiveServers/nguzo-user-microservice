import { Schema, Prop, SchemaFactory} from "@nestjs/mongoose";
import {Document} from "mongoose";

type Gender = "Male" | "Female";

@Schema()
export class User {
   @Prop({required:true})
    firstName:string;

   @Prop({required:true})
    lastName:string;

   @Prop({index:true})
   msisdn:string;

   @Prop({required:true})
   gender:Gender;

   @Prop({required:true})
   password:string;

   @Prop({required:true,index:true})
   email:string;

   @Prop({default:"user"})
   role:string;

   @Prop({default:false})
   isValidated:boolean;

   @Prop({required:true})
   clientIp:string;

   @Prop({index:true})
   hashedRefreshToken:string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;
