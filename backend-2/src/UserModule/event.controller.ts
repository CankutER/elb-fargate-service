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
    return this.eventService.getContent();
  }

  @Post('content')
  createEvent(@Body() reqBody: { name: string }) {
    return this.eventService.createContent(reqBody);
  }
}
