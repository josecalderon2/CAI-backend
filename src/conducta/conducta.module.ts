import { Module } from '@nestjs/common';
import { ConductasService } from './conducta.service';
import { ConductasController } from './conducta.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ConductasController],
  providers: [ConductasService, PrismaService],
  exports: [ConductasService],
})
export class ConductasModule {}
