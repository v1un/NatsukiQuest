# New Features Integration Guide

## Overview

This guide covers the integration and usage of two major new AI system features:

1. **Multi-Character Conversations System** - Complex group dialogues
2. **Dynamic World Events System** - Background events that happen independently

Both systems work together through the **World Orchestrator** to create a living, reactive game world.

## Quick Start

### Enabling the New Features

The new features are automatically included in the AI system. To start using them:

1. **Update your imports** to include the new flows:
```typescript
import { multiCharacterDialogue } from '@/ai/flows/multi-character-dialogue';
import { generateDynamicWorldEvents } from '@/ai/flows/dynamic-world-events';
import { orchestrateWorld } from '@/ai/flows/world-orchestrator';
```

2. **The AI Game Master** automatically has access to all new tools:
   - Conversation management tools
   - World event creation tools
   - Character movement tools
   - News and rumor system
   - Economic state management

### Basic Usage in Game Actions

The new features integrate seamlessly with existing game actions:

```typescript
// In your game action handler
export async function makeChoice(choice: string, userId: string) {
  // Existing AI Game Master call
  const aiResponse = await aiGameMaster({
    userId,
    playerChoice: choice,
    // ... other inputs
  });
  
  // The AI can now automatically:
  // - Start multi-character conversations when appropriate
  // - Create world events based on player actions
  // - Move characters around the world
  // - Generate news and rumors
  // - Update economic conditions
  
  return aiResponse;
}
```

## Multi-Character Conversations

### When to Use

The AI will automatically start multi-character conversations when:
- Multiple characters are present in a scene
- Important discussions need to happen
- Player actions affect multiple characters
- Story beats require group interactions

### Manual Triggering

You can also manually trigger conversations:

```typescript
import { multiCharacterDialogue } from '@/ai/flows/multi-character-dialogue';

const conversationResult = await multiCharacterDialogue({
  userId: "user123",
  conversationId: "emergency_meeting",
  characters: [
    // Character objects with personality traits, moods, goals
  ],
  conversationTopic: "Planning the rescue mission",
  conversationContext: "Urgent meeting called after receiving distress signal",
  playerStatement: "We need to act quickly but carefully",
  conversationPhase: "OPENING",
  location: "Roswaal Manor War Room"
});
```

### Integration with Game State

Conversations automatically:
- Update character affinities based on interactions
- Track dialogue history for continuity
- Schedule future conversations based on outcomes
- Affect reputation with various factions
- Create quest opportunities and complications

## Dynamic World Events

### Event Generation

The system automatically generates events based on:
- Time passage
- Player actions and choices
- Current world state
- Seasonal and calendar factors
- Political and economic conditions

### Event Categories

Events are categorized and balanced:

```typescript
EventCategory = 
  | 'POLITICAL'     // Royal Selection, noble conflicts
  | 'ECONOMIC'      // Trade, markets, resources
  | 'SOCIAL'        // Festivals, movements, culture
  | 'ENVIRONMENTAL' // Weather, natural phenomena
  | 'FACTION'       // Witch Cult, Knights, guilds
  | 'CHARACTER'     // NPC personal events
  | 'SEASONAL'      // Time-based celebrations
  | 'RELIGIOUS'     // Spiritual events, ceremonies
  | 'MAGICAL'       // Magical phenomena, research
  | 'CULTURAL'      // Arts, education, philosophy
```

### Event Impact

Events have cascading effects:
- **Economic**: Price changes, trade route modifications
- **Political**: Stability changes, faction relationships
- **Social**: Character availability, conversation topics
- **Character**: NPC movements, relationship changes

## World Orchestrator

### Automatic Coordination

The World Orchestrator runs automatically to:
- Coordinate events with character interactions
- Ensure consistency across all systems
- Create emergent storytelling opportunities
- Generate player opportunities and challenges

### Orchestration Contexts

Different contexts trigger different behaviors:

```typescript
OrchestrationContext = 
  | 'ROUTINE_CHECK'      // Regular world updates
  | 'MAJOR_EVENT'        // Significant events occurred
  | 'CHARACTER_FOCUS'    // Character-centered scenes
  | 'WORLD_EVENT_TRIGGER' // World events need character reactions
  | 'STORY_CLIMAX'       // Major story moments
  | 'EXPLORATION'        // Player exploring new areas
```

## Database Schema Updates

### New Game State Fields

Your game state now includes:

```typescript
GameState = {
  // Existing fields...
  
  // Multi-Character Conversations
  activeConversations: Conversation[]
  scheduledConversations: ScheduledConversation[]
  conversationHistory: ConversationRecord[]
  
  // Dynamic World Events
  worldEvents: WorldEvent[]
  eventHistory: string[]
  newsAndRumors: NewsItem[]
  
  // Economic System
  economy: {
    prosperity: number
    tradeRoutes: string[]
    marketDemand: Record<string, number>
    priceModifiers: Record<string, number>
  }
  
  // Political System
  politicalState: {
    stability: number
    tensions: string[]
    alliances: string[]
  }
  
  // Character Movements
  characterMovements: CharacterMovement[]
}
```

### Migration Considerations

Existing game saves will automatically receive default values for new fields. No manual migration is required.

## AI Prompt Updates

### New Tool Instructions

The AI Game Master now includes instructions for:

```typescript
// Multi-Character Conversations
"Use startMultiCharacterConversation when multiple characters are present"
"Use updateConversationState to manage ongoing dialogues"
"Use scheduleConversation to plan future interactions"

// Dynamic World Events
"Use createWorldEvent to generate background activities"
"Use updateWorldEvent to develop ongoing situations"
"Use moveCharacter to show realistic NPC activities"
"Use createNewsRumor to spread information through the world"
"Use updateEconomicState to show economic consequences"
```

### Enhanced Decision Making

The AI now considers:
- Current world events when generating narratives
- Character availability and locations
- Economic conditions affecting prices and availability
- Political tensions affecting NPC behavior
- Scheduled conversations that might be triggered

## Performance Considerations

### Optimization Strategies

1. **Event Pruning**: Old events are automatically archived
2. **Conversation Cleanup**: Completed conversations are moved to history
3. **News Expiration**: Rumors automatically expire after set periods
4. **Database Indexing**: New fields are properly indexed for queries

### Resource Usage

- **Memory**: Minimal increase due to efficient data structures
- **Database**: Gradual growth with automatic cleanup
- **AI Calls**: Smart batching and caching reduce redundant calls

## Testing and Debugging

### Test Suite

Run the comprehensive test suite:

```bash
npm run test:new-features
```

Or test individual systems:

```typescript
import { 
  testMultiCharacterConversations,
  testDynamicWorldEvents,
  testWorldOrchestrator 
} from '@/ai/tools/test-new-features';

// Test specific systems
await testMultiCharacterConversations();
await testDynamicWorldEvents(); 
await testWorldOrchestrator();
```

### Debug Mode

Enable debug logging for new features:

```typescript
// In your environment variables
DEBUG_CONVERSATIONS=true
DEBUG_WORLD_EVENTS=true
DEBUG_ORCHESTRATOR=true
```

### Common Issues

**Conversations not starting:**
- Check character availability
- Verify trigger conditions
- Confirm conversation participants exist

**Events not generating:**
- Check time passage
- Verify world state conditions
- Confirm event prerequisites are met

**Performance issues:**
- Monitor event cleanup
- Check conversation history pruning
- Verify database query efficiency

## Best Practices

### For Developers

1. **Let the AI decide**: Trust the AI to manage conversations and events
2. **Provide context**: Give the AI rich world state information
3. **Monitor consistency**: Check that events and conversations align
4. **Test edge cases**: Verify behavior with unusual game states

### For Content Creation

1. **Rich character definitions**: Provide detailed personality traits
2. **Clear faction relationships**: Define how groups interact
3. **Logical world rules**: Establish consistent cause-and-effect
4. **Seasonal considerations**: Account for time-based events

## Integration Examples

### Triggering a Group Discussion

```typescript
// When player discovers something important
if (discoveryType === 'MAJOR_PLOT_POINT') {
  // The AI will automatically consider starting a conversation
  // You can also provide hints in the narrative context
  const context = `Player just discovered ${discovery} which affects ${affectedCharacters.join(', ')}`;
}
```

### Responding to World Events

```typescript
// Events automatically affect NPC dialogue and availability
// Check current events when generating location descriptions
const currentEvents = gameState.worldEvents.filter(event => 
  event.location === playerLocation && event.isActive
);
```

### Economic Integration

```typescript
// Prices automatically adjust based on events
// Check economic state when showing shop prices
const economicModifier = gameState.economy.priceModifiers[itemId] || 1.0;
const adjustedPrice = basePrice * economicModifier;
```

## Future Expansion

### Planned Enhancements

- **Visual conversation indicators** in the UI
- **Event timeline visualization** for players
- **Character schedule displays** showing NPC activities
- **Economic dashboard** for tracking market changes
- **Reputation relationship graphs** showing faction dynamics

### Extensibility Points

The system is designed for easy expansion:
- Add new event categories
- Create custom conversation triggers
- Implement specialized character behaviors
- Add economic system complexity
- Integrate with external systems

## Troubleshooting

### Common Integration Issues

1. **Tool not found errors**: Ensure all tools are properly exported
2. **Schema validation failures**: Check input data matches expected schemas
3. **Database connection issues**: Verify Prisma configuration
4. **Memory usage growth**: Monitor and tune cleanup schedules

### Support Resources

- **Documentation**: Complete API documentation in `/docs`
- **Examples**: Working examples in test files
- **Debug Tools**: Built-in logging and monitoring
- **Community**: Discussion forums and issue tracking

This integration brings the NatsukiQuest AI system to a new level of sophistication, creating a truly living world that responds dynamically to player choices while maintaining the authentic Re:Zero experience.