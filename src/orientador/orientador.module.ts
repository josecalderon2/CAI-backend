import { Module } from '@nestjs/common';
import { OrientadorService } from './orientador.service';
import { OrientadorController } from './orientador.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [OrientadorController],
  providers: [OrientadorService, PrismaService],
  exports: [OrientadorService],
})
export class OrientadorModule {}
