import { Module } from '@nestjs/common';
import { TiposEvaluacionController } from './tipos-evaluacion.controller';
import { TiposEvaluacionService } from './tipos-evaluacion.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TiposEvaluacionController],
  providers: [TiposEvaluacionService, PrismaService],
})
export class TiposEvaluacionModule {}
