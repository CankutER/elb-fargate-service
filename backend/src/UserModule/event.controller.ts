import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { EventService } from './event.service';
import { EventDto } from './eventDto';

@Controller()
export class EventController {
  constructor(private eventService: EventService) {}
  @Get()
  sayHello() {
    return 'You have successfully connected';
  }

  @Get('content')
  getEvents(@Query('username') username: string) {
    return this.eventService.getEvents(username);
  }

  @Post('content')
  createEvent(@Body() reqBody: EventDto) {
    return this.eventService.create(reqBody);
  }
}
