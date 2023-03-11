import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema()
export class Event {
  @Prop()
  username: string;
  @Prop()
  year: number;
  @Prop()
  month: string;
  @Prop()
  date: number;
  @Prop()
  description: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
