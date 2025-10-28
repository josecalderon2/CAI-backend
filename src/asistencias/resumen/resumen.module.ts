import { Module } from '@nestjs/common';
import { ResumenService } from './resumen.service';
import { ResumenController } from './resumen.controller';
import { PrismaModule } from '../../../prisma/prsima.module';

@Module({
  imports: [PrismaModule],
  controllers: [ResumenController],
  providers: [ResumenService],
})
export class ResumenModule {}
