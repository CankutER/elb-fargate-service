import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { EventService } from './event.service';
import { log } from 'console';

@Controller()
export class EventController {
  constructor(private eventService: EventService) {}
  @Get()
  sayHello() {
    return 'You have successfully connected';
  }

  @Get('name')
  getUser(@Query('username') username: string) {
    try {
      if (!Math.floor(Math.random() * 2)) {
        throw 'dummy error message for cloudwatch logs';
      }
    } catch (err) {
      console.log(err);
    }
    return this.eventService.getName(username);
  }

  @Post('name')
  createEvent(@Body() reqBody: { name: string }) {
    return this.eventService.createName(reqBody);
  }
}
