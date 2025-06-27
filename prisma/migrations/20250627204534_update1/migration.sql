/*
  Warnings:

  - You are about to drop the column `characters` on the `RelationshipConflict` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `RelationshipConflict` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ConflictStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'DORMANT');

-- AlterTable
ALTER TABLE "RelationshipConflict" DROP COLUMN "characters",
DROP COLUMN "isActive",
ADD COLUMN     "charactersInvolved" TEXT[],
ADD COLUMN     "status" "ConflictStatus" NOT NULL DEFAULT 'ACTIVE';
