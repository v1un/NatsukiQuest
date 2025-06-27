import { prisma } from '../../src/lib/prisma';

export interface CreateLoreEntryData {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  location?: string;
  characters?: string[];
}

/**
 * Discovers a lore entry for a user (enforces uniqueness)
 */
export async function discoverLoreEntry(
  userId: string,
  loreEntryData: CreateLoreEntryData
) {
  // Check if user already has this lore entry by title and category
  const existingEntry = await prisma.loreEntry.findFirst({
    where: {
      userId,
      title: loreEntryData.title,
      category: loreEntryData.category
    }
  });

  if (existingEntry) {
    // If entry already exists and is discovered, don't create duplicate
    if (existingEntry.isDiscovered) {
      throw new Error('Lore entry already discovered by this user');
    }
    
    // If entry exists but not discovered, mark as discovered
    return await prisma.loreEntry.update({
      where: { id: existingEntry.id },
      data: {
        isDiscovered: true,
        discoveredAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  // Create new lore entry as discovered
  return await prisma.loreEntry.create({
    data: {
      title: loreEntryData.title,
      content: loreEntryData.content,
      category: loreEntryData.category,
      tags: loreEntryData.tags || [],
      location: loreEntryData.location,
      characters: loreEntryData.characters || [],
      isDiscovered: true,
      discoveredAt: new Date(),
      userId
    }
  });
}

/**
 * Gets the complete lorebook for a user (only discovered entries)
 */
export async function getLorebook(userId: string) {
  return await prisma.loreEntry.findMany({
    where: {
      userId,
      isDiscovered: true
    },
    orderBy: [
      { category: 'asc' },
      { discoveredAt: 'asc' }
    ]
  });
}

/**
 * Gets lore entries by category
 */
export async function getLoreByCategory(userId: string, category: string) {
  return await prisma.loreEntry.findMany({
    where: {
      userId,
      category,
      isDiscovered: true
    },
    orderBy: { discoveredAt: 'asc' }
  });
}

/**
 * Searches lore entries by tags
 */
export async function searchLoreByTags(userId: string, tags: string[]) {
  return await prisma.loreEntry.findMany({
    where: {
      userId,
      isDiscovered: true,
      tags: {
        hasSome: tags
      }
    },
    orderBy: { discoveredAt: 'desc' }
  });
}

/**
 * Gets lore entries related to specific characters
 */
export async function getLoreByCharacters(userId: string, characters: string[]) {
  return await prisma.loreEntry.findMany({
    where: {
      userId,
      isDiscovered: true,
      characters: {
        hasSome: characters
      }
    },
    orderBy: { discoveredAt: 'desc' }
  });
}

/**
 * Gets lore entries discovered at a specific location
 */
export async function getLoreByLocation(userId: string, location: string) {
  return await prisma.loreEntry.findMany({
    where: {
      userId,
      location,
      isDiscovered: true
    },
    orderBy: { discoveredAt: 'desc' }
  });
}

/**
 * Gets recent lore discoveries for a user
 */
export async function getRecentLoreDiscoveries(userId: string, limit: number = 10) {
  return await prisma.loreEntry.findMany({
    where: {
      userId,
      isDiscovered: true
    },
    orderBy: { discoveredAt: 'desc' },
    take: limit
  });
}

/**
 * Gets lorebook statistics for a user
 */
export async function getLoreStats(userId: string) {
  const [totalDiscovered, byCategory] = await Promise.all([
    prisma.loreEntry.count({
      where: { userId, isDiscovered: true }
    }),
    prisma.loreEntry.groupBy({
      by: ['category'],
      where: { userId, isDiscovered: true },
      _count: { category: true }
    })
  ]);

  const categoryCounts = byCategory.reduce((acc, item) => {
    acc[item.category] = item._count.category;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalDiscovered,
    byCategory: categoryCounts
  };
}

/**
 * Updates a lore entry (admin function)
 */
export async function updateLoreEntry(
  userId: string,
  loreEntryId: string,
  updates: Partial<CreateLoreEntryData>
) {
  const loreEntry = await prisma.loreEntry.findFirst({
    where: { id: loreEntryId, userId }
  });

  if (!loreEntry) {
    throw new Error('Lore entry not found or does not belong to user');
  }

  return await prisma.loreEntry.update({
    where: { id: loreEntryId },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
}

/**
 * Checks if a lore entry has been discovered by user
 */
export async function hasDiscoveredLore(
  userId: string,
  title: string,
  category: string
): Promise<boolean> {
  const entry = await prisma.loreEntry.findFirst({
    where: {
      userId,
      title,
      category,
      isDiscovered: true
    }
  });

  return !!entry;
}

/**
 * Gets all unique categories in user's lorebook
 */
export async function getLoreCategories(userId: string) {
  const categories = await prisma.loreEntry.findMany({
    where: {
      userId,
      isDiscovered: true
    },
    select: { category: true },
    distinct: ['category']
  });

  return categories.map(c => c.category).sort();
}

/**
 * Gets all unique tags in user's lorebook
 */
export async function getAllLoreTags(userId: string) {
  const entries = await prisma.loreEntry.findMany({
    where: {
      userId,
      isDiscovered: true
    },
    select: { tags: true }
  });

  const allTags = new Set<string>();
  entries.forEach(entry => {
    entry.tags.forEach(tag => allTags.add(tag));
  });

  return Array.from(allTags).sort();
}
