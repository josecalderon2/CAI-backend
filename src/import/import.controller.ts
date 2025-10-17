// src/import/import.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  ParseFilePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { ImportContextDto, ImportContext } from './dto/import-context.dto';
import type { Express } from 'express';
import { ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';

interface ImportResult {
  nombre: string;
  status: 'OK' | 'ERROR' | 'WARNING';
  message?: string;
  id_alumno?: number;
  inserted?: number;
  code?: string;
}

const ACCEPTED = {
  exts: ['.csv', '.xlsx'],
  mimes: [
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream', // algunos navegadores ponen esto
  ],
};

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  /** Validación manual y detección de tipo */
  private ensureSupportedFile(file: Express.Multer.File) {
    const name = (file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    const hasExt = ACCEPTED.exts.some((e) => name.endsWith(e));
    const hasMime = ACCEPTED.mimes.includes(mime);
    if (!hasExt && !hasMime) {
      throw new BadRequestException(
        `Formato no soportado (${mime} / ${name}). Usa CSV (.csv) o Excel (.xlsx).`,
      );
    }
  }

  private async parseCsvFile(buffer: Buffer): Promise<any[]> {
    const csvParser = require('csv-parser');
    const records: any[] = [];
    let text = buffer.toString('utf8');
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const sep =
      (text.match(/;/g)?.length || 0) > (text.match(/,/g)?.length || 0)
        ? ';'
        : ',';

    return new Promise((resolve, reject) => {
      Readable.from(text)
        .pipe(
          csvParser({
            separator: sep,
            mapHeaders: ({ header }) => header?.trim(),
          }),
        )
        .on('data', (data: any) => records.push(data))
        .on('end', () => resolve(records))
        .on('error', (error: Error) =>
          reject(
            new BadRequestException(
              `Error al procesar el CSV: ${error.message}`,
            ),
          ),
        );
    });
  }

  private async parseXlsxFile(buffer: Buffer): Promise<any[]> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) return [];
    const ws = wb.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(ws, { defval: '' }) as any[];
  }

  private async parseUploadedFile(file: Express.Multer.File): Promise<any[]> {
    this.ensureSupportedFile(file);
    const name = (file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    const isXlsx =
      mime.includes('spreadsheetml') ||
      name.endsWith('.xlsx') ||
      name.endsWith('.xlsm');
    const isCsv =
      mime.includes('csv') ||
      mime.startsWith('text/') ||
      name.endsWith('.csv') ||
      mime === 'application/octet-stream';

    if (isXlsx) return this.parseXlsxFile(file.buffer);
    if (isCsv) return this.parseCsvFile(file.buffer);

    throw new BadRequestException(
      'Formato no soportado. Usa CSV o Excel (.xlsx).',
    );
  }

  // POST /import/matricula
  @Post('matricula')
  @ApiOperation({
    summary:
      'Importación Masiva de Fichas de Matrícula (Alumnos y Responsables)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV o XLSX de matrícula.',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadMatricula(
    @UploadedFile(
      // quitamos FileTypeValidator que te generaba el 400
      new ParseFilePipe({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
  ) {
    const dataArray = await this.parseUploadedFile(file);
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new BadRequestException('El archivo no contiene registros.');
    }

    const results: ImportResult[] =
      await this.importService.importMatricula(dataArray);

    return {
      message: 'Importación de matrícula finalizada.',
      totalRecords: dataArray.length,
      successCount: results.filter((r) => r.status === 'OK').length,
      errorCount: results.filter((r) => r.status === 'ERROR').length,
      results: results.filter((r) => r.status !== 'OK'),
    };
  }

  // POST /import/notas
  @Post('notas')
  @ApiOperation({ summary: 'Importación Masiva de Notas por Asignatura' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV o XLSX de notas.',
        },
        idAsignatura: { type: 'string', description: 'ID de la asignatura.' },
        trimestre: { type: 'string', description: 'Trimestre (I, II, III).' },
      },
      required: ['file', 'idAsignatura', 'trimestre'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadNotas(
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
    @Body() contextDto: ImportContextDto,
  ) {
    const idAsignatura = Number.parseInt(contextDto.idAsignatura, 10);
    if (!Number.isFinite(idAsignatura))
      throw new BadRequestException('idAsignatura inválido.');

    const importContext: ImportContext = {
      idAsignatura,
      trimestre: contextDto.trimestre,
    };

    const dataArray = await this.parseUploadedFile(file);
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new BadRequestException('El archivo no contiene registros.');
    }

    const results: ImportResult[] = await this.importService.importNotas(
      dataArray,
      importContext,
    );

    return {
      message: 'Importación de notas finalizada.',
      totalRecords: dataArray.length,
      successCount: results.filter((r) => r.status === 'OK').length,
      errorCount: results.filter((r) => r.status === 'ERROR').length,
      results: results.filter((r) => r.status !== 'OK'),
    };
  }
}
