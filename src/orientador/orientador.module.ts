import { Module } from '@nestjs/common';
import { OrientadorService } from './orientador.service';
import { OrientadorController } from './orientador.controller';

@Module({
  providers: [OrientadorService],
  controllers: [OrientadorController]
})
export class OrientadorModule {}
