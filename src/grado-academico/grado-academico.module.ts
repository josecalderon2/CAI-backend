import { Module } from '@nestjs/common';
import { GradoAcademicoService } from './grado-academico.service';
import { GradoAcademicoController } from './grado-academico.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [GradoAcademicoController],
  providers: [GradoAcademicoService, PrismaService],
  exports: [GradoAcademicoService],
})
export class GradoAcademicoModule {}
