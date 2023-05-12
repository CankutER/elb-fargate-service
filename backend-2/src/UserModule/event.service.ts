import { Injectable } from '@nestjs/common/decorators';

@Injectable()
export class EventService {
  constructor() {}

  async getContent() {
    return `Here is your content`;
  }
  async createContent(content: { name: string }) {
    return `Created Content: ${content.name}`;
  }
}
