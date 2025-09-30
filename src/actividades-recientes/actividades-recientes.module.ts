import { Module } from '@nestjs/common';
import { ActividadesRecientesController } from './actividades-recientes.controller';
import { ActividadesRecientesService } from './actividades-recientes.service';
import { PrismaModule } from '../../prisma/prsima.module';
import { ActividadRegistroService } from './actividad-registro.service';

@Module({
  imports: [PrismaModule],
  controllers: [ActividadesRecientesController],
  providers: [ActividadesRecientesService, ActividadRegistroService],
  exports: [ActividadesRecientesService, ActividadRegistroService],
})
export class ActividadesRecientesModule {}
