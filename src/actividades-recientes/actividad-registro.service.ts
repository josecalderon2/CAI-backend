import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ActividadesRecientesService } from '../actividades-recientes/actividades-recientes.service';

@Injectable()
export class ActividadRegistroService {
  constructor(
    @Inject(forwardRef(() => ActividadesRecientesService))
    private readonly actividadesRecientesService: ActividadesRecientesService,
  ) {}

  /**
   * Registra una actividad de creación de un alumno
   * @param alumnoId ID del alumno creado
   * @param nombre Nombre completo del alumno
   * @param usuario Email del usuario que realizó la acción
   */
  async registrarCreacionAlumno(
    alumnoId: number,
    nombre: string,
    usuario?: string,
  ): Promise<void> {
    await this.actividadesRecientesService.registrarActividad({
      descripcion: `Alumno ${nombre} matriculado exitosamente`,
      tipo: 'success',
      entidad: 'alumno',
      entidad_id: alumnoId,
      usuario,
    });
  }

  /**
   * Registra una actividad de actualización de un alumno
   * @param alumnoId ID del alumno actualizado
   * @param nombre Nombre completo del alumno
   * @param usuario Email del usuario que realizó la acción
   */
  async registrarActualizacionAlumno(
    alumnoId: number,
    nombre: string,
    usuario?: string,
  ): Promise<void> {
    await this.actividadesRecientesService.registrarActividad({
      descripcion: `Información del alumno ${nombre} actualizada`,
      tipo: 'info',
      entidad: 'alumno',
      entidad_id: alumnoId,
      usuario,
    });
  }

  /**
   * Registra una actividad de creación de un responsable
   * @param responsableId ID del responsable creado
   * @param nombre Nombre completo del responsable
   * @param usuario Email del usuario que realizó la acción
   */
  async registrarCreacionResponsable(
    responsableId: number,
    nombre: string,
    usuario?: string,
  ): Promise<void> {
    await this.actividadesRecientesService.registrarActividad({
      descripcion: `Nuevo responsable ${nombre} registrado`,
      tipo: 'success',
      entidad: 'responsable',
      entidad_id: responsableId,
      usuario,
    });
  }

  /**
   * Registra una actividad de asignación de nota
   * @param alumnoId ID del alumno
   * @param nombreAlumno Nombre del alumno
   * @param asignatura Nombre de la asignatura
   * @param calificacion Calificación asignada
   * @param usuario Email del usuario que realizó la acción
   */
  async registrarNuevaCalificacion(
    alumnoId: number,
    nombreAlumno: string,
    asignatura: string,
    calificacion: number,
    usuario?: string,
  ): Promise<void> {
    await this.actividadesRecientesService.registrarActividad({
      descripcion: `Nueva calificación de ${calificacion} en ${asignatura} para ${nombreAlumno}`,
      tipo: 'info',
      entidad: 'alumno',
      entidad_id: alumnoId,
      usuario,
    });
  }

  /**
   * Registra una actividad de inicio de sesión
   * @param usuario Email del usuario
   * @param rol Rol del usuario (admin, orientador, etc.)
   */
  async registrarInicioSesion(usuario: string, rol: string): Promise<void> {
    await this.actividadesRecientesService.registrarActividad({
      descripcion: `Inicio de sesión de ${usuario} (${rol})`,
      tipo: 'info',
      usuario,
    });
  }
}
