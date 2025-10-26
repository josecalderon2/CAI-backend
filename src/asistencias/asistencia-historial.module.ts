// src/asistencias/asistencia-historial.module.ts
import { Module } from '@nestjs/common';
import { AsistenciaHistorialController } from './asistencia-historial.controller';
import { AsistenciaHistorialService } from './asistencia-historial.service';
import { PrismaModule } from '../../prisma/prsima.module';

@Module({
  controllers: [AsistenciaHistorialController],
  providers: [AsistenciaHistorialService],
  imports: [PrismaModule],
})
export class AsistenciaHistorialModule {}
