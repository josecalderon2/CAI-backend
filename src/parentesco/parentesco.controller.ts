import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ParentescoService } from './parentesco.service';
import { CreateParentescoDto } from './dto/create-parentesco.dto';

@ApiTags('Parentescos')
@Controller('parentescos')
export class ParentescoController {
  constructor(private readonly parentescoService: ParentescoService) {}

  @ApiOperation({ summary: 'Obtener todos los parentescos' })
  @Get()
  findAll() {
    return this.parentescoService.findAll();
  }

  @ApiOperation({ summary: 'Crear un nuevo parentesco' })
  @Post()
  create(@Body() createParentescoDto: CreateParentescoDto) {
    return this.parentescoService.create(createParentescoDto);
  }

  @ApiOperation({ summary: 'Obtener un parentesco por ID' })
  @ApiParam({ name: 'id', description: 'ID del parentesco' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parentescoService.findOne(+id);
  }

  @ApiOperation({ summary: 'Eliminar un parentesco' })
  @ApiParam({ name: 'id', description: 'ID del parentesco' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parentescoService.remove(+id);
  }
}
