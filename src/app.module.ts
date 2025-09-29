import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdministrativoModule } from './administrativo/administrativo.module';
import { AuthModule } from './auth/auth.module';
import { OrientadorModule } from './orientador/orientador.module';
import { MailModule } from './mail/mail.module';
import { AlumnosModule } from './alumnos/alumnos.module';
import { ResponsablesModule } from './responsables/responsables.module';
import { ParentescoModule } from './parentesco/parentesco.module';

@Module({
  imports: [
<<<<<<< HEAD
    ConfigModule.forRoot({ isGlobal: true }),
    AdministrativoModule,
    AuthModule,
    OrientadorModule,
=======
    AdministrativoModule,
    AuthModule,
    OrientadorModule,
    MailModule,
    AlumnosModule,
    ResponsablesModule,
    ParentescoModule,
>>>>>>> Carlos
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
