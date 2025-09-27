import { Module } from '@nestjs/common';
import { OrientadorService } from './orientador.service';
import { OrientadorController } from './orientador.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [OrientadorController],
  providers: [OrientadorService, PrismaService],
  exports: [OrientadorService],
  imports: [MailModule],
})
export class OrientadorModule {}
