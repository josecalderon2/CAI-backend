import { Module } from '@nestjs/common';
import { AdministrativoService } from './administrativo.service';
import { AdministrativoController } from './administrativo.controller';

@Module({
  providers: [AdministrativoService],
  controllers: [AdministrativoController]
})
export class AdministrativoModule {}
