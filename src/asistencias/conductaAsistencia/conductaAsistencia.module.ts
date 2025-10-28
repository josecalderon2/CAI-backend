import { Module } from '@nestjs/common';
import { ConductaAsistenciaService } from './conductaAsistencia.service';
import { ConductaController } from './conductaAsistencia.controller';
import { PrismaModule } from '../../../prisma/prsima.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConductaController],
  providers: [ConductaAsistenciaService],
})
export class ConductaModule {}
