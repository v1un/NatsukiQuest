import { prisma } from '../../src/lib/prisma';
import { InteractionType } from '@prisma/client';

export interface CreateEnvironmentalDetailData {
  location: string;
  description: string;
  interactionType?: InteractionType;
  loreId?: string;
  questId?: string;
}

/**
 * Logs an environmental detail for a user
 */
export async function logEnvironmentalDetail(
  userId: string,
  detailData: CreateEnvironmentalDetailData
) {
  // Check if this exact environmental detail already exists for the user
  const existingDetail = await prisma.environmentalDetail.findFirst({
    where: {
      userId,
      location: detailData.location,
      description: detailData.description
    }
  });

  if (existingDetail) {
    // If it exists but hasn't been discovered, mark as discovered
    if (!existingDetail.isDiscovered) {
      return await prisma.environmentalDetail.update({
        where: { id: existingDetail.id },
        data: {
          isDiscovered: true,
          discoveredAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    
    // If already discovered, return existing entry
    return existingDetail;
  }

  // Create new environmental detail as discovered
  return await prisma.environmentalDetail.create({
    data: {
      location: detailData.location,
      description: detailData.description,
      interactionType: detailData.interactionType || InteractionType.EXAMINE,
      loreId: detailData.loreId,
      questId: detailData.questId,
      isDiscovered: true,
      discoveredAt: new Date(),
      userId
    }
  });
}

/**
 * Gets all environmental details for a specific location
 */
export async function getEnvironmentalDetails(userId: string, location: string) {
  return await prisma.environmentalDetail.findMany({
    where: {
      userId,
      location,
      isDiscovered: true
    },
    orderBy: { discoveredAt: 'asc' }
  });
}

/**
 * Gets environmental details by interaction type
 */
export async function getEnvironmentalDetailsByType(
  userId: string,
  interactionType: InteractionType
) {
  return await prisma.environmentalDetail.findMany({
    where: {
      userId,
      interactionType,
      isDiscovered: true
    },
    orderBy: { discoveredAt: 'desc' }
  });
}

/**
 * Gets environmental details linked to a specific quest
 */
export async function getEnvironmentalDetailsByQuest(userId: string, questId: string) {
  return await prisma.environmentalDetail.findMany({
    where: {
      userId,
      questId,
      isDiscovered: true
    },
    orderBy: { discoveredAt: 'asc' }
  });
}

/**
 * Gets environmental details linked to a specific lore entry
 */
export async function getEnvironmentalDetailsByLore(userId: string, loreId: string) {
  return await prisma.environmentalDetail.findMany({
    where: {
      userId,
      loreId,
      isDiscovered: true
    },
    orderBy: { discoveredAt: 'asc' }
  });
}

/**
 * Gets recent environmental discoveries for a user
 */
export async function getRecentEnvironmentalDiscoveries(userId: string, limit: number = 10) {
  return await prisma.environmentalDetail.findMany({
    where: {
      userId,
      isDiscovered: true
    },
    orderBy: { discoveredAt: 'desc' },
    take: limit
  });
}

/**
 * Gets all unique locations where user has discovered environmental details
 */
export async function getDiscoveredLocations(userId: string) {
  const locations = await prisma.environmentalDetail.findMany({
    where: {
      userId,
      isDiscovered: true
    },
    select: { location: true },
    distinct: ['location']
  });

  return locations.map(l => l.location).sort();
}

/**
 * Gets environmental detail statistics for a user
 */
export async function getEnvironmentalStats(userId: string) {
  const [totalDiscovered, byLocation, byType] = await Promise.all([
    prisma.environmentalDetail.count({
      where: { userId, isDiscovered: true }
    }),
    prisma.environmentalDetail.groupBy({
      by: ['location'],
      where: { userId, isDiscovered: true },
      _count: { location: true }
    }),
    prisma.environmentalDetail.groupBy({
      by: ['interactionType'],
      where: { userId, isDiscovered: true },
      _count: { interactionType: true }
    })
  ]);

  const locationCounts = byLocation.reduce((acc, item) => {
    acc[item.location] = item._count.location;
    return acc;
  }, {} as Record<string, number>);

  const typeCounts = byType.reduce((acc, item) => {
    acc[item.interactionType] = item._count.interactionType;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalDiscovered,
    byLocation: locationCounts,
    byType: typeCounts
  };
}

/**
 * Searches environmental details by description content
 */
export async function searchEnvironmentalDetails(userId: string, searchTerm: string) {
  return await prisma.environmentalDetail.findMany({
    where: {
      userId,
      isDiscovered: true,
      description: {
        contains: searchTerm,
        mode: 'insensitive'
      }
    },
    orderBy: { discoveredAt: 'desc' }
  });
}

/**
 * Updates an environmental detail
 */
export async function updateEnvironmentalDetail(
  userId: string,
  detailId: string,
  updates: Partial<CreateEnvironmentalDetailData>
) {
  const detail = await prisma.environmentalDetail.findFirst({
    where: { id: detailId, userId }
  });

  if (!detail) {
    throw new Error('Environmental detail not found or does not belong to user');
  }

  return await prisma.environmentalDetail.update({
    where: { id: detailId },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
}

/**
 * Checks if an environmental detail has been discovered at a location
 */
export async function hasDiscoveredEnvironmentalDetail(
  userId: string,
  location: string,
  description: string
): Promise<boolean> {
  const detail = await prisma.environmentalDetail.findFirst({
    where: {
      userId,
      location,
      description,
      isDiscovered: true
    }
  });

  return !!detail;
}

/**
 * Gets environmental details that can trigger lore discoveries
 */
export async function getLoreLinkedEnvironmentalDetails(userId: string) {
  return await prisma.environmentalDetail.findMany({
    where: {
      userId,
      isDiscovered: true,
      loreId: { not: null }
    },
    orderBy: { discoveredAt: 'desc' }
  });
}

/**
 * Gets environmental details that can trigger quest updates
 */
export async function getQuestLinkedEnvironmentalDetails(userId: string) {
  return await prisma.environmentalDetail.findMany({
    where: {
      userId,
      isDiscovered: true,
      questId: { not: null }
    },
    orderBy: { discoveredAt: 'desc' }
  });
}
