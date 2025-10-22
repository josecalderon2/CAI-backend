import { Module } from '@nestjs/common';
import { AsistenciaController } from './asistencias.controller';
import { AsistenciaService } from './asistencias.service';
import { PrismaModule } from '../../prisma/prsima.module';

@Module({
  imports: [PrismaModule],
  controllers: [AsistenciaController],
  providers: [AsistenciaService],
  exports: [AsistenciaService],
})
export class AsistenciaModule {}
