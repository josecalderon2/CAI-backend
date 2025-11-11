import { Module } from '@nestjs/common';
import { SistemasEvaluacionController } from './sistemas-evaluacion.controller';
import { SistemasEvaluacionService } from './sistemas-evaluacion.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SistemasEvaluacionController],
  providers: [SistemasEvaluacionService, PrismaService],
})
export class SistemasEvaluacionModule {}
