import { Module } from '@nestjs/common';
import { ReportesNotasController } from './reportes-notas.controller';
import { ReportesNotasService } from './reportes-notas.service';
import { PrismaModule } from '../../prisma/prsima.module';
import { EvaluacionesModule } from '../evaluaciones/evaluaciones.module';

@Module({
  imports: [PrismaModule, EvaluacionesModule],
  controllers: [ReportesNotasController],
  providers: [ReportesNotasService],
  exports: [ReportesNotasService],
})
export class ReportesNotasModule {}
