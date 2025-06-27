import { prisma } from '../../src/lib/prisma';

export interface ReputationChange {
  amount: number;
  reason: string;
  source?: string; // Quest ID, event ID, etc.
  timestamp: Date;
}

/**
 * Adjusts reputation for a user with a specific faction
 */
export async function adjustReputation(
  userId: string,
  faction: string,
  change: number,
  reason: string,
  source?: string
) {
  // Clamp reputation changes to reasonable bounds
  const clampedChange = Math.max(-20, Math.min(20, change));
  
  // Get current reputation or create new one
  const currentReputation = await prisma.reputation.findFirst({
    where: { userId, faction }
  });

  let newLevel: number;
  let history: ReputationChange[];

  if (currentReputation) {
    // Calculate new level, clamped between -100 and 100
    newLevel = Math.max(-100, Math.min(100, currentReputation.level + clampedChange));
    history = (currentReputation.history as any as ReputationChange[]) || [];
  } else {
    newLevel = Math.max(-100, Math.min(100, clampedChange));
    history = [];
  }

  // Add change to history
  const changeRecord: ReputationChange = {
    amount: clampedChange,
    reason,
    source,
    timestamp: new Date()
  };
  
  history.push(changeRecord);

  // Determine title based on reputation level
  const title = getReputationTitle(faction, newLevel);

  // Upsert reputation record
  return await prisma.reputation.upsert({
    where: {
      userId_faction: { userId, faction }
    },
    update: {
      level: newLevel,
      title,
      history: history as any,
      updatedAt: new Date()
    },
    create: {
      userId,
      faction,
      level: newLevel,
      title,
      history: history as any
    }
  });
}

/**
 * Gets current reputation for a user with a specific faction
 */
export async function getReputation(userId: string, faction: string) {
  return await prisma.reputation.findFirst({
    where: { userId, faction }
  });
}

/**
 * Gets all reputations for a user
 */
export async function getAllReputations(userId: string) {
  return await prisma.reputation.findMany({
    where: { userId },
    orderBy: { level: 'desc' }
  });
}

/**
 * Gets reputation history for a user with a faction
 */
export async function getReputationHistory(userId: string, faction: string) {
  const reputation = await prisma.reputation.findFirst({
    where: { userId, faction }
  });
  
  return reputation ? (reputation.history as any as ReputationChange[]) || [] : [];
}

/**
 * Determines reputation title based on faction and level
 */
function getReputationTitle(faction: string, level: number): string {
  const factionLower = faction.toLowerCase();
  
  // Define reputation tiers
  if (level >= 80) return `${faction} Champion`;
  if (level >= 60) return `${faction} Hero`;
  if (level >= 40) return `${faction} Ally`;
  if (level >= 20) return `${faction} Friend`;
  if (level >= 0) return `${faction} Neutral`;
  if (level >= -20) return `${faction} Unfriendly`;
  if (level >= -40) return `${faction} Hostile`;
  if (level >= -60) return `${faction} Enemy`;
  if (level >= -80) return `${faction} Nemesis`;
  return `${faction} Pariah`;
}

/**
 * Checks if user has minimum reputation with faction
 */
export async function hasMinimumReputation(
  userId: string,
  faction: string,
  minimumLevel: number
): Promise<boolean> {
  const reputation = await getReputation(userId, faction);
  return reputation ? reputation.level >= minimumLevel : false;
}

/**
 * Gets factions where user has positive reputation
 */
export async function getPositiveReputations(userId: string) {
  return await prisma.reputation.findMany({
    where: {
      userId,
      level: { gt: 0 }
    },
    orderBy: { level: 'desc' }
  });
}

/**
 * Gets factions where user has negative reputation
 */
export async function getNegativeReputations(userId: string) {
  return await prisma.reputation.findMany({
    where: {
      userId,
      level: { lt: 0 }
    },
    orderBy: { level: 'asc' }
  });
}
