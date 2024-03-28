import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ParseObjectIdPipe } from 'src/utils/customValidationPipe/objectIdPipe';
import handleError from 'src/utils/database/mongoose/handleError.plugin';
import { EncryptionService } from './encryption.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        connectionFactory: (connection) => {
          connection.plugin(handleError);
          return connection;
        },
      }),
    }),
  ],
  providers: [ParseObjectIdPipe, EncryptionService],
  exports: [ParseObjectIdPipe, EncryptionService],
})
export class CommonModule {}
