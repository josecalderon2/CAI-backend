import { Module } from '@nestjs/common';
import { AlumnosController } from './alumnos.controller';
import { AlumnosService } from './alumnos.service';
import { PrismaModule } from '../../prisma/prsima.module';
import { ResponsablesModule } from '../responsables/responsables.module';

@Module({
  imports: [PrismaModule, ResponsablesModule],
  controllers: [AlumnosController],
  providers: [AlumnosService],
  exports: [AlumnosService],
})
export class AlumnosModule {}
