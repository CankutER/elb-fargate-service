import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventModule } from './UserModule/event.module';

@Module({
  imports: [
    EventModule,
    MongooseModule.forRoot(
      `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_LINK}/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`,
    ),
  ],
})
export class AppModule {}
