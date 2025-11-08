import { Module } from '@nestjs/common';
import { SistemaEvaluacionController } from './sistema-evaluacion.controller';
import { SistemaEvaluacionService } from './sistema-evaluacion.service';
import { PrismaModule } from '../../prisma/prsima.module';
import { BasicaEvaluacionStrategy } from './strategies/basica-strategy.service';
import { BachilleratoEvaluacionStrategy } from './strategies/bachillerato-strategy.service';

@Module({
  imports: [PrismaModule],
  controllers: [SistemaEvaluacionController],
  providers: [
    SistemaEvaluacionService,
    BasicaEvaluacionStrategy,
    BachilleratoEvaluacionStrategy,
  ],
  exports: [SistemaEvaluacionService],
})
export class SistemaEvaluacionModule {}
