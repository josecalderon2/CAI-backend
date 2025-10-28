import { Module } from '@nestjs/common';
import { PromocionesService } from './promociones.service';
import { PromocionesController } from './promociones.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ActividadesRecientesModule } from '../actividades-recientes/actividades-recientes.module';

@Module({
  imports: [ActividadesRecientesModule],
  controllers: [PromocionesController],
  providers: [PromocionesService, PrismaService],
  exports: [PromocionesService],
})
export class PromocionesModule {}
