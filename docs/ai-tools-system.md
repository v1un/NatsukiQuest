# AI Tools System - Autonomous Game Master

## Overview

The AI Game Master has been evolved from a **passive narrator** to an **active agent** through the implementation of Genkit tools. This system allows the AI to directly modify the game state, making real changes to inventory, player stats, and world state based on the narrative.

## Architecture

### Before (Passive Narrator)
```
Player Choice → AI → Text Response
```
The AI could only generate text descriptions. It could say "you found a sword" but couldn't actually add the sword to your inventory.

### After (Active Agent)
```
Player Choice → AI → Tool Calls → Database Changes → Text Response
```
The AI can now make real changes to the game world through tool calls, then generate informed narrative based on the results.

## Available Tools

### 1. `updatePlayerInventory`
**Purpose**: Add or remove items from the player's inventory
**Parameters**:
- `userId`: Player's user ID
- `itemId`: Unique item identifier
- `itemName`: Display name of the item
- `itemDescription`: Item description
- `itemIcon`: Icon identifier
- `quantity`: Positive to add, negative to remove

**Example Usage**: AI finds a chest and adds treasure to inventory

### 2. `getPlayerStats`
**Purpose**: Retrieve current player health, skills, and attributes
**Parameters**:
- `userId`: Player's user ID

**Returns**: Current health, max health, skills array, and attributes

### 3. `updatePlayerStats`
**Purpose**: Modify player health, add skills, or change attributes
**Parameters**:
- `userId`: Player's user ID
- `healthChange`: Amount to change health (optional)
- `newSkill`: Skill object to add (optional)
- `attributeChanges`: Object with attribute modifications (optional)

**Example Usage**: Player takes damage in combat, AI reduces health

### 4. `performSkillCheck`
**Purpose**: Execute dice rolls for skill-based challenges
**Parameters**:
- `userId`: Player's user ID
- `skillId`: ID of the skill being tested
- `difficulty`: Target number to beat (DC)
- `modifier`: Additional bonus/penalty (optional)

**Returns**: Success/failure, dice roll details, and descriptive message

### 5. `updateWorldState`
**Purpose**: Set story flags, quest progress, or world variables
**Parameters**:
- `userId`: Player's user ID
- `stateKey`: The state variable name
- `stateValue`: New value (string, number, or boolean)

**Example Usage**: Mark doors as unlocked, quests as complete, etc.

## Implementation Details

### Tool Integration
Tools are integrated into the AI Game Master flow using Genkit's `defineTool()` function and passed to the prompt via the `tools` parameter:

```typescript
const aiResponse = await prompt(input, {
  tools: gameTools,
  maxTurns: 10, // Allow multiple tool calls per turn
});
```

### Database Integration
All tools interact with the Prisma database through the existing `GameSave` model, which stores game state as JSON. This ensures:
- Persistent changes across sessions
- Automatic synchronization with frontend
- Full audit trail of game state changes

### Error Handling
Each tool includes comprehensive error handling:
- Database connection errors
- Invalid user IDs
- Missing game saves
- Validation errors

## Workflow Example

### Scenario: Player tries to pick a lock

1. **Player Input**: "I try to pick the lock on the chest"

2. **AI Decision Making**: 
   - Recognizes this requires a skill check
   - Decides what happens on success/failure

3. **Tool Execution**:
   ```typescript
   // AI calls performSkillCheck
   const rollResult = await performSkillCheck({
     userId: "user123",
     skillId: "lockpicking",
     difficulty: 15,
     modifier: 0
   });
   ```

4. **Conditional Actions**:
   - **If successful**: Call `updatePlayerInventory` to add chest contents
   - **If failed**: Maybe call `updatePlayerStats` to apply damage

5. **Narrative Generation**: AI generates story based on actual results:
   - "With a satisfying click, the lock springs open! Inside you find a golden key and 50 coins."
   - "The lockpick snaps in your fingers, cutting you for 5 damage."

## Benefits

### Dynamic Gameplay
- Items can be found, lost, or stolen by NPCs
- Player stats change based on story events
- World state evolves based on player actions

### Meaningful Consequences
- Skill checks have real mechanical effects
- Story choices affect inventory and abilities
- Death/injury has lasting impact

### Emergent Storytelling
- AI can create unexpected interactions
- NPCs can give/take items dynamically
- Quest objectives can change based on player state

## Future Enhancements

### Planned Tools
- `createNPC`: Spawn new characters dynamically
- `updateNPCRelationship`: Modify NPC attitudes
- `triggerEvent`: Start scripted sequences
- `modifyEnvironment`: Change locations/descriptions

### Advanced Features
- Multi-step quest chains
- Dynamic pricing for merchants
- Weather and time-based effects
- Character progression systems

## Usage Guidelines

### For AI Prompts
The AI is instructed to use tools when narratively appropriate:
- Finding items → `updatePlayerInventory`
- Skill challenges → `performSkillCheck`  
- Combat damage → `updatePlayerStats`
- Story progress → `updateWorldState`

### For Developers
Tools are designed to be:
- **Atomic**: Each tool does one thing well
- **Safe**: Extensive error handling and validation
- **Consistent**: Predictable input/output formats
- **Debuggable**: Comprehensive logging and error messages

This system transforms NatsukiQuest from a simple choose-your-own-adventure into a fully interactive RPG where the AI Game Master can actively shape the world based on player choices.