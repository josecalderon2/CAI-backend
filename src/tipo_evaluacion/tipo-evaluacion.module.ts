import { Module } from '@nestjs/common';
import { TipoEvaluacionService } from './tipo-evaluacion.service';
import { TipoEvaluacionController } from './tipo-evaluacion.controller';
import { PrismaModule } from '../../prisma/prsima.module';

@Module({
  imports: [PrismaModule],
  controllers: [TipoEvaluacionController],
  providers: [TipoEvaluacionService],
  exports: [TipoEvaluacionService],
})
export class TipoEvaluacionModule {}
