import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdministrativoModule } from './administrativo/administrativo.module';
import { AuthModule } from './auth/auth.module';
import { OrientadorModule } from './orientador/orientador.module';
import { AlumnosModule } from './alumnos/alumnos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AdministrativoModule,
    AuthModule,
    OrientadorModule,
    AlumnosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
