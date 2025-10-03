import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PasswordResetCleanupService {
  private readonly logger = new Logger(PasswordResetCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  // corre cada 5 minutos
  @Cron(CronExpression.EVERY_5_MINUTES)
  async sweep() {
    const now = new Date();
    const res = await this.prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },      // expirados
          { usedAt: { not: null } },       // (por si quedaron legacy con usedAt)
        ],
      },
    });
    if (res.count > 0) {
      this.logger.log(`Cleanup: eliminados ${res.count} tokens de reset.`);
    }
  }
}
