-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "title" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dolares" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "armas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "municion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "alcohol" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ultimaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_rooms" (
    "userId" TEXT NOT NULL,
    "configuracionHabitacionId" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_rooms_pkey" PRIMARY KEY ("userId","configuracionHabitacionId")
);

-- CreateTable
CREATE TABLE "user_trainings" (
    "userId" TEXT NOT NULL,
    "configuracionEntrenamientoId" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_trainings_pkey" PRIMARY KEY ("userId","configuracionEntrenamientoId")
);

-- CreateTable
CREATE TABLE "user_troops" (
    "userId" TEXT NOT NULL,
    "configuracionTropaId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_troops_pkey" PRIMARY KEY ("userId","configuracionTropaId")
);

-- CreateTable
CREATE TABLE "room_configurations" (
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

    CONSTRAINT "room_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_configurations" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "urlImagen" TEXT NOT NULL,
    "costoArmas" INTEGER NOT NULL,
    "costoMunicion" INTEGER NOT NULL,
    "costoDolares" INTEGER NOT NULL,
    "duracion" INTEGER NOT NULL,
    "puntos" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "training_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "troop_configurations" (
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

    CONSTRAINT "troop_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_key" ON "user_progress"("userId");

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rooms" ADD CONSTRAINT "user_rooms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rooms" ADD CONSTRAINT "user_rooms_configuracionHabitacionId_fkey" FOREIGN KEY ("configuracionHabitacionId") REFERENCES "room_configurations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_trainings" ADD CONSTRAINT "user_trainings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_trainings" ADD CONSTRAINT "user_trainings_configuracionEntrenamientoId_fkey" FOREIGN KEY ("configuracionEntrenamientoId") REFERENCES "training_configurations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_troops" ADD CONSTRAINT "user_troops_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_troops" ADD CONSTRAINT "user_troops_configuracionTropaId_fkey" FOREIGN KEY ("configuracionTropaId") REFERENCES "troop_configurations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
