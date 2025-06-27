# GameContext Enhancements

## Overview

The GameContext has been enhanced with new state fields and handlers to support a more immersive and complex game experience. This includes quest management, lore discovery, reputation systems, and environmental interactions.

## New State Fields

The GameState now includes the following additional fields:

- **activeQuests**: Array of currently active quests
- **completedQuests**: Array of finished quests (completed or failed)
- **reputations**: Array of faction reputation standings
- **discoveredLore**: Array of discovered lore entry IDs
- **environmentalDetails**: Array of environmental details that can be discovered

## New Handlers

### handleQuestUpdate(questId: string, updates: Partial<Quest>)

Updates a quest with new information. Can handle:
- Objective completion
- Status changes (ACTIVE → COMPLETED/FAILED)
- Progress updates
- Automatic quest completion when all objectives are met

**Example:**
```typescript
// Complete a quest objective
handleQuestUpdate('quest_main_1', {
  objectives: updatedObjectives
});

// Mark quest as completed
handleQuestUpdate('quest_main_1', {
  status: 'COMPLETED'
});
```

### handleLoreDiscovery(loreId: string)

Marks a lore entry as discovered and adds it to the discoveredLore array.
- Prevents duplicate discoveries
- Shows toast notification for new discoveries

**Example:**
```typescript
handleLoreDiscovery('lore_ancient_magic');
```

### handleReputationChange(faction: string, amount: number, reason: string, location?: string)

Updates reputation with a faction:
- Creates new reputation entries for unknown factions
- Tracks reputation history with timestamps
- Shows notifications for significant changes (±10 or more)
- Enforces reputation bounds (-100 to +100)

**Example:**
```typescript
// Increase reputation
handleReputationChange('Emilia Camp', 15, 'Helped Emilia with her insignia');

// Decrease reputation
handleReputationChange('Witch Cult', -25, 'Interfered with their plans', 'Roswaal Manor');
```

### handleEnvironmentInteract(environmentId: string, interactionType?: string)

Marks environmental details as discovered:
- Updates discovery status and timestamp
- Shows notification when new details are found
- Supports different interaction types (examine, interact, lore, quest)

**Example:**
```typescript
handleEnvironmentInteract('env_market_notice_board');
```

## State Persistence

All new fields are automatically serialized and persisted when using:
- `saveGame()` - Saves complete game state including new fields
- `loadMostRecentGame()` - Loads complete game state with all enhancements

## Usage Example

The `QuestManager` component demonstrates how to use these new handlers:

```typescript
import { useGameContext } from '@/hooks/use-game-context';

const MyComponent = () => {
  const { 
    gameState, 
    handleQuestUpdate, 
    handleLoreDiscovery, 
    handleReputationChange, 
    handleEnvironmentInteract 
  } = useGameContext();

  // Use the handlers to update game state
  const completeQuest = () => {
    handleQuestUpdate('quest_main_1', { status: 'COMPLETED' });
  };

  // ... rest of component
};
```

## Toast Notifications

The handlers provide user feedback through toast notifications:
- **Quest Completed**: Green notification when quests are finished
- **Lore Discovered**: Blue notification for new lore discoveries
- **Reputation Changed**: Success/destructive variants based on change direction
- **New Faction**: Purple notification when encountering new factions
- **Environment Discovered**: Amber notification for environmental discoveries

## Integration Notes

- All handlers use `useCallback` for performance optimization
- State updates are immutable and use React's functional state updates
- Toast notifications use the existing `useToast` hook
- Type safety is maintained with proper TypeScript interfaces
- The GameContext interface has been extended to include all new handlers

## Testing

A test button in the QuestManager component allows you to verify all handlers are working correctly. It will:
1. Discover a test lore entry
2. Increase reputation with a test faction
3. Discover the first undiscovered environmental detail

This enhancement provides a solid foundation for complex narrative and progression systems in the game.
