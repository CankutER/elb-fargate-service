import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from './UserModule/event.module';

@Module({
  imports: [
    EventModule,
    MongooseModule.forRoot('mongodb://host.docker.internal/test'),
  ],
})
export class AppModule {}
