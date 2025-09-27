// src/alumnos/alumnos.module.ts
import { Module } from '@nestjs/common';
import { AlumnosService } from './alumnos.service';
import { AlumnosController } from './alumnos.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AlumnosController],
  providers: [AlumnosService, PrismaService],
})
export class AlumnosModule {}
