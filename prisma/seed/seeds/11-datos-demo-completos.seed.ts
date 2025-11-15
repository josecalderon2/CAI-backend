import { PrismaClient, EstadoAsistencia } from '@prisma/client';

/**
 * Seed completo con datos realistas para DEMO
 * Incluye alumnos con todos los campos, responsables, evaluaciones con notas,
 * asistencias variadas y conductas del trimestre 1 y 2
 */
export async function seedDatosDemo(prisma: PrismaClient) {
  console.log('🔹 Seeding: Datos completos para DEMO...');

  const anio = '2025';

  // Obtener datos base necesarios
  const curso = await prisma.curso.findFirst({
    where: { nombre: 'Quinto Grado' },
  });

  const orientador = await prisma.orientador.findFirst({
    where: { email: 'orientador@colegio.edu' },
  });

  const asignaturas = await prisma.asignatura.findMany({
    where: { id_curso: curso?.id_curso },
  });

  if (!curso || !orientador || asignaturas.length === 0) {
    console.log(
      '⚠️  Datos base no encontrados. Ejecuta los seeds anteriores primero.',
    );
    return;
  }

  // Obtener parentescos
  const parentescoPadre = await prisma.parentesco.findFirst({
    where: { nombre: 'Padre' },
  });
  const parentescoMadre = await prisma.parentesco.findFirst({
    where: { nombre: 'Madre' },
  });
  const parentescoTutor = await prisma.parentesco.findFirst({
    where: { nombre: 'Tutor Legal' },
  });

  // Obtener tipos de evaluación para crear evaluaciones realistas
  const tiposEval = await prisma.tipo_evaluacion.findMany({
    where: {
      activo: true,
      nombre: {
        in: [
          'Tarea',
          'Revisión de Cuaderno',
          'Laboratorio',
          'Examen Trimestral',
        ],
      },
    },
  });

  // ====================================
  // PASO 1: CREAR RESPONSABLES REALISTAS
  // ====================================
  console.log('   👨‍👩‍👧‍👦 Creando responsables...');

  const responsables = await Promise.all([
    // Familia García Martínez
    prisma.responsable.upsert({
      where: { dui: '01234567-8' },
      update: {},
      create: {
        nombre: 'Roberto',
        apellido: 'García',
        dui: '01234567-8',
        telefono: '7890-1234',
        telefonoFijo: '2234-5678',
        email: 'roberto.garcia@email.com',
        direccion: 'Colonia Escalón, Calle Principal #123, San Salvador',
        lugarTrabajo: 'Banco Agrícola',
        profesionOficio: 'Contador Público',
        ocupacion: 'Contador Senior',
        ultimoGradoEstudiado: 'Licenciatura en Contaduría',
        religion: 'Católica',
        zonaResidencia: 'Urbana',
        estadoFamiliar: 'Casado',
        tipoDocumento: 'DUI',
        numeroDocumento: '01234567-8',
        naturalizado: false,
      },
    }),
    prisma.responsable.upsert({
      where: { dui: '01234568-9' },
      update: {},
      create: {
        nombre: 'María Elena',
        apellido: 'Martínez',
        dui: '01234568-9',
        telefono: '7890-1235',
        telefonoFijo: '2234-5678',
        email: 'maria.martinez@email.com',
        direccion: 'Colonia Escalón, Calle Principal #123, San Salvador',
        lugarTrabajo: 'Hospital Bloom',
        profesionOficio: 'Médica Pediatra',
        ocupacion: 'Doctora',
        ultimoGradoEstudiado: 'Doctorado en Medicina',
        religion: 'Católica',
        zonaResidencia: 'Urbana',
        estadoFamiliar: 'Casada',
        tipoDocumento: 'DUI',
        numeroDocumento: '01234568-9',
        naturalizado: false,
      },
    }),

    // Familia Hernández López
    prisma.responsable.upsert({
      where: { dui: '02345678-9' },
      update: {},
      create: {
        nombre: 'Carlos Alberto',
        apellido: 'Hernández',
        dui: '02345678-9',
        telefono: '7890-2234',
        telefonoFijo: '2245-6789',
        email: 'carlos.hernandez@email.com',
        direccion:
          'Colonia San Benito, Avenida La Revolución #456, San Salvador',
        lugarTrabajo: 'Empresa Constructora ABC',
        profesionOficio: 'Ingeniero Civil',
        ocupacion: 'Ingeniero de Proyectos',
        ultimoGradoEstudiado: 'Ingeniería Civil',
        religion: 'Evangélica',
        zonaResidencia: 'Urbana',
        estadoFamiliar: 'Casado',
        empresaTransporte: 'Transporte Personal',
        placaVehiculo: 'P123456',
        tipoVehiculo: 'Toyota Corolla 2020',
      },
    }),
    prisma.responsable.upsert({
      where: { dui: '02345679-0' },
      update: {},
      create: {
        nombre: 'Ana Patricia',
        apellido: 'López',
        dui: '02345679-0',
        telefono: '7890-2235',
        telefonoFijo: '2245-6789',
        email: 'ana.lopez@email.com',
        direccion:
          'Colonia San Benito, Avenida La Revolución #456, San Salvador',
        lugarTrabajo: 'Universidad Don Bosco',
        profesionOficio: 'Profesora Universitaria',
        ocupacion: 'Docente',
        ultimoGradoEstudiado: 'Maestría en Educación',
        religion: 'Evangélica',
        zonaResidencia: 'Urbana',
        estadoFamiliar: 'Casada',
      },
    }),

    // Familia Ramírez Flores
    prisma.responsable.upsert({
      where: { dui: '03456789-0' },
      update: {},
      create: {
        nombre: 'José Manuel',
        apellido: 'Ramírez',
        dui: '03456789-0',
        telefono: '7890-3234',
        telefonoFijo: '2256-7890',
        email: 'jose.ramirez@email.com',
        direccion: 'Colonia Maquilishuat, Calle Los Bambúes #789, Santa Tecla',
        lugarTrabajo: 'Súper Selectos',
        profesionOficio: 'Gerente de Tienda',
        ocupacion: 'Administrador',
        ultimoGradoEstudiado: 'Bachillerato Técnico',
        religion: 'Católica',
        zonaResidencia: 'Urbana',
        estadoFamiliar: 'Divorciado',
      },
    }),
    prisma.responsable.upsert({
      where: { dui: '03456790-1' },
      update: {},
      create: {
        nombre: 'Sofía',
        apellido: 'Flores',
        dui: '03456790-1',
        telefono: '7890-3235',
        email: 'sofia.flores@email.com',
        direccion:
          'Colonia San Antonio, Pasaje El Rosal #234, Antiguo Cuscatlán',
        lugarTrabajo: 'Clínica Dental Sonrisa',
        profesionOficio: 'Odontóloga',
        ocupacion: 'Dentista',
        ultimoGradoEstudiado: 'Doctorado en Odontología',
        religion: 'Católica',
        zonaResidencia: 'Urbana',
        estadoFamiliar: 'Divorciada',
      },
    }),

    // Familia Morales Cruz (monoparental)
    prisma.responsable.upsert({
      where: { dui: '04567890-1' },
      update: {},
      create: {
        nombre: 'Patricia',
        apellido: 'Cruz',
        dui: '04567890-1',
        telefono: '7890-4234',
        telefonoFijo: '2267-8901',
        email: 'patricia.cruz@email.com',
        direccion: 'Colonia Miramonte, Calle Los Pinos #321, San Salvador',
        lugarTrabajo: 'Ministerio de Educación',
        profesionOficio: 'Secretaria Administrativa',
        ocupacion: 'Secretaria',
        ultimoGradoEstudiado: 'Técnico en Secretariado',
        religion: 'Cristiana',
        zonaResidencia: 'Urbana',
        estadoFamiliar: 'Soltera',
      },
    }),

    // Familia Vásquez Mejía (con tutor legal - abuelos)
    prisma.responsable.upsert({
      where: { dui: '05678901-2' },
      update: {},
      create: {
        nombre: 'Ricardo',
        apellido: 'Vásquez',
        dui: '05678901-2',
        telefono: '7890-5234',
        telefonoFijo: '2278-9012',
        email: 'ricardo.vasquez@email.com',
        direccion: 'Colonia Las Palmas, Avenida Los Laureles #567, Soyapango',
        lugarTrabajo: 'Jubilado - Ex empleado de CEL',
        profesionOficio: 'Técnico Electricista',
        ocupacion: 'Jubilado',
        ultimoGradoEstudiado: 'Bachillerato',
        religion: 'Católica',
        zonaResidencia: 'Urbana',
        estadoFamiliar: 'Casado',
      },
    }),
  ]);

  console.log(`   ✅ ${responsables.length} responsables creados`);

  // ====================================
  // PASO 2: CREAR ALUMNOS REALISTAS CON TODOS LOS CAMPOS
  // ====================================
  console.log('   👦👧 Creando alumnos con datos completos...');

  type AlumnoCreado = Awaited<ReturnType<typeof prisma.alumno.upsert>>;
  const alumnos: AlumnoCreado[] = [];

  const alumnosData = [
    {
      // Alumno 1: Daniela García Martínez
      nombre: 'Daniela',
      apellido: 'García Martínez',
      genero: 'F',
      fechaNacimiento: '15/03/2014',
      nacionalidad: 'Salvadoreña',
      edad: 11,
      partidaNumero: '12345',
      folio: '234',
      libro: '15',
      anioPartida: '2014',
      departamentoNacimiento: 'San Salvador',
      municipioNacimiento: 'San Salvador',
      tipoSangre: 'O+',
      problemaFisico: 'Ninguno',
      observacionesMedicas: 'Alérgica al polen',
      centroAsistencial: 'Hospital de Diagnóstico',
      medicoNombre: 'Dr. Juan Pérez',
      medicoTelefono: '2222-3333',
      zonaResidencia: 'Urbana',
      direccion: 'Colonia Escalón, Calle Principal #123',
      municipio: 'San Salvador',
      departamento: 'San Salvador',
      distanciaKM: 5.5,
      medioTransporte: 'Automóvil particular',
      encargadoTransporte: 'Padre',
      encargadoTelefono: '7890-1234',
      repiteGrado: false,
      condicionado: false,
      activo: true,
      anioEscolar: anio,
      numeroMatricula: 'MAT-2025-0011',
      fechaMatricula: new Date('2025-01-08'),
      estadoMatricula: 'INSCRITO',
      autorizaAtencionMedica: true,
      autorizaUsoImagen: true,
      autorizaActividadesReligiosas: true,
      usaTransporteEscolar: false,
      religion: 'Católica',
      responsables: [
        {
          responsable: responsables[0],
          parentesco: parentescoPadre,
          esPrincipal: true,
        },
        {
          responsable: responsables[1],
          parentesco: parentescoMadre,
          esPrincipal: false,
        },
      ],
      detalle: {
        viveCon: 'Ambos padres',
        dependenciaEconomica: 'Padres',
        capacidadPago: true,
        tieneHermanosEnColegio: true,
        hermanosEnColegio: [{ nombre: 'Luis García', grado: '8° Grado' }],
        emergencia1Nombre: 'Roberto García',
        emergencia1Parentesco: 'Padre',
        emergencia1Telefono: '7890-1234',
        emergencia2Nombre: 'María Elena Martínez',
        emergencia2Parentesco: 'Madre',
        emergencia2Telefono: '7890-1235',
        tenenciaVivienda: 'Propia',
      },
    },
    {
      // Alumno 2: Miguel Hernández López
      nombre: 'Miguel Ángel',
      apellido: 'Hernández López',
      genero: 'M',
      fechaNacimiento: '22/07/2013',
      nacionalidad: 'Salvadoreño',
      edad: 11,
      partidaNumero: '23456',
      folio: '345',
      libro: '18',
      anioPartida: '2013',
      departamentoNacimiento: 'La Libertad',
      municipioNacimiento: 'Santa Tecla',
      tipoSangre: 'A+',
      problemaFisico: 'Usa lentes',
      observacionesMedicas: 'Miopía moderada, control oftalmológico semestral',
      centroAsistencial: 'Hospital Rosales',
      medicoNombre: 'Dra. Carmen Mejía',
      medicoTelefono: '2333-4444',
      zonaResidencia: 'Urbana',
      direccion: 'Colonia San Benito, Avenida La Revolución #456',
      municipio: 'San Salvador',
      departamento: 'San Salvador',
      distanciaKM: 3.2,
      medioTransporte: 'Automóvil particular',
      encargadoTransporte: 'Madre',
      encargadoTelefono: '7890-2235',
      repiteGrado: false,
      condicionado: false,
      activo: true,
      anioEscolar: anio,
      numeroMatricula: 'MAT-2025-0012',
      fechaMatricula: new Date('2025-01-09'),
      estadoMatricula: 'INSCRITO',
      autorizaAtencionMedica: true,
      autorizaUsoImagen: true,
      autorizaActividadesReligiosas: true,
      usaTransporteEscolar: false,
      religion: 'Evangélica',
      responsables: [
        {
          responsable: responsables[2],
          parentesco: parentescoPadre,
          esPrincipal: true,
        },
        {
          responsable: responsables[3],
          parentesco: parentescoMadre,
          esPrincipal: false,
        },
      ],
      detalle: {
        viveCon: 'Ambos padres',
        dependenciaEconomica: 'Padres',
        capacidadPago: true,
        tieneHermanosEnColegio: false,
        emergencia1Nombre: 'Carlos Alberto Hernández',
        emergencia1Parentesco: 'Padre',
        emergencia1Telefono: '7890-2234',
        emergencia2Nombre: 'Ana Patricia López',
        emergencia2Parentesco: 'Madre',
        emergencia2Telefono: '7890-2235',
        tenenciaVivienda: 'Propia',
      },
    },
    {
      // Alumno 3: Valeria Ramírez Flores (padres divorciados)
      nombre: 'Valeria',
      apellido: 'Ramírez Flores',
      genero: 'F',
      fechaNacimiento: '10/11/2013',
      nacionalidad: 'Salvadoreña',
      edad: 11,
      partidaNumero: '34567',
      folio: '456',
      libro: '20',
      anioPartida: '2013',
      departamentoNacimiento: 'San Salvador',
      municipioNacimiento: 'Antiguo Cuscatlán',
      tipoSangre: 'B+',
      problemaFisico: 'Ninguno',
      observacionesMedicas: 'Saludable',
      centroAsistencial: 'Clínica Escalón',
      medicoNombre: 'Dr. Fernando Rivas',
      medicoTelefono: '2444-5555',
      zonaResidencia: 'Urbana',
      direccion: 'Colonia Maquilishuat, Calle Los Bambúes #789',
      municipio: 'Santa Tecla',
      departamento: 'La Libertad',
      distanciaKM: 8.0,
      medioTransporte: 'Transporte escolar',
      encargadoTransporte: 'Bus escolar #5',
      encargadoTelefono: '7000-5555',
      repiteGrado: false,
      condicionado: false,
      activo: true,
      anioEscolar: anio,
      numeroMatricula: 'MAT-2025-0013',
      fechaMatricula: new Date('2025-01-10'),
      estadoMatricula: 'INSCRITO',
      autorizaAtencionMedica: true,
      autorizaUsoImagen: false,
      autorizaActividadesReligiosas: true,
      usaTransporteEscolar: true,
      religion: 'Católica',
      responsables: [
        {
          responsable: responsables[4],
          parentesco: parentescoPadre,
          esPrincipal: true,
        },
        {
          responsable: responsables[5],
          parentesco: parentescoMadre,
          esPrincipal: false,
        },
      ],
      detalle: {
        viveCon: 'Madre (padres divorciados)',
        dependenciaEconomica: 'Ambos padres',
        capacidadPago: true,
        tieneHermanosEnColegio: false,
        emergencia1Nombre: 'José Manuel Ramírez',
        emergencia1Parentesco: 'Padre',
        emergencia1Telefono: '7890-3234',
        emergencia2Nombre: 'Sofía Flores',
        emergencia2Parentesco: 'Madre',
        emergencia2Telefono: '7890-3235',
        tenenciaVivienda: 'Alquilada',
      },
    },
    {
      // Alumno 4: Andrés Morales Cruz (familia monoparental)
      nombre: 'Andrés',
      apellido: 'Morales Cruz',
      genero: 'M',
      fechaNacimiento: '05/01/2014',
      nacionalidad: 'Salvadoreño',
      edad: 11,
      partidaNumero: '45678',
      folio: '567',
      libro: '22',
      anioPartida: '2014',
      departamentoNacimiento: 'San Salvador',
      municipioNacimiento: 'San Salvador',
      tipoSangre: 'AB+',
      problemaFisico: 'Asma leve',
      observacionesMedicas:
        'Asma controlada con medicamento, evitar ejercicio intenso',
      centroAsistencial: 'Hospital Bloom',
      medicoNombre: 'Dr. Luis Salazar',
      medicoTelefono: '2555-6666',
      zonaResidencia: 'Urbana',
      direccion: 'Colonia Miramonte, Calle Los Pinos #321',
      municipio: 'San Salvador',
      departamento: 'San Salvador',
      distanciaKM: 6.5,
      medioTransporte: 'Transporte escolar',
      encargadoTransporte: 'Bus escolar #3',
      encargadoTelefono: '7000-3333',
      repiteGrado: false,
      condicionado: false,
      activo: true,
      anioEscolar: anio,
      numeroMatricula: 'MAT-2025-0014',
      fechaMatricula: new Date('2025-01-11'),
      estadoMatricula: 'INSCRITO',
      autorizaAtencionMedica: true,
      autorizaUsoImagen: true,
      autorizaActividadesReligiosas: true,
      usaTransporteEscolar: true,
      religion: 'Cristiana',
      responsables: [
        {
          responsable: responsables[6],
          parentesco: parentescoMadre,
          esPrincipal: true,
        },
      ],
      detalle: {
        viveCon: 'Madre soltera',
        dependenciaEconomica: 'Madre',
        capacidadPago: false,
        tieneHermanosEnColegio: true,
        hermanosEnColegio: [{ nombre: 'Laura Morales', grado: '3° Grado' }],
        emergencia1Nombre: 'Patricia Cruz',
        emergencia1Parentesco: 'Madre',
        emergencia1Telefono: '7890-4234',
        emergencia2Nombre: 'Rosa Cruz',
        emergencia2Parentesco: 'Abuela',
        emergencia2Telefono: '7890-4200',
        tenenciaVivienda: 'Alquilada',
      },
    },
    {
      // Alumno 5: Gabriela Vásquez Mejía (criada por abuelo - tutor legal)
      nombre: 'Gabriela',
      apellido: 'Vásquez Mejía',
      genero: 'F',
      fechaNacimiento: '18/09/2013',
      nacionalidad: 'Salvadoreña',
      edad: 11,
      partidaNumero: '56789',
      folio: '678',
      libro: '24',
      anioPartida: '2013',
      departamentoNacimiento: 'San Salvador',
      municipioNacimiento: 'Soyapango',
      tipoSangre: 'O-',
      problemaFisico: 'Ninguno',
      observacionesMedicas: 'Saludable',
      centroAsistencial: 'Hospital Zacamil',
      medicoNombre: 'Dra. Elena Torres',
      medicoTelefono: '2666-7777',
      zonaResidencia: 'Urbana',
      direccion: 'Colonia Las Palmas, Avenida Los Laureles #567',
      municipio: 'Soyapango',
      departamento: 'San Salvador',
      distanciaKM: 10.5,
      medioTransporte: 'Bus urbano',
      encargadoTransporte: 'Abuelo',
      encargadoTelefono: '7890-5234',
      repiteGrado: false,
      condicionado: false,
      activo: true,
      anioEscolar: anio,
      numeroMatricula: 'MAT-2025-0015',
      fechaMatricula: new Date('2025-01-12'),
      estadoMatricula: 'INSCRITO',
      autorizaAtencionMedica: true,
      autorizaUsoImagen: true,
      autorizaActividadesReligiosas: true,
      usaTransporteEscolar: false,
      religion: 'Católica',
      responsables: [
        {
          responsable: responsables[7],
          parentesco: parentescoTutor,
          esPrincipal: true,
        },
      ],
      detalle: {
        viveCon: 'Abuelos (tutor legal)',
        dependenciaEconomica: 'Abuelo',
        capacidadPago: false,
        tieneHermanosEnColegio: false,
        emergencia1Nombre: 'Ricardo Vásquez',
        emergencia1Parentesco: 'Abuelo/Tutor',
        emergencia1Telefono: '7890-5234',
        emergencia2Nombre: 'Martha Mejía',
        emergencia2Parentesco: 'Abuela',
        emergencia2Telefono: '7890-5235',
        tenenciaVivienda: 'Propia',
      },
    },
  ];

  for (const alumnoData of alumnosData) {
    const alumno = await prisma.alumno.upsert({
      where: { numeroMatricula: alumnoData.numeroMatricula },
      update: {},
      create: {
        nombre: alumnoData.nombre,
        apellido: alumnoData.apellido,
        genero: alumnoData.genero,
        fechaNacimiento: alumnoData.fechaNacimiento,
        nacionalidad: alumnoData.nacionalidad,
        edad: alumnoData.edad,
        partidaNumero: alumnoData.partidaNumero,
        folio: alumnoData.folio,
        libro: alumnoData.libro,
        anioPartida: alumnoData.anioPartida,
        departamentoNacimiento: alumnoData.departamentoNacimiento,
        municipioNacimiento: alumnoData.municipioNacimiento,
        tipoSangre: alumnoData.tipoSangre,
        problemaFisico: alumnoData.problemaFisico,
        observacionesMedicas: alumnoData.observacionesMedicas,
        centroAsistencial: alumnoData.centroAsistencial,
        medicoNombre: alumnoData.medicoNombre,
        medicoTelefono: alumnoData.medicoTelefono,
        zonaResidencia: alumnoData.zonaResidencia,
        direccion: alumnoData.direccion,
        municipio: alumnoData.municipio,
        departamento: alumnoData.departamento,
        distanciaKM: alumnoData.distanciaKM,
        medioTransporte: alumnoData.medioTransporte,
        encargadoTransporte: alumnoData.encargadoTransporte,
        encargadoTelefono: alumnoData.encargadoTelefono,
        repiteGrado: alumnoData.repiteGrado,
        condicionado: alumnoData.condicionado,
        activo: alumnoData.activo,
        anioEscolar: alumnoData.anioEscolar,
        numeroMatricula: alumnoData.numeroMatricula,
        fechaMatricula: alumnoData.fechaMatricula,
        estadoMatricula: alumnoData.estadoMatricula,
        autorizaAtencionMedica: alumnoData.autorizaAtencionMedica,
        autorizaUsoImagen: alumnoData.autorizaUsoImagen,
        autorizaActividadesReligiosas: alumnoData.autorizaActividadesReligiosas,
        usaTransporteEscolar: alumnoData.usaTransporteEscolar,
        religion: alumnoData.religion,
      },
    });

    // Crear detalle del alumno
    if (alumnoData.detalle) {
      await prisma.alumno_Detalle.upsert({
        where: { alumnoId: alumno.id_alumno },
        update: {},
        create: {
          alumnoId: alumno.id_alumno,
          ...alumnoData.detalle,
          hermanosEnColegio: alumnoData.detalle.hermanosEnColegio as any,
        },
      });
    }

    // Asignar responsables
    for (const rel of alumnoData.responsables) {
      await prisma.alumnoResponsable.upsert({
        where: {
          alumnoId_responsableId: {
            alumnoId: alumno.id_alumno,
            responsableId: rel.responsable.id_responsable,
          },
        },
        update: {},
        create: {
          alumnoId: alumno.id_alumno,
          responsableId: rel.responsable.id_responsable,
          parentescoId: rel.parentesco?.id_parentesco,
          esPrincipal: rel.esPrincipal,
          firma: true,
          permiteTraslado: true,
          puedeRetirarAlumno: true,
          contactoEmergencia: true,
        },
      });
    }

    // Inscribir en el curso
    await prisma.alumnoCurso.upsert({
      where: {
        alumnoId_cursoId_anioAcademico: {
          alumnoId: alumno.id_alumno,
          cursoId: curso.id_curso,
          anioAcademico: anio,
        },
      },
      update: {},
      create: {
        alumnoId: alumno.id_alumno,
        cursoId: curso.id_curso,
        anioAcademico: anio,
        estado: 'ACTIVO',
        fechaInscripcion: alumnoData.fechaMatricula,
      },
    });

    alumnos.push(alumno);
  }

  console.log(`   ✅ ${alumnos.length} alumnos creados con datos completos`);

  // ====================================
  // PASO 3: CREAR EVALUACIONES CON NOTAS (Trimestre 1 - Enero a Abril)
  // ====================================
  console.log('   📝 Creando evaluaciones y notas del trimestre 1...');

  let evaluacionesCreadas = 0;
  let notasCreadas = 0;

  // Crear evaluaciones para cada asignatura en diferentes meses
  for (const asignatura of asignaturas) {
    // Enero - Tarea
    const tipoTarea = tiposEval.find((t) => t.nombre === 'Tarea');
    if (tipoTarea) {
      const evalEnero = await prisma.evaluacion.create({
        data: {
          nombre: `Tarea - Enero ${asignatura.nombre}`,
          puntaje_maximo: 10,
          puntaje_minimo: 0,
          id_tipo_evaluacion: tipoTarea.id_tipo_evaluacion,
          id_asignatura: asignatura.id_asignatura,
          id_orientador: orientador.id_orientador,
          anio_academico: anio,
          mes: 1,
          trimestre: 1,
        },
      });
      evaluacionesCreadas++;

      // Crear notas para todos los alumnos
      for (const alumno of alumnos) {
        await prisma.notas.create({
          data: {
            id_asignatura: asignatura.id_asignatura,
            id_evaluacion: evalEnero.id_evaluacion,
            id_alumno: alumno.id_alumno,
            calificacion:
              Math.random() > 0.2
                ? parseFloat((Math.random() * 3 + 7).toFixed(2))
                : parseFloat((Math.random() * 2 + 5).toFixed(2)),
            fecha_registro: new Date('2025-01-28'),
            trimestre: '1',
          },
        });
        notasCreadas++;
      }
    }

    // Febrero - Revisión de cuaderno
    const tipoRevision = tiposEval.find(
      (t) => t.nombre === 'Revisión de Cuaderno',
    );
    if (tipoRevision) {
      const evalFebrero = await prisma.evaluacion.create({
        data: {
          nombre: `Revisión de Cuaderno - Febrero ${asignatura.nombre}`,
          puntaje_maximo: 10,
          puntaje_minimo: 0,
          id_tipo_evaluacion: tipoRevision.id_tipo_evaluacion,
          id_asignatura: asignatura.id_asignatura,
          id_orientador: orientador.id_orientador,
          anio_academico: anio,
          mes: 2,
          trimestre: 1,
        },
      });
      evaluacionesCreadas++;

      for (const alumno of alumnos) {
        await prisma.notas.create({
          data: {
            id_asignatura: asignatura.id_asignatura,
            id_evaluacion: evalFebrero.id_evaluacion,
            id_alumno: alumno.id_alumno,
            calificacion: parseFloat((Math.random() * 2 + 8).toFixed(2)),
            fecha_registro: new Date('2025-02-25'),
            trimestre: '1',
          },
        });
        notasCreadas++;
      }
    }

    // Marzo - Laboratorio/Actividad práctica
    const tipoLab = tiposEval.find((t) => t.nombre === 'Laboratorio');
    if (tipoLab) {
      const evalMarzo = await prisma.evaluacion.create({
        data: {
          nombre: `Laboratorio - Marzo ${asignatura.nombre}`,
          puntaje_maximo: 10,
          puntaje_minimo: 0,
          id_tipo_evaluacion: tipoLab.id_tipo_evaluacion,
          id_asignatura: asignatura.id_asignatura,
          id_orientador: orientador.id_orientador,
          anio_academico: anio,
          mes: 3,
          trimestre: 1,
        },
      });
      evaluacionesCreadas++;

      for (const alumno of alumnos) {
        await prisma.notas.create({
          data: {
            id_asignatura: asignatura.id_asignatura,
            id_evaluacion: evalMarzo.id_evaluacion,
            id_alumno: alumno.id_alumno,
            calificacion: parseFloat((Math.random() * 2.5 + 7.5).toFixed(2)),
            fecha_registro: new Date('2025-03-20'),
            trimestre: '1',
          },
        });
        notasCreadas++;
      }
    }

    // Abril - Examen Trimestral
    const tipoExamen = tiposEval.find((t) => t.nombre === 'Examen Trimestral');
    if (tipoExamen) {
      const evalAbril = await prisma.evaluacion.create({
        data: {
          nombre: `Examen Trimestral - ${asignatura.nombre}`,
          puntaje_maximo: 10,
          puntaje_minimo: 0,
          id_tipo_evaluacion: tipoExamen.id_tipo_evaluacion,
          id_asignatura: asignatura.id_asignatura,
          id_orientador: orientador.id_orientador,
          anio_academico: anio,
          mes: 4,
          trimestre: 1,
        },
      });
      evaluacionesCreadas++;

      for (const alumno of alumnos) {
        await prisma.notas.create({
          data: {
            id_asignatura: asignatura.id_asignatura,
            id_evaluacion: evalAbril.id_evaluacion,
            id_alumno: alumno.id_alumno,
            calificacion: parseFloat((Math.random() * 3 + 6.5).toFixed(2)),
            fecha_registro: new Date('2025-04-25'),
            trimestre: '1',
          },
        });
        notasCreadas++;
      }
    }
  }

  console.log(
    `   ✅ ${evaluacionesCreadas} evaluaciones y ${notasCreadas} notas creadas`,
  );

  // ====================================
  // PASO 4: CREAR ASISTENCIAS VARIADAS (Enero - Marzo)
  // ====================================
  console.log('   📅 Creando asistencias del trimestre 1...');

  const fechasAsistencia = [
    // Enero 2025
    new Date('2025-01-15T08:00:00Z'),
    new Date('2025-01-22T08:00:00Z'),
    new Date('2025-01-29T08:00:00Z'),
    // Febrero 2025
    new Date('2025-02-05T08:00:00Z'),
    new Date('2025-02-12T08:00:00Z'),
    new Date('2025-02-19T08:00:00Z'),
    new Date('2025-02-26T08:00:00Z'),
    // Marzo 2025
    new Date('2025-03-05T08:00:00Z'),
    new Date('2025-03-12T08:00:00Z'),
    new Date('2025-03-19T08:00:00Z'),
    new Date('2025-03-26T08:00:00Z'),
  ];

  let asistenciasCreadas = 0;

  for (const fecha of fechasAsistencia) {
    for (let i = 0; i < alumnos.length; i++) {
      const alumno = alumnos[i];
      let estado: EstadoAsistencia;
      let observacion: string | undefined;

      // Crear variedad realista de asistencias
      const rand = Math.random();
      if (rand > 0.95) {
        // 5% ausencias injustificadas
        estado = EstadoAsistencia.SP;
        observacion = 'Ausencia sin justificar';
      } else if (rand > 0.9) {
        // 5% ausencias justificadas
        estado = EstadoAsistencia.E;
        observacion = 'Cita médica / Enfermedad justificada';
      } else if (rand > 0.85) {
        // 5% tardanzas
        estado = EstadoAsistencia.A;
        observacion = 'Llegó tarde';
      } else {
        // 85% presentes
        estado = EstadoAsistencia.P;
      }

      const existe = await prisma.asistencia.findUnique({
        where: {
          id_alumno_fecha: {
            id_alumno: alumno.id_alumno,
            fecha: fecha,
          },
        },
      });

      if (!existe) {
        await prisma.asistencia.create({
          data: {
            id_alumno: alumno.id_alumno,
            id_orientador: orientador.id_orientador,
            fecha: fecha,
            estado: estado,
            observacion: observacion,
            anio_academico: anio,
            trimestre: 1,
          },
        });
        asistenciasCreadas++;
      }
    }
  }

  console.log(`   ✅ ${asistenciasCreadas} asistencias creadas`);

  // ====================================
  // PASO 5: CREAR CONDUCTAS (INFRACCIONES) REALISTAS
  // ====================================
  console.log('   ⚠️  Creando conductas/infracciones...');

  const infracciones = await prisma.infraccionCatalogo.findMany({
    where: { activo: true },
  });

  let conductasCreadas = 0;

  if (infracciones.length > 0 && alumnos.length >= 3) {
    const conductasData = [
      {
        alumno: alumnos[2], // Valeria
        infraccion: infracciones.find((i) => i.articulo === 'MG-001'),
        fecha: new Date('2025-02-10T09:00:00Z'),
        observacion: 'Uniforme incompleto - sin corbata',
      },
      {
        alumno: alumnos[3], // Andrés
        infraccion: infracciones.find((i) => i.articulo === 'MG-003'),
        fecha: new Date('2025-02-15T10:30:00Z'),
        observacion: 'No entregó tarea de matemáticas',
      },
      {
        alumno: alumnos[3], // Andrés (segunda infracción)
        infraccion: infracciones.find((i) => i.articulo === 'G-006'),
        fecha: new Date('2025-03-05T14:00:00Z'),
        observacion: 'Uso de celular durante clase',
      },
      {
        alumno: alumnos[4], // Gabriela
        infraccion: infracciones.find((i) => i.articulo === 'MG-002'),
        fecha: new Date('2025-03-18T08:30:00Z'),
        observacion: 'Vocabulario inapropiado en recreo',
      },
    ];

    for (const c of conductasData) {
      if (c.infraccion) {
        await prisma.conducta.create({
          data: {
            id_alumno: c.alumno.id_alumno,
            id_orientador: orientador.id_orientador,
            id_asignatura: asignaturas[0].id_asignatura,
            id_infraccion_catalogo: c.infraccion.id_infraccion,
            fecha: c.fecha,
            observacion: c.observacion,
            anio_academico: anio,
            trimestre: 1,
          },
        });
        conductasCreadas++;
      }
    }
  }

  console.log(`   ✅ ${conductasCreadas} conductas/infracciones creadas`);

  console.log('\n✅ Datos completos para DEMO creados exitosamente!');
  console.log('   📊 Resumen:');
  console.log(`      - ${responsables.length} responsables`);
  console.log(`      - ${alumnos.length} alumnos con datos completos`);
  console.log(`      - ${evaluacionesCreadas} evaluaciones`);
  console.log(`      - ${notasCreadas} notas/calificaciones`);
  console.log(`      - ${asistenciasCreadas} registros de asistencia`);
  console.log(`      - ${conductasCreadas} conductas/infracciones`);
}
