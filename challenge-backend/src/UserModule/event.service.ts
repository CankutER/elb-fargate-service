import { Injectable } from '@nestjs/common/decorators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './event.schema';
import { EventDto } from './eventDto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async getEvents(username: string) {
    return await this.eventModel.find({ username: username }).exec();
  }
  async create(event: EventDto) {
    return await this.eventModel.create(event);
  }
}
