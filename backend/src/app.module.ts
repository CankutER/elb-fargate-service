import { Module } from '@nestjs/common';
import { EventModule } from './UserModule/event.module';

@Module({
  imports: [
    EventModule
  ],
})
export class AppModule {}
