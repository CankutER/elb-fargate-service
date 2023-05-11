import { Injectable } from '@nestjs/common/decorators';


@Injectable()
export class EventService {
  constructor(
    
  ) {}

  async getName(username: string) {
    return `Your name is ${username}`
  }
  async createName(nameReq:{name:string}) {
    return `Created Name: ${nameReq.name}`;
  }
}
