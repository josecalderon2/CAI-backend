import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GradoAcademicoService } from './grado-academico.service';
import { CreateGradoAcademicoDto } from './dto/create-grado-academico.dto';
import { UpdateGradoAcademicoDto } from './dto/update-grado-academico.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('GradoAcademico')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('grado-academico')
export class GradoAcademicoController {
  constructor(private readonly service: GradoAcademicoService) {}

  @Roles('Admin')
  @Post()
  @ApiCreatedResponse({ description: 'Grado académico creado' })
  create(@Body() dto: CreateGradoAcademicoDto) {
    return this.service.create(dto);
  }

  @Roles('Admin')
  @Get()
  @ApiOkResponse({ description: 'Lista de grados académicos' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'q', required: false })
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Roles('Admin')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles('Admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGradoAcademicoDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles('Admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
