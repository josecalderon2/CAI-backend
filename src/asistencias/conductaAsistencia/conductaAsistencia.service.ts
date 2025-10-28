import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service'; // Asegúrate que esta ruta sea correcta
import { CreateConductaDto } from './dto/create-conducta.dto';
import { UpdateConductaDto } from './dto/update-conducta.dto';
import { CreateInfraccionCatalogoDto } from './dto/create-infraccion-catalogo.dto';
import { UpdateInfraccionCatalogoDto } from './dto/update-infraccion-catalogo.dto';

@Injectable()
export class ConductaAsistenciaService {
  constructor(private readonly prisma: PrismaService) {}

  // ======================================================
  // ===     Gestión de Catálogo de Infracciones        ===
  // ======================================================

  async createCatalogo(dto: CreateInfraccionCatalogoDto) {
    return this.prisma.infraccionCatalogo.create({
      data: dto,
    });
  }

  async findAllCatalogo() {
    return this.prisma.infraccionCatalogo.findMany({
      where: { activo: true },
      orderBy: [{ categoria: 'asc' }, { articulo: 'asc' }],
    });
  }

  async findOneCatalogo(id_infraccion: number) {
    const infraccion = await this.prisma.infraccionCatalogo.findUnique({
      where: { id_infraccion },
    });
    if (!infraccion) {
      throw new NotFoundException(
        `Infracción de catálogo con ID ${id_infraccion} no encontrada.`,
      );
    }
    return infraccion;
  }

  async updateCatalogo(
    id_infraccion: number,
    dto: UpdateInfraccionCatalogoDto,
  ) {
    await this.findOneCatalogo(id_infraccion); // Verifica que exista
    return this.prisma.infraccionCatalogo.update({
      where: { id_infraccion },
      data: dto,
    });
  }

  async removeCatalogo(id_infraccion: number) {
    await this.findOneCatalogo(id_infraccion); // Verifica que exista
    return this.prisma.infraccionCatalogo.update({
      where: { id_infraccion },
      data: { activo: false },
    });
  }

  // ======================================================
  // ===      Gestión de Instancias de Conducta         ===
  // ======================================================

  async create(dto: CreateConductaDto) {
    return this.prisma.conducta.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.conducta.findMany({
      include: {
        alumno: { select: { nombre: true, apellido: true } },
        infraccion: true, // Incluye la info del catálogo
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async findOne(id_conducta: number) {
    const conducta = await this.prisma.conducta.findUnique({
      where: { id_conducta },
      include: {
        alumno: true,
        infraccion: true,
        orientador: { select: { nombre: true, apellido: true } },
        asignatura: { select: { nombre: true } },
      },
    });
    if (!conducta) {
      throw new NotFoundException(
        `Registro de conducta con ID ${id_conducta} no encontrado.`,
      );
    }
    return conducta;
  }

  async findByStudent(id_alumno: number) {
    return this.prisma.conducta.findMany({
      where: { id_alumno },
      include: {
        infraccion: true,
        orientador: { select: { nombre: true, apellido: true } },
        asignatura: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async update(id_conducta: number, dto: UpdateConductaDto) {
    await this.findOne(id_conducta); // Verifica que exista
    return this.prisma.conducta.update({
      where: { id_conducta },
      data: dto,
    });
  }

  async remove(id_conducta: number) {
    await this.findOne(id_conducta); // Verifica que exista
    return this.prisma.conducta.delete({
      where: { id_conducta },
    });
  }
}
