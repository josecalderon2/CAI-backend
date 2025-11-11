import { Module } from '@nestjs/common';
import { AdminConsultaNotasController } from './admin-consulta-notas.controller';
import { AdminConsultaNotasService } from './admin-consulta-notas.service';
import { PrismaModule } from '../../prisma/prsima.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminConsultaNotasController],
  providers: [AdminConsultaNotasService],
  exports: [AdminConsultaNotasService],
})
export class AdminConsultaNotasModule {}
