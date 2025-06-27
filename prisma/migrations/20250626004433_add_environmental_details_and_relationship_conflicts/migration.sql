-- CreateEnum
CREATE TYPE "QuestType" AS ENUM ('MAIN', 'SIDE', 'ROMANCE', 'FACTION', 'EXPLORATION');

-- CreateEnum
CREATE TYPE "QuestStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED', 'PAUSED');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('EXAMINE', 'INTERACT', 'LORE', 'QUEST');

-- CreateEnum
CREATE TYPE "ConflictType" AS ENUM ('JEALOUSY', 'RIVALRY', 'ROMANCE', 'POLITICAL', 'PERSONAL');

-- CreateTable
CREATE TABLE "LoreEntry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "isDiscovered" BOOLEAN NOT NULL DEFAULT false,
    "discoveredAt" TIMESTAMP(3),
    "location" TEXT,
    "characters" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LoreEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "QuestType" NOT NULL DEFAULT 'MAIN',
    "status" "QuestStatus" NOT NULL DEFAULT 'ACTIVE',
    "objectives" JSONB NOT NULL,
    "rewards" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "location" TEXT,
    "npcsInvolved" TEXT[],
    "prerequisites" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reputation" (
    "id" TEXT NOT NULL,
    "faction" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "history" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Reputation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentalDetail" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "interactionType" "InteractionType" NOT NULL DEFAULT 'EXAMINE',
    "loreId" TEXT,
    "questId" TEXT,
    "isDiscovered" BOOLEAN NOT NULL DEFAULT false,
    "discoveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EnvironmentalDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelationshipConflict" (
    "id" TEXT NOT NULL,
    "characters" TEXT[],
    "type" "ConflictType" NOT NULL DEFAULT 'PERSONAL',
    "severity" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    "triggers" TEXT[],
    "consequences" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RelationshipConflict_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reputation_userId_faction_key" ON "Reputation"("userId", "faction");

-- AddForeignKey
ALTER TABLE "LoreEntry" ADD CONSTRAINT "LoreEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reputation" ADD CONSTRAINT "Reputation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalDetail" ADD CONSTRAINT "EnvironmentalDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelationshipConflict" ADD CONSTRAINT "RelationshipConflict_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
