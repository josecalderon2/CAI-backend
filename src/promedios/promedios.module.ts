import { Module } from '@nestjs/common';
import { PromediosService } from './promedios.service';
import { PromediosController } from './promedios.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PromediosController],
  providers: [PromediosService, PrismaService],
  exports: [PromediosService],
})
export class PromediosModule {}
