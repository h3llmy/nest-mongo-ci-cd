import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter = nodemailer.createTransport({
    host: this.configService.get<string>('MAILER_HOST'),
    service: this.configService.get<string>('MAILER_SERVICE'),
    port: this.configService.get<number>('MAILER_PORT'),
    secure: true,
    requireTLS: true,
    auth: {
      user: this.configService.get<string>('MAILER_USERNAME'),
      pass: this.configService.get<string>('MAILER_PASSWORD'),
    },
  });
  private emailOptions: SendMailOptions = {
    from: this.configService.get<string>('MAILER_FROM_ADDRESS'),
  };

  constructor(private readonly configService: ConfigService) {}

  public to(email: string | string[]): this {
    this.emailOptions.to = email;
    return this;
  }

  public subject(subject: string): this {
    this.emailOptions.subject = subject;
    return this;
  }

  // public async sendHtml(
  //   component: React.ComponentType<any>,
  //   data?: object
  // ): Promise<boolean> {
  //   try {
  //     this.emailOptions.html = await new RenderReact().toString(
  //       component,
  //       data
  //     );

  //     return this.send();
  //   } catch (error) {
  //     console.error(error);
  //     throw new Exception("Fail To Send Email", 500);
  //   }
  // }

  public sendText(text: string): Promise<boolean> {
    this.emailOptions.text = text;
    return this.send();
  }

  private async send(): Promise<boolean> {
    try {
      if (Array.isArray(this.emailOptions.to)) {
        this.emailOptions.to.forEach(async () => {
          await this.transporter.sendMail(this.emailOptions);
        });
      } else {
        await this.transporter.sendMail(this.emailOptions);
      }
      return true;
    } catch (error) {
      throw new InternalServerErrorException('Fail To Send Email');
    }
  }
}
