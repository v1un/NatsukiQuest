import { prisma } from '../../src/lib/prisma';
import { QuestType, QuestStatus } from '@prisma/client';

export interface CreateQuestData {
  title: string;
  description: string;
  category?: QuestType;
  objectives: Array<{
    id: string;
    description: string;
    completed: boolean;
  }>;
  rewards?: any;
  location?: string;
  npcsInvolved?: string[];
  prerequisites?: string[];
}

/**
 * Creates a new quest for a user
 */
export async function createQuest(userId: string, questData: CreateQuestData) {
  // Validate prerequisites exist and are completed
  if (questData.prerequisites && questData.prerequisites.length > 0) {
    const prerequisiteQuests = await prisma.quest.findMany({
      where: {
        id: { in: questData.prerequisites },
        userId,
        status: QuestStatus.COMPLETED
      }
    });

    if (prerequisiteQuests.length !== questData.prerequisites.length) {
      throw new Error('Some prerequisite quests are not completed or do not exist');
    }
  }

  return await prisma.quest.create({
    data: {
      title: questData.title,
      description: questData.description,
      category: questData.category || QuestType.MAIN,
      status: QuestStatus.ACTIVE,
      objectives: questData.objectives,
      rewards: questData.rewards,
      location: questData.location,
      npcsInvolved: questData.npcsInvolved || [],
      prerequisites: questData.prerequisites || [],
      userId
    }
  });
}

/**
 * Updates quest status and handles completion logic
 */
export async function updateQuestStatus(
  userId: string, 
  questId: string, 
  status: QuestStatus,
  objectiveUpdates?: Array<{
    id: string;
    completed: boolean;
  }>
) {
  // Get current quest
  const currentQuest = await prisma.quest.findFirst({
    where: { id: questId, userId }
  });

  if (!currentQuest) {
    throw new Error('Quest not found or does not belong to user');
  }

  // Update objectives if provided
  let updatedObjectives = currentQuest.objectives as any[];
  if (objectiveUpdates) {
    updatedObjectives = updatedObjectives.map(obj => {
      const update = objectiveUpdates.find(u => u.id === obj.id);
      return update ? { ...obj, completed: update.completed } : obj;
    });
  }

  // Auto-complete quest if all objectives are completed
  if (status === QuestStatus.ACTIVE && updatedObjectives.every(obj => obj.completed)) {
    status = QuestStatus.COMPLETED;
  }

  const updateData: any = {
    status,
    objectives: updatedObjectives,
    updatedAt: new Date()
  };

  // Set completion date if quest is being completed
  if (status === QuestStatus.COMPLETED && currentQuest.status !== QuestStatus.COMPLETED) {
    updateData.completedAt = new Date();
  }

  return await prisma.quest.update({
    where: { id: questId },
    data: updateData
  });
}

/**
 * Gets all active quests for a user, optionally filtered by category
 */
export async function getActiveQuests(userId: string, category?: QuestType) {
  const whereClause: any = {
    userId,
    status: QuestStatus.ACTIVE
  };

  if (category) {
    whereClause.category = category;
  }

  return await prisma.quest.findMany({
    where: whereClause,
    orderBy: [
      { category: 'asc' },
      { startedAt: 'asc' }
    ]
  });
}

/**
 * Gets quest completion statistics for a user
 */
export async function getQuestStats(userId: string) {
  const [completed, active, failed] = await Promise.all([
    prisma.quest.count({
      where: { userId, status: QuestStatus.COMPLETED }
    }),
    prisma.quest.count({
      where: { userId, status: QuestStatus.ACTIVE }
    }),
    prisma.quest.count({
      where: { userId, status: QuestStatus.FAILED }
    })
  ]);

  return { completed, active, failed, total: completed + active + failed };
}
