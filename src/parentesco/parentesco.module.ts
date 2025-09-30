import { Module } from '@nestjs/common';
import { ParentescoController } from './parentesco.controller';
import { ParentescoService } from './parentesco.service';
import { PrismaModule } from '../../prisma/prsima.module';

@Module({
  imports: [PrismaModule],
  controllers: [ParentescoController],
  providers: [ParentescoService],
  exports: [ParentescoService],
})
export class ParentescoModule {}
