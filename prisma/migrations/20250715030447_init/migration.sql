-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "title" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgresoUsuario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dolares" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "armas" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "municion" DOUBLE PRECISION NOT NULL DEFAULT 2000,
    "alcohol" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "capacidadAlmacenDolares" INTEGER NOT NULL DEFAULT 10000,
    "capacidadAlmacenArmas" INTEGER NOT NULL DEFAULT 10000,
    "capacidadAlmacenMunicion" INTEGER NOT NULL DEFAULT 10000,
    "capacidadAlmacenAlcohol" INTEGER NOT NULL DEFAULT 10000,
    "ultimaActualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgresoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitacionUsuario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "configuracionHabitacionId" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HabitacionUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntrenamientoUsuario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "configuracionEntrenamientoId" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EntrenamientoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TropaUsuario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "configuracionTropaId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TropaUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionHabitacion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "urlImagen" TEXT,
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
    "urlImagen" TEXT,
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
    "descripcion" TEXT NOT NULL,
    "urlImagen" TEXT,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ProgresoUsuario_userId_key" ON "ProgresoUsuario"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HabitacionUsuario_userId_configuracionHabitacionId_key" ON "HabitacionUsuario"("userId", "configuracionHabitacionId");

-- CreateIndex
CREATE UNIQUE INDEX "EntrenamientoUsuario_userId_configuracionEntrenamientoId_key" ON "EntrenamientoUsuario"("userId", "configuracionEntrenamientoId");

-- CreateIndex
CREATE UNIQUE INDEX "TropaUsuario_userId_configuracionTropaId_key" ON "TropaUsuario"("userId", "configuracionTropaId");

-- AddForeignKey
ALTER TABLE "ProgresoUsuario" ADD CONSTRAINT "ProgresoUsuario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitacionUsuario" ADD CONSTRAINT "HabitacionUsuario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitacionUsuario" ADD CONSTRAINT "HabitacionUsuario_configuracionHabitacionId_fkey" FOREIGN KEY ("configuracionHabitacionId") REFERENCES "ConfiguracionHabitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntrenamientoUsuario" ADD CONSTRAINT "EntrenamientoUsuario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntrenamientoUsuario" ADD CONSTRAINT "EntrenamientoUsuario_configuracionEntrenamientoId_fkey" FOREIGN KEY ("configuracionEntrenamientoId") REFERENCES "ConfiguracionEntrenamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TropaUsuario" ADD CONSTRAINT "TropaUsuario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TropaUsuario" ADD CONSTRAINT "TropaUsuario_configuracionTropaId_fkey" FOREIGN KEY ("configuracionTropaId") REFERENCES "ConfiguracionTropa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
