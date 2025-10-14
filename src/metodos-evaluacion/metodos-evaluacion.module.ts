import { Module } from '@nestjs/common';
import { MetodosEvaluacionController } from './metodos-evaluacion.controller';
import { MetodosEvaluacionService } from './metodos-evaluacion.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [MetodosEvaluacionController],
  providers: [MetodosEvaluacionService, PrismaService],
})
export class MetodosEvaluacionModule {}