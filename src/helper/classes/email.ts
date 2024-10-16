import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailClass {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true untuk 465, false untuk port lainnya
      auth: {
        user: this.configService.get<string>('GMAIL_EMAIL'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD'), // Menggunakan App Password
      },
    });
  }

  async sendAlert(
    token_string: string,
    increasePercentage: number,
  ): Promise<void> {
    const senderEmail = this.configService.get<string>('GMAIL_EMAIL');
    const senderName = this.configService.get<string>('GMAIL_NAME');
    const hyperhireEmail = this.configService.get<string>('HYPERHIRE_EMAIL');

    const mailOptions = {
      from: `${senderName} <${senderEmail}>`,
      to: hyperhireEmail,
      subject: `Price Alert: ${token_string} increased by ${increasePercentage.toFixed(2)}%`,
      text: `The price of ${token_string} has increased by ${increasePercentage.toFixed(2)}% in the last hour.`,
      html: `<h3>Price Alert</h3><p>The price of ${token_string} has increased by ${increasePercentage.toFixed(2)}% in the last hour.</p>`,
    };
    this.transporter.sendMail(mailOptions).finally(() => {
      return;
    });
  }

  async sendPriceAlert(
    email: string,
    token_string: string,
    currentPrice: number,
  ): Promise<void> {
    const senderEmail = this.configService.get<string>('GMAIL_EMAIL');
    const senderName = this.configService.get<string>('GMAIL_NAME');

    const mailOptions = {
      from: `${senderName} <${senderEmail}>`,
      to: email,
      subject: `Price Alert: ${token_string} reached target price`,
      text: `The price of ${token_string} has reached your target price. Current price: $${currentPrice.toFixed(2)}`,
      html: `<h3>Price Alert</h3><p>The price of ${token_string} has reached your target price.</p><p>Current price: $${currentPrice.toFixed(2)}</p>`,
    };
    this.transporter.sendMail(mailOptions).finally(() => {
      return;
    });
  }
}
