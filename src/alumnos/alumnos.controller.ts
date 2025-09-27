// src/alumnos/alumnos.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport'; // 👈 JWT guard
import { RolesGuard } from '../auth/roles.guard'; // 👈 Roles guard
import { Roles } from '../auth/roles.decorator';
import { AlumnosService } from './alumnos.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';

@ApiTags('Alumnos')
@ApiBearerAuth('JWT-auth') // 👈 Debe coincidir con el nombre en main.ts
@UseGuards(AuthGuard('jwt'), RolesGuard) // 👈 Activa seguridad para TODO el controller
@Controller('alumnos')
export class AlumnosController {
  constructor(private readonly alumnosService: AlumnosService) {}

  @Roles('Admin', 'P.A')
  @Post()
  create(@Body() dto: CreateAlumnoDto) {
    return this.alumnosService.create(dto);
  }

  @Roles('Admin', 'P.A', 'Orientador')
  @Get()
  findAll() {
    return this.alumnosService.findAllActive();
  }

  @Roles('Admin', 'P.A', 'Orientador')
  @Get('activos')
  findAllActive() {
    return this.alumnosService.findAllActive();
  }

  @Roles('Admin', 'P.A')
  @Get('inactivos')
  findAllInactive() {
    return this.alumnosService.findAllInactive();
  }

  @Roles('Admin', 'P.A', 'Orientador')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.findOne(id);
  }

  @Roles('Admin', 'P.A')
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAlumnoDto) {
    return this.alumnosService.update(id, dto);
  }

  @Roles('Admin', 'P.A')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.remove(id);
  }

  @Roles('Admin') // 👈 Solo Admin
  @Patch(':id/activar')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.alumnosService.activate(id);
  }
}
