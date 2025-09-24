import { Module } from '@nestjs/common';
import { AdministrativoService } from './administrativo.service';
import { AdministrativoController } from './administrativo.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AdministrativoController],
  providers: [AdministrativoService, PrismaService],
  exports: [AdministrativoService],
})
export class AdministrativoModule {}
