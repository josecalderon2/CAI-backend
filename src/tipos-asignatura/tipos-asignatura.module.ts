import { Module } from '@nestjs/common';
import { TiposAsignaturaController } from './tipos-asignatura.controller';
import { TiposAsignaturaService } from './tipos-asignatura.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [TiposAsignaturaController],
  providers: [TiposAsignaturaService, PrismaService],
})
export class TiposAsignaturaModule {}