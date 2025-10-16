// src/import/dto/import-context.dto.ts

import { IsString, IsNotEmpty, IsNumberString, IsInt } from 'class-validator';

/**
 * Data Transfer Object (DTO) utilizado para recibir los parámetros
 * obligatorios del body de la solicitud HTTP al importar notas.
 * * NOTA: Los valores recibidos de un formulario multipart/form-data
 * (usado para subir archivos) se tratan inicialmente como strings,
 * por eso usamos @IsNumberString para los IDs.
 */
export class ImportContextDto {
  @IsNumberString()
  @IsNotEmpty({ message: 'El ID de la asignatura es obligatorio.' })
  /**
   * El ID de la Asignatura a la que pertenecen las notas.
   * Ejemplo: "12"
   */
  idAsignatura: string;

  @IsString()
  @IsNotEmpty({ message: 'El trimestre o período es obligatorio.' })
  /**
   * El trimestre al que corresponden las notas.
   * Ejemplo: 'I', 'II' o 'III'.
   */
  trimestre: string;
}

/**
 * Interfaz utilizada internamente por el servicio (ImportService)
 * una vez que los IDs han sido convertidos a números.
 */
export interface ImportContext {
  idAsignatura: number;
  trimestre: string;
}
