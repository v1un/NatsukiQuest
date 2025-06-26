/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `GameSave` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GameSave_userId_key" ON "GameSave"("userId");
