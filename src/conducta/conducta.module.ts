import { Module } from '@nestjs/common';
import { ConductasService } from './conducta.service';
import { ConductaController } from './conducta.controller';
import { PrismaModule } from '../../prisma/prsima.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConductaController],
  providers: [ConductasService],
  exports: [ConductasService],
})
export class ConductaModule {}
