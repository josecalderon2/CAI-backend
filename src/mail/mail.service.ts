import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const port = Number(process.env.EMAIL_PORT ?? 587);
    const secure =
      String(process.env.EMAIL_SECURE ?? 'false').toLowerCase() === 'true';

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    this.transporter.verify((err, success) => {
      if (err) {
        this.logger.error('SMTP no disponible', err as any);
      } else {
        this.logger.log('SMTP listo para enviar');
      }
    });
  }

  /**
   * Envía la contraseña generada al usuario que usará el sistema
   */
  async sendPasswordToUser({
    to,
    newUserName,
    generatedPassword,
  }: {
    to: string;
    newUserName: string;
    generatedPassword: string;
  }) {
    const from =
      process.env.MAIL_FROM || process.env.EMAIL_USER || 'no-reply@example.com';
    const subject = `Bienvenido/a ${newUserName} al Sistema CAI`;
    const html = `
      <p>Hola <b>${newUserName}</b>,</p>
      <p>Tu cuenta en el sistema ha sido creada exitosamente.</p>
      <p>Estos son tus datos de acceso:</p>
      <ul>
        <li><b>Usuario (correo):</b> ${to}</li>
        <li><b>Contraseña temporal:</b> <code>${generatedPassword}</code></li>
      </ul>
      <p>Por seguridad, se recomienda cambiar la contraseña al iniciar sesión.</p>
      <br/>
      <p>Atentamente,</p>
      <p><b>Equipo de soporte CAI</b></p>
    `;

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log(`Correo enviado a ${to}: ${info.messageId}`);
      return info;
    } catch (err) {
      this.logger.error('Error enviando correo al usuario', err as any);
      throw err;
    }
  }
}
