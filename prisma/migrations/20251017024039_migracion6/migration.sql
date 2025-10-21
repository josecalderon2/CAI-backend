-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id" SERIAL NOT NULL,
    "nombreColegio" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "sitioWeb" TEXT,
    "anoEscolar" TEXT,
    "directora" TEXT,
    "codigoInstitucional" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_configuracion" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT,

    CONSTRAINT "historial_configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historial_configuracion_fechaCambio_idx" ON "historial_configuracion"("fechaCambio");
