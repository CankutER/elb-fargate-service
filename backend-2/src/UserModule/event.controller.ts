import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { EventService } from './event.service';

@Controller()
export class EventController {
  constructor(private eventService: EventService) {}

  @Get()
  healthCheck() {
    return 'Hello World';
  }
  @Get('content')
  getUser() {
    try {
      if (!Math.floor(Math.random() * 2)) {
        throw 'dummy error message for cloudwatch logs';
      }
    } catch (err) {
      console.log(err);
    }
    return this.eventService.getContent();
  }

  @Post('content')
  createEvent(@Body() reqBody: { name: string }) {
    return this.eventService.createContent(reqBody);
  }
}
