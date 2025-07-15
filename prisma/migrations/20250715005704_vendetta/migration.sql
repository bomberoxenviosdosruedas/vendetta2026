-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('MEJORA_HABITACION', 'INICIO_ENTRENAMIENTO', 'RECLUTAMIENTO_TROPA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombreUsuario" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecursosUsuario" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "dolares" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "municion" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "armas" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "ultimaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecursosUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionHabitacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "urlImagen" TEXT NOT NULL,
    "costoArmas" INTEGER NOT NULL,
    "costoMunicion" INTEGER NOT NULL,
    "costoDolares" INTEGER NOT NULL,
    "duracion" INTEGER NOT NULL,
    "produccion" DOUBLE PRECISION NOT NULL,
    "puntos" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ConfiguracionHabitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionEntrenamiento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "urlImagen" TEXT NOT NULL,
    "costoArmas" INTEGER NOT NULL,
    "costoMunicion" INTEGER NOT NULL,
    "costoDolares" INTEGER NOT NULL,
    "duracion" INTEGER NOT NULL,
    "puntos" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ConfiguracionEntrenamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionTropa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "urlImagen" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "costoArmas" INTEGER NOT NULL,
    "costoMunicion" INTEGER NOT NULL,
    "costoDolares" INTEGER NOT NULL,
    "duracion" INTEGER NOT NULL,
    "puntos" DOUBLE PRECISION NOT NULL,
    "ataque" INTEGER NOT NULL,
    "defensa" INTEGER NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "velocidad" INTEGER NOT NULL,
    "salario" INTEGER NOT NULL,
    "requisitos" TEXT[],
    "bonusAtaque" TEXT[],
    "bonusDefensa" TEXT[],

    CONSTRAINT "ConfiguracionTropa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitacionUsuario" (
    "id" SERIAL NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 0,
    "usuarioId" INTEGER NOT NULL,
    "configuracionHabitacionId" TEXT NOT NULL,

    CONSTRAINT "HabitacionUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrenamientoUsuario" (
    "id" SERIAL NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 0,
    "usuarioId" INTEGER NOT NULL,
    "configuracionEntrenamientoId" TEXT NOT NULL,

    CONSTRAINT "EntrenamientoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TropaUsuario" (
    "id" SERIAL NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "usuarioId" INTEGER NOT NULL,
    "configuracionTropaId" TEXT NOT NULL,

    CONSTRAINT "TropaUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoJuego" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoEvento" NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "entidadId" TEXT NOT NULL,
    "nivelObjetivo" INTEGER,
    "cantidad" INTEGER,
    "tiempoFinalizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoJuego_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_nombreUsuario_key" ON "Usuario"("nombreUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "RecursosUsuario_usuarioId_key" ON "RecursosUsuario"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionHabitacion_id_key" ON "ConfiguracionHabitacion"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionEntrenamiento_id_key" ON "ConfiguracionEntrenamiento"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionTropa_id_key" ON "ConfiguracionTropa"("id");

-- CreateIndex
CREATE UNIQUE INDEX "HabitacionUsuario_usuarioId_configuracionHabitacionId_key" ON "HabitacionUsuario"("usuarioId", "configuracionHabitacionId");

-- CreateIndex
CREATE UNIQUE INDEX "EntrenamientoUsuario_usuarioId_configuracionEntrenamientoId_key" ON "EntrenamientoUsuario"("usuarioId", "configuracionEntrenamientoId");

-- CreateIndex
CREATE UNIQUE INDEX "TropaUsuario_usuarioId_configuracionTropaId_key" ON "TropaUsuario"("usuarioId", "configuracionTropaId");

-- AddForeignKey
ALTER TABLE "RecursosUsuario" ADD CONSTRAINT "RecursosUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitacionUsuario" ADD CONSTRAINT "HabitacionUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitacionUsuario" ADD CONSTRAINT "HabitacionUsuario_configuracionHabitacionId_fkey" FOREIGN KEY ("configuracionHabitacionId") REFERENCES "ConfiguracionHabitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntrenamientoUsuario" ADD CONSTRAINT "EntrenamientoUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntrenamientoUsuario" ADD CONSTRAINT "EntrenamientoUsuario_configuracionEntrenamientoId_fkey" FOREIGN KEY ("configuracionEntrenamientoId") REFERENCES "ConfiguracionEntrenamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TropaUsuario" ADD CONSTRAINT "TropaUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TropaUsuario" ADD CONSTRAINT "TropaUsuario_configuracionTropaId_fkey" FOREIGN KEY ("configuracionTropaId") REFERENCES "ConfiguracionTropa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoJuego" ADD CONSTRAINT "EventoJuego_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
