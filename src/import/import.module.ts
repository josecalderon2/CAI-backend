// src/import/import.module.ts
import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { PrismaModule } from '../../prisma/prsima.module'; // <-- fix aquí
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      // Opcional: límites y memoria (sin disco)
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  ],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
