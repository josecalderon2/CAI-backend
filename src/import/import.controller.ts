import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ImportService } from './import.service';

@ApiTags('Importaciones')
@ApiBearerAuth()
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('matricula')
  @ApiOperation({ summary: 'Importar matrícula desde Excel (hoja "Alumnos")' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importarMatricula(@UploadedFile() file: Express.Multer.File) {
    if (!file?.buffer) throw new BadRequestException('Archivo no recibido');
    return this.importService.importMatriculaDesdeExcel(file.buffer);
  }
}
