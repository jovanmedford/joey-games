-- CreateTable
CREATE TABLE "GameMeta" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "minPlayers" INTEGER NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "isPlayable" BOOLEAN NOT NULL,

    CONSTRAINT "GameMeta_pkey" PRIMARY KEY ("id")
);
