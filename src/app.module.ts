import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdministrativoModule } from './administrativo/administrativo.module';
import { AuthModule } from './auth/auth.module';
import { OrientadorModule } from './orientador/orientador.module';
import { MailModule } from './mail/mail.module';
import { AlumnosModule } from './alumnos/alumnos.module';
import { ResponsablesModule } from './responsables/responsables.module';
import { ParentescoModule } from './parentesco/parentesco.module';
import { CargoAdministrativoModule } from './cargo-administrativo/cargo-administrativo.module';

@Module({
  imports: [
    AdministrativoModule,
    AuthModule,
    CargoAdministrativoModule,
    OrientadorModule,
    MailModule,
    AlumnosModule,
    ResponsablesModule,
    ParentescoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
