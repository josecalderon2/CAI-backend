import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdministrativoModule } from './administrativo/administrativo.module';
import { AuthModule } from './auth/auth.module';
import { OrientadorModule } from './orientador/orientador.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [AdministrativoModule, AuthModule, OrientadorModule, MailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
