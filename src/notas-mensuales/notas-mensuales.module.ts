import { Module } from '@nestjs/common';
import { NotasMensualesController } from './notas-mensuales.controller';
import { NotasMensualesService } from './notas-mensuales.service';
import { PrismaModule } from '../../prisma/prsima.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotasMensualesController],
  providers: [NotasMensualesService],
  exports: [NotasMensualesService],
})
export class NotasMensualesModule {}
