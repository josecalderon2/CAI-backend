import { Module } from '@nestjs/common';
import { CalificacionesService } from './calificaciones.service';
import { CalificacionesController } from './calificaciones.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { PromediosModule } from '../promedios/promedios.module';

@Module({
  imports: [PromediosModule],
  controllers: [CalificacionesController],
  providers: [CalificacionesService, PrismaService],
})
export class CalificacionesModule {}
