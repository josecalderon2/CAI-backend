import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        const ok =
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel' ||
          /\.xlsx$/i.test(file.originalname) ||
          /\.xls$/i.test(file.originalname);
        if (!ok)
          return cb(
            new Error('Tipo de archivo inválido. Sube un .xlsx/.xls'),
            false,
          );
        cb(null, true);
      },
    }),
  ],
  controllers: [ImportController],
  providers: [PrismaService, ImportService],
})
export class ImportModule {}
