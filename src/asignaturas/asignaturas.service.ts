import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAsignaturaDto, UpdateAsignaturaDto, AsignaturaResponse } from './dto';

@Injectable()
export class AsignaturasService {
  constructor(private prisma: PrismaService) {}


  async create(createAsignaturaDto: CreateAsignaturaDto): Promise<AsignaturaResponse> {
    const asignatura = await this.prisma.asignatura.create({
      data: createAsignaturaDto,
      include: {
        metodoEvaluacion: true,
        tipoAsignatura: true,
        sistemaEvaluacion: true,
        curso: true,
      },
    });
    return asignatura as unknown as AsignaturaResponse;
  }

  
  async findAll(): Promise<AsignaturaResponse[]> {
    return this.prisma.asignatura.findMany({
      include: {
        metodoEvaluacion: true,
        tipoAsignatura: true,
        sistemaEvaluacion: true,
        curso: true,
      },
      orderBy: { nombre: 'asc' },
    }) as unknown as AsignaturaResponse[];
  }

 
  async findOne(id: number): Promise<AsignaturaResponse> {
    const asignatura = await this.prisma.asignatura.findUnique({
      where: { id_asignatura: id },
      include: {
        metodoEvaluacion: true,
        tipoAsignatura: true,
        sistemaEvaluacion: true,
        curso: true,
      },
    });

    if (!asignatura) {
      throw new NotFoundException(`Asignatura con ID ${id} no encontrada.`);
    }

    return asignatura as unknown as AsignaturaResponse;
  }

  
  async update(id: number, updateAsignaturaDto: UpdateAsignaturaDto): Promise<AsignaturaResponse> {
    try {
      
      await this.findOne(id);
      
     
      const { id_metodo_evaluacion, id_tipo_asignatura, id_sistema_evaluacion, id_curso } = updateAsignaturaDto;
      
      
      if (id_curso !== undefined && id_curso !== null) {
        const cursoExiste = await this.prisma.curso.findUnique({
          where: { id_curso }
        });
        if (!cursoExiste) {
          throw new NotFoundException(`El curso con ID ${id_curso} no existe.`);
        }
      }
      
      
      if (id_metodo_evaluacion !== undefined && id_metodo_evaluacion !== null) {
        const metodoExiste = await this.prisma.metodo_evaluacion.findUnique({
          where: { id_metodo_evaluacion }
        });
        if (!metodoExiste) {
          throw new NotFoundException(`El método de evaluación con ID ${id_metodo_evaluacion} no existe.`);
        }
      }
      
      
      if (id_tipo_asignatura !== undefined && id_tipo_asignatura !== null) {
        const tipoExiste = await this.prisma.tipo_Asignatura.findUnique({
          where: { id_tipo_asignatura }
        });
        if (!tipoExiste) {
          throw new NotFoundException(`El tipo de asignatura con ID ${id_tipo_asignatura} no existe.`);
        }
      }
      
      
      if (id_sistema_evaluacion !== undefined && id_sistema_evaluacion !== null) {
        const sistemaExiste = await this.prisma.sistema_Evaluacion.findUnique({
          where: { id_sistema_evaluacion }
        });
        if (!sistemaExiste) {
          throw new NotFoundException(`El sistema de evaluación con ID ${id_sistema_evaluacion} no existe.`);
        }
      }

      
      const asignaturaActualizada = await this.prisma.asignatura.update({
        where: { id_asignatura: id },
        data: updateAsignaturaDto,
        include: {
          metodoEvaluacion: true,
          tipoAsignatura: true,
          sistemaEvaluacion: true,
          curso: true,
        },
      });
      
      return asignaturaActualizada as unknown as AsignaturaResponse;
    } catch (error) {
      
      if (error.status) {
        throw error;
      }
      
      
      if (error.code === 'P2025') {
        throw new NotFoundException(`La asignatura con ID ${id} no fue encontrada.`);
      } else if (error.code === 'P2003') {
        throw new ConflictException(`Error de referencia: ${error.meta?.field_name}. Asegúrate de que el ID referenciado existe.`);
      } else if (error.code === 'P2002') {
        throw new ConflictException(`Ya existe una entrada con el valor proporcionado para: ${error.meta?.target}.`);
      }
      
      
      throw new Error(`Error al actualizar la asignatura: ${error.message}`);
    }
  }


 
}