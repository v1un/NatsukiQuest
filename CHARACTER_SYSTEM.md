# Dynamic Character Management System

## Overview

The NatsukiQuest character system has been completely redesigned to dynamically track characters as the player encounters them, rather than using prepopulated character lists. Characters are now location-aware and only appear in the bonds screen when they're in the same region as the player.

## Key Features

### 1. Dynamic Character Discovery
- **No Prepopulated Characters**: Characters start empty and are added only when encountered
- **AI-Driven Introduction**: The AI Game Master uses `introduceCharacter` tool when player meets new NPCs
- **Location-Based Tracking**: Every character has a `currentLocation` property

### 2. Location-Aware Relationships
- **Bonds Screen Filtering**: Only shows characters in the same location as the player
- **Location Indicators**: UI shows current location and character distribution
- **Movement Tracking**: Characters can move between locations via `updateCharacterLocation`

### 3. Enhanced Character Data Model

```typescript
interface Character {
  name: string;
  affinity: number; // 0-100
  status: string;
  description: string;
  avatar: string;
  bonds?: CharacterBond[];
  currentLocation: string; // NEW: Where character is located
  firstMetAt?: string; // NEW: Where player first met them
  lastSeenAt?: Date; // NEW: Last interaction timestamp
  lastInteractionReason?: string; // NEW: Reason for last affinity change
  isImportant?: boolean; // NEW: Story importance flag
  locationHistory?: Array<{ // NEW: Movement history
    location: string;
    leftAt: Date;
    reason?: string;
  }>;
}
```

## AI Tools

### Character Management Tools

1. **`introduceCharacter`** - REQUIRED for any new character encounter
   ```typescript
   await introduceCharacter({
     userId: string,
     name: string,
     description: string,
     currentLocation: string,
     status?: string,
     initialAffinity?: number,
     isImportant?: boolean
   });
   ```

2. **`updateCharacterAffinity`** - Change relationship based on interactions
   ```typescript
   await updateCharacterAffinity({
     userId: string,
     characterName: string,
     affinityChange: number, // positive or negative
     reason: string,
     statusChange?: string
   });
   ```

3. **`updateCharacterLocation`** - Move characters between areas
   ```typescript
   await updateCharacterLocation({
     userId: string,
     characterName: string,
     newLocation: string,
     reason?: string
   });
   ```

4. **`createCharacterBond`** - Create NPC-to-NPC relationships
   ```typescript
   await createCharacterBond({
     userId: string,
     character1Name: string,
     character2Name: string,
     relationshipType: string,
     strength: number,
     description?: string
   });
   ```

5. **`getCharactersInLocation`** - Query characters by location
   ```typescript
   await getCharactersInLocation({
     userId: string,
     location: string
   });
   ```

## Usage Guidelines for AI Game Master

### CRITICAL Rules

1. **Always use `introduceCharacter` for NEW characters**
   - First time player meets anyone = introduceCharacter call
   - Include their current location and description
   - Set appropriate initial affinity (usually 0-20 for strangers)

2. **Always use `updateCharacterAffinity` for relationship changes**
   - After meaningful dialogue or interactions
   - Include specific reason for the change
   - Update status if relationship level changes significantly

3. **Characters only appear in bonds if co-located**
   - Players only see characters in their current location
   - Use `updateCharacterLocation` to move NPCs around the world
   - Check location before writing dialogue scenes

4. **Do NOT manually add to updatedCharacters array**
   - Use tools instead of response field
   - updatedCharacters should return empty array []

### Examples

#### Meeting Emilia (First Time)
```typescript
// When player chooses to approach the silver-haired girl
await introduceCharacter({
  userId: session.user.id,
  name: "Emilia",
  description: "A stunningly beautiful half-elf with silver hair and purple eyes. She seems kind but is currently distressed over a stolen insignia.",
  currentLocation: "Lugunica Capital - Market District",
  status: "Met",
  initialAffinity: 10,
  isImportant: true
});
```

#### Positive Interaction
```typescript
// After player helps Emilia
await updateCharacterAffinity({
  userId: session.user.id,
  characterName: "Emilia",
  affinityChange: 15,
  reason: "Helped search for stolen insignia",
  statusChange: "Grateful"
});
```

#### Character Movement
```typescript
// When Emilia leaves the market
await updateCharacterLocation({
  userId: session.user.id,
  characterName: "Emilia",
  newLocation: "Lugunica Capital - Slums",
  reason: "Following thief's trail"
});
```

## UI Components

### CharacterBonds Component
- **Location Header**: Shows current location and character count
- **Filtered Display**: Only characters in same location
- **Empty State**: Explains location-based filtering
- **Other Locations Badge**: Shows characters elsewhere

### Location-Aware Hooks
- `useLocationAwareCharacters`: Filter characters by location
- `useVisibleCharacters`: Get only co-located characters
- `useCharacterLocationStats`: Get location distribution stats

## Benefits

1. **Realistic Discovery**: Characters appear organically as story progresses
2. **Location Immersion**: Only see characters who are actually present
3. **Dynamic World**: Characters can move and be tracked realistically
4. **Better Performance**: No large prepopulated character lists
5. **Story Consistency**: AI controls character introduction timing
6. **Enhanced Roleplay**: Location-based interactions feel more natural

## Migration Notes

- Existing saves with prepopulated characters will need to be handled gracefully
- Initial game state now starts with empty characters array
- All character introductions must go through AI tools
- Location tracking is now mandatory for all characters

## Testing Checklist

- [ ] New game starts with no characters
- [ ] First character encounter triggers `introduceCharacter`
- [ ] Character appears in bonds screen in correct location
- [ ] Affinity changes work through `updateCharacterAffinity`
- [ ] Character movement updates location correctly
- [ ] Bonds screen filters by player location
- [ ] Empty state shows helpful information
- [ ] Location header displays current area and character count