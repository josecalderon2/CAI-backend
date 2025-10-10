import { Module } from '@nestjs/common';
import { JornadasController } from './jornadas.controller';
import { JornadasService } from './jornadas.service';
import { PrismaModule } from '../../prisma/prsima.module';

@Module({
  imports: [PrismaModule],
  controllers: [JornadasController],
  providers: [JornadasService],
  exports: [JornadasService],
})
export class JornadasModule {}
