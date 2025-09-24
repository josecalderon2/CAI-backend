import { Module } from '@nestjs/common';
import { AdministrativoService } from './administrativo.service';
import { AdministrativoController } from './administrativo.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [AdministrativoController],
  providers: [AdministrativoService, PrismaService],
  imports: [MailModule],
  exports: [AdministrativoService],
})
export class AdministrativoModule {}
