import { Module } from '@nestjs/common';
import { CargoAdministrativoService } from './cargo-administrativo.service';
import { CargoAdministrativoController } from './cargo-administrativo.controller';
import { PrismaModule } from '../../prisma/prsima.module';

@Module({
  imports: [PrismaModule],
  controllers: [CargoAdministrativoController],
  providers: [CargoAdministrativoService],
  exports: [CargoAdministrativoService],
})
export class CargoAdministrativoModule {}