import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from '../services/user.service';

const logger = new Logger();

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({cmd:'sign-in'})
  signIn(obj){
    return this.userService.signIn(obj.userModel,obj.clientIp);
  }

  @MessagePattern({cmd:'sign-up'})
  signUp(obj){
    return this.userService.signUp(obj.userModelDto,obj.clientIp);
  }

}
