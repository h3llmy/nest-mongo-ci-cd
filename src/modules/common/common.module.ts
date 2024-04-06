import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ParseObjectIdPipe } from 'src/utils/customValidationPipe/objectIdPipe';
import handleError from 'src/utils/database/mongoose/handleError.plugin';
import { EncryptionService } from './encryption.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

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
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAILER_HOST'),
          service: config.get<string>('MAILER_SERVICE'),
          port: config.get<number>('MAILER_PORT'),
          secure: true,
          requireTLS: true,
          auth: {
            user: config.get<string>('MAILER_USERNAME'),
            pass: config.get<string>('MAILER_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@gmail.com>',
        },
        template: {
          adapter: new EjsAdapter(),
          dir: './templates/email',
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [ParseObjectIdPipe, EncryptionService],
  exports: [ParseObjectIdPipe, EncryptionService],
})
export class CommonModule {}
