import { Module } from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { AsignacionesController } from './asignaciones.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AsignacionesController],
  providers: [AsignacionesService, PrismaService],
  exports: [AsignacionesService],
})
export class AsignacionesModule {}
