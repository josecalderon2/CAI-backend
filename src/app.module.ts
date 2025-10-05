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
import { CargoAdministrativoModule } from './cargo-administrativo/cargo-administrativo.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { ActividadesRecientesModule } from './actividades-recientes/actividades-recientes.module';
import { ScheduleModule } from '@nestjs/schedule';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    AdministrativoModule,
    AuthModule,
    CargoAdministrativoModule,
    OrientadorModule,
    MailModule,
    AlumnosModule,
    ResponsablesModule,
    ParentescoModule,
    EstadisticasModule,
    ActividadesRecientesModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
