import { PrismaClient, CategoriaInfraccion, Prisma } from '@prisma/client';

export async function seedInfracciones(prisma: PrismaClient) {
  console.log('🔹 Seeding: Catálogo de Infracciones...');

  const infraccionesData: Prisma.InfraccionCatalogoCreateInput[] = [
    // --- Menos Graves (1 punto) ---
    {
      categoria: CategoriaInfraccion.MENOS_GRAVE,
      articulo: 'MG-001',
      descripcion: 'Presentación personal indecorosa o uniforme incompleto',
      puntos: 1,
    },
    {
      categoria: CategoriaInfraccion.MENOS_GRAVE,
      articulo: 'MG-002',
      descripcion: 'Llegada tardía (Acumulación)',
      puntos: 1,
    },
    {
      categoria: CategoriaInfraccion.MENOS_GRAVE,
      articulo: 'MG-003',
      descripcion: 'Incumplimiento de tareas',
      puntos: 1,
    },
    {
      categoria: CategoriaInfraccion.MENOS_GRAVE,
      articulo: 'MG-004',
      descripcion: 'Uso de lenguaje inadecuado (sobrenombres, vulgar)',
      puntos: 1,
    },

    // --- Graves (3 puntos) ---
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-001',
      descripcion: 'Uso de maquillaje, tinte o uñas acrílicas',
      puntos: 3,
    },
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-002',
      descripcion: 'Manifestaciones de noviazgo',
      puntos: 3,
    },
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-003',
      descripcion: 'Dañar mobiliario o infraestructura',
      puntos: 3,
    },
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-004',
      descripcion: 'Falta de respeto al personal (docente, admin, etc.)',
      puntos: 3,
    },
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-005',
      descripcion: 'Intento de fraude en tareas o trabajos',
      puntos: 3,
    },
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-006',
      descripcion: 'Uso de celular sin permiso en clase',
      puntos: 3,
    },
    {
      categoria: CategoriaInfraccion.GRAVE,
      articulo: 'G-007',
      descripcion: 'Falta de respeto (Artículo 5.1.3 literal e) - Peso 0.3',
      puntos: 0.3,
    },

    // --- Muy Graves (5 puntos) ---
    {
      categoria: CategoriaInfraccion.MUY_GRAVE,
      articulo: 'MGV-001',
      descripcion: 'Abandonar el colegio sin autorización',
      puntos: 5,
    },
    {
      categoria: CategoriaInfraccion.MUY_GRAVE,
      articulo: 'MGV-002',
      descripcion: 'Hurto o robo de pertenencias',
      puntos: 5,
    },
    {
      categoria: CategoriaInfraccion.MUY_GRAVE,
      articulo: 'MGV-003',
      descripcion: 'Agresión física o verbal (Atentar contra la integridad)',
      puntos: 5,
    },
    {
      categoria: CategoriaInfraccion.MUY_GRAVE,
      articulo: 'MGV-004',
      descripcion: 'Acoso escolar (Bullying)',
      puntos: 5,
    },
    {
      categoria: CategoriaInfraccion.MUY_GRAVE,
      articulo: 'MGV-005',
      descripcion: 'Introducir/ingerir alcohol o sustancias prohibidas',
      puntos: 5,
    },
    {
      categoria: CategoriaInfraccion.MUY_GRAVE,
      articulo: 'MGV-006',
      descripcion: 'Fraude comprobado en exámenes',
      puntos: 5,
    },
  ];

  for (const data of infraccionesData) {
    await prisma.infraccionCatalogo.upsert({
      where: { articulo: data.articulo },
      update: data,
      create: data,
    });
  }

  console.log(
    `✅ Catálogo de Infracciones OK (${infraccionesData.length} registros)`,
  );
}
