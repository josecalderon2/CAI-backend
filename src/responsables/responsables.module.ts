import { Module } from '@nestjs/common';
import { ResponsablesController } from './responsables.controller';
import { ResponsablesService } from './responsables.service';
import { PrismaModule } from '../../prisma/prsima.module';

@Module({
  imports: [PrismaModule],
  controllers: [ResponsablesController],
  providers: [ResponsablesService],
  exports: [ResponsablesService], // Exportamos el servicio para usarlo en otros módulos
})
export class ResponsablesModule {}
