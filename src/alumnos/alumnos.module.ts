import { Module } from '@nestjs/common';
import { AlumnosController } from './alumnos.controller';
import { AlumnosService } from './alumnos.service';
import { PrismaModule } from '../../prisma/prsima.module';
import { ResponsablesModule } from '../responsables/responsables.module';
import { ActividadesRecientesModule } from '../actividades-recientes/actividades-recientes.module';

@Module({
  imports: [PrismaModule, ResponsablesModule, ActividadesRecientesModule],
  controllers: [AlumnosController],
  providers: [AlumnosService],
  exports: [AlumnosService],
})
export class AlumnosModule {}
