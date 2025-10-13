import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AsignaturasService } from './asignaturas.service';
import { CreateAsignaturaDto, UpdateAsignaturaDto } from './dto'; 
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';
import { AsignaturaResponse } from './dto/asignatura.response'; 

@ApiTags('Asignaturas') 
@Controller('asignaturas')
export class AsignaturasController {
  constructor(private readonly asignaturasService: AsignaturasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva asignatura' })
  @ApiBody({ type: CreateAsignaturaDto })
  @ApiResponse({ status: 201, description: 'La asignatura ha sido creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Los datos proporcionados son inválidos.' })
  async create(@Body() createAsignaturaDto: CreateAsignaturaDto): Promise<AsignaturaResponse> {
    return this.asignaturasService.create(createAsignaturaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener una lista de todas las asignaturas activas' })
  @ApiResponse({ status: 200, description: 'Lista de asignaturas recuperada con éxito.' })
  async findAll(): Promise<AsignaturaResponse[]> {
    return this.asignaturasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar una asignatura activa por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la asignatura a buscar', type: 'number' })
  @ApiResponse({ status: 200, description: 'Asignatura encontrada.' })
  @ApiResponse({ status: 404, description: 'La asignatura con el ID proporcionado no fue encontrada.' })
  async findOne(@Param('id') id: string): Promise<AsignaturaResponse> {
    return this.asignaturasService.findOne(+id);
  }



@Patch(':id')
@ApiOperation({ summary: 'Actualizar una asignatura existente' })
@ApiParam({ name: 'id', description: 'ID de la asignatura a actualizar', type: 'number' })
@ApiBody({ 
  type: UpdateAsignaturaDto,
  description: 'Datos para actualizar la asignatura',
  examples: {
    ejemplo: {
      value: {
        "nombre": "Matemática I",
        "orden_en_reporte": "01",
        "horas_semanas": 5,
        "id_metodo_evaluacion": 1,
        "id_tipo_asignatura": 1,
        "id_sistema_evaluacion": 1,
        "id_curso": 1
      }
    }
  }
})
@ApiResponse({ status: 200, description: 'La asignatura ha sido actualizada exitosamente.' })
@ApiResponse({ status: 404, description: 'La asignatura con el ID proporcionado no fue encontrada.' })
async update(
  @Param('id') id: string,
  @Body() updateAsignaturaDto: UpdateAsignaturaDto
): Promise<AsignaturaResponse> {
  return this.asignaturasService.update(+id, updateAsignaturaDto);
}

 
}