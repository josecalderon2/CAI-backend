import { Module } from '@nestjs/common';
import { CalificacionesService } from './calificaciones.service';
import { CalificacionesController } from './calificaciones.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [CalificacionesController],
  providers: [CalificacionesService, PrismaService],
})
export class CalificacionesModule {}
