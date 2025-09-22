import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//ejemplo de como insertar datos iniciales en la base de datos
// como correr el comando: npx run prisma:seed
async function main() {
  await prisma.cargo_administrativo.createMany({
    data: [{ nombre: 'Admin' }, { nombre: 'P.A' }, { nombre: 'Orientador' }],
    skipDuplicates: true, // esto evita duplicados
  });

  console.log('Cargos insertados correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
