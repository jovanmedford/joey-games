/*
  Warnings:

  - The primary key for the `GameMeta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `GameMeta` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GameMeta" DROP CONSTRAINT "GameMeta_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT;
DROP SEQUENCE "GameMeta_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "GameMeta_id_key" ON "GameMeta"("id");
