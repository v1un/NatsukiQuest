# Database Helper Functions

This directory contains reusable helper functions for database operations in the NatsukiQuest game. Each module wraps Prisma calls and enforces business rules to maintain data consistency and integrity.

## Modules

### Quest Management (`quests.ts`)

Handles quest creation, status updates, and retrieval with proper business logic enforcement.

**Key Functions:**
- `createQuest(userId, questData)` - Creates new quest with prerequisite validation
- `updateQuestStatus(userId, questId, status, objectiveUpdates?)` - Updates quest status with auto-completion logic
- `getActiveQuests(userId, category?)` - Retrieves active quests, optionally filtered by category
- `getQuestStats(userId)` - Gets quest completion statistics

**Business Rules:**
- Validates prerequisite quests are completed before creating new quests
- Auto-completes quests when all objectives are marked complete
- Prevents unauthorized access to other users' quests

### Reputation System (`reputation.ts`)

Manages faction reputation with history tracking and title assignment.

**Key Functions:**
- `adjustReputation(userId, faction, change, reason, source?)` - Adjusts reputation with bounds checking
- `getReputation(userId, faction)` - Gets current reputation for a faction
- `getAllReputations(userId)` - Gets all reputations for a user
- `hasMinimumReputation(userId, faction, minimumLevel)` - Checks reputation requirements

**Business Rules:**
- Clamps reputation changes to ±20 per adjustment
- Maintains reputation levels between -100 and 100
- Automatically assigns titles based on reputation level
- Tracks detailed history of all reputation changes

### Lore System (`lore.ts`)

Handles lore discovery with uniqueness enforcement and comprehensive search capabilities.

**Key Functions:**
- `discoverLoreEntry(userId, loreEntryData)` - Discovers lore entry (enforces uniqueness)
- `getLorebook(userId)` - Gets all discovered lore entries
- `searchLoreByTags(userId, tags)` - Searches lore by tags
- `getLoreByCharacters(userId, characters)` - Gets lore related to specific characters

**Business Rules:**
- Prevents duplicate lore discoveries per user (title + category uniqueness)
- Only returns discovered lore entries to users
- Supports comprehensive search and filtering capabilities
- Tracks discovery timestamps for chronological ordering

### Environmental Details (`environmental.ts`)

Logs environmental storytelling elements with location-based organization.

**Key Functions:**
- `logEnvironmentalDetail(userId, detailData)` - Logs environmental detail with uniqueness check
- `getEnvironmentalDetails(userId, location)` - Gets details for specific location
- `getEnvironmentalDetailsByQuest(userId, questId)` - Gets quest-linked environmental details
- `getEnvironmentalDetailsByLore(userId, loreId)` - Gets lore-linked environmental details

**Business Rules:**
- Prevents duplicate environmental details (location + description uniqueness)
- Links environmental details to quests and lore entries
- Supports multiple interaction types (EXAMINE, INTERACT, LORE, QUEST)
- Only returns discovered environmental details

## Common Patterns

### Error Handling
All functions include proper error handling for:
- Resource not found
- Unauthorized access (user doesn't own resource)
- Business rule violations (e.g., duplicate discoveries)

### Data Validation
- User ownership validation on all operations
- Prerequisite checking for dependent operations
- Bounds checking for numerical values (reputation levels)

### Uniqueness Enforcement
- Lore entries: Unique per user by title + category
- Environmental details: Unique per user by location + description
- Reputation: Unique per user by faction

### Discovery Pattern
Several entities follow a discovery pattern:
1. Check if already exists for user
2. If exists but not discovered, mark as discovered
3. If doesn't exist, create as discovered
4. If already discovered, handle appropriately (return existing or throw error)

## Usage Examples

```typescript
import { 
  createQuest, 
  updateQuestStatus, 
  adjustReputation, 
  discoverLoreEntry,
  logEnvironmentalDetail 
} from '../lib/db';

// Create a new quest
const quest = await createQuest(userId, {
  title: "Find the Lost Artifact",
  description: "Search the ancient ruins for clues",
  category: "EXPLORATION",
  objectives: [
    { id: "1", description: "Enter the ruins", completed: false },
    { id: "2", description: "Find the artifact", completed: false }
  ]
});

// Update quest progress
await updateQuestStatus(userId, quest.id, "ACTIVE", [
  { id: "1", completed: true }
]);

// Adjust reputation
await adjustReputation(userId, "Ancient Scholars", 5, "Discovered important artifact");

// Discover lore
await discoverLoreEntry(userId, {
  title: "The Lost Civilization",
  content: "Long ago, a great civilization flourished...",
  category: "History",
  tags: ["ancient", "ruins", "civilization"]
});

// Log environmental detail
await logEnvironmentalDetail(userId, {
  location: "Ancient Ruins - Main Hall",
  description: "Ancient murals cover the walls, depicting a great battle",
  interactionType: "EXAMINE"
});
```

## Database Schema Dependency

These helpers depend on the Prisma schema models:
- `Quest` - Quest management
- `Reputation` - Faction reputation system  
- `LoreEntry` - Lorebook system
- `EnvironmentalDetail` - Environmental storytelling
- `User` - User management (foreign key relationships)

All functions require a valid `userId` and enforce user ownership of resources to maintain data security and isolation between users.
