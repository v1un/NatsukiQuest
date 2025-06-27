# Dynamic World Events System

## Overview

The Dynamic World Events System creates a living, breathing world where events happen independently of player actions. This system generates background activities, political developments, economic changes, and social movements that make the game world feel alive and reactive.

## Core Principles

### **Autonomous Event Generation**
Events occur based on world logic, timing, and conditions rather than direct player triggers, creating a world that exists independently of player actions.

### **Cascading Consequences**
Events trigger other events, creating realistic cause-and-effect chains that ripple through the game world over time.

### **Temporal Consistency**
Events unfold over appropriate timeframes, from immediate effects to long-term consequences spanning weeks or months.

### **Player Integration**
While events happen independently, they create opportunities, challenges, and context for player interactions.

## Event Categories

### **Political Events**
- **Royal Selection developments** - Candidate activities, campaign events, political maneuvering
- **Noble house conflicts** - Territorial disputes, succession issues, alliance changes
- **Diplomatic missions** - Trade negotiations, peace talks, international relations
- **Legal and policy changes** - New laws, tax changes, regulatory shifts
- **Border tensions** - Military movements, territorial disputes, security concerns

### **Economic Events**
- **Market fluctuations** - Supply and demand changes, price volatility
- **Trade route changes** - New routes opening, existing routes closing
- **Resource discoveries** - New mines, magical materials, rare goods
- **Merchant activities** - Guild policies, caravan schedules, business ventures
- **Agricultural cycles** - Harvest seasons, crop failures, abundance periods
- **Technological developments** - New crafting techniques, magical innovations

### **Social Events**
- **Festivals and celebrations** - Seasonal events, religious ceremonies, cultural gatherings
- **Population movements** - Migration patterns, refugee situations, settlement expansion
- **Cultural exchanges** - Art movements, educational initiatives, philosophical trends
- **Crime and security** - Bandit activities, security responses, law enforcement changes
- **Public sentiment shifts** - Opinion changes, social movements, collective concerns

### **Environmental Events**
- **Weather patterns** - Seasonal changes, unusual weather, climate effects
- **Natural phenomena** - Earthquakes, floods, magical storms
- **Wildlife activities** - Migration patterns, population changes, new species
- **Resource availability** - Depletion, regeneration, discovery of new sources
- **Magical environmental effects** - Mana fluctuations, spirit activities, dimensional disturbances

### **Faction Events**
- **Witch Cult activities** - Movement patterns, recruitment, attack planning
- **Knight order missions** - Patrols, investigations, special operations
- **Religious movements** - Ceremonies, pilgrimages, doctrinal changes
- **Merchant guild activities** - Policy changes, new partnerships, competitive actions
- **International relations** - Diplomatic missions, trade agreements, cultural exchanges

### **Character Events**
- **NPC travel and movement** - Characters moving between locations for personal reasons
- **Relationship developments** - NPCs forming relationships, conflicts, reconciliations
- **Career and life changes** - Job changes, life events, skill development
- **Health and personal issues** - Illness, recovery, personal challenges
- **Achievement and recognition** - NPCs gaining skills, titles, or status

## Event Mechanics

### **Event Lifecycle**

```typescript
WorldEvent {
  id: string
  title: string
  description: string
  category: EventCategory
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL'
  
  // Timing
  duration: {
    startTime: string
    endTime?: string
    ongoing: boolean
  }
  
  // Impact
  consequences: Consequence[]
  affectedFactions: string[]
  affectedCharacters: string[]
  
  // Player Knowledge
  playerAwareness: 'UNKNOWN' | 'RUMORS' | 'PARTIAL' | 'FULL'
  discoveryMethod: 'AUTOMATIC' | 'EXPLORATION' | 'NPC_DIALOGUE' | 'QUEST' | 'NEWS'
  
  // Repeatability
  repeatability: {
    canRepeat: boolean
    cooldownDays?: number
    variations?: string[]
  }
}
```

### **Event Severity Levels**

**MINOR (1-3 days)**
- Local celebrations and festivals
- Weather changes
- Small market fluctuations
- Individual character activities

**MODERATE (1-2 weeks)**
- Regional trade disruptions
- Minor political tensions
- Seasonal economic changes
- Local conflicts and resolutions

**MAJOR (1-3 months)**
- Significant political developments
- Major economic shifts
- Large-scale social movements
- Important character life changes

**CRITICAL (3+ months)**
- Wars and major conflicts
- Revolutionary changes
- Natural disasters
- World-changing discoveries

## Event Generation System

### **Probability Factors**

Events are generated based on multiple factors:

```typescript
EventProbabilityFactors {
  // Time-based
  seasonalInfluence: number
  timeOfDay: number
  dayOfWeek: number
  
  // State-based
  politicalStability: number
  economicProsperity: number
  socialTension: number
  
  // Historical
  recentEventDensity: number
  cooldownPeriods: number
  cyclicalPatterns: number
  
  // Player influence
  playerActions: string[]
  playerReputation: Record<string, number>
  completedQuests: string[]
}
```

### **Cascading Effects**

Events trigger secondary and tertiary effects:

1. **Immediate Effects** (0-1 days)
   - Direct consequences of the event
   - Immediate reactions from NPCs
   - Environmental changes

2. **Short-term Effects** (1-7 days)
   - Character behavior changes
   - Economic adjustments
   - Social reactions

3. **Medium-term Effects** (1-4 weeks)
   - Policy changes
   - Relationship shifts
   - New opportunities/challenges

4. **Long-term Effects** (1+ months)
   - Cultural changes
   - Permanent world state changes
   - Historical significance

## Player Awareness and Discovery

### **Awareness Levels**

**UNKNOWN**
- Player has no knowledge of the event
- No gameplay impact until discovered
- Events continue in background

**RUMORS**
- Player hears whispers and speculation
- Incomplete or inaccurate information
- NPCs share conflicting stories

**PARTIAL**
- Player knows some details
- Missing key information
- Can make educated guesses

**FULL**
- Player has complete information
- Understands all implications
- Can make fully informed decisions

### **Discovery Methods**

**AUTOMATIC**
- Major events that can't be hidden
- Events that directly affect the player
- Obvious environmental changes

**EXPLORATION**
- Player discovers through travel
- Observing world changes
- Finding evidence of events

**NPC_DIALOGUE**
- Characters share information
- Gossip and conversation
- Formal announcements

**QUEST**
- Events discovered through quest activities
- Investigation rewards
- Story revelation

**NEWS**
- Official announcements
- Merchant reports
- Formal communications

## Integration with Game Systems

### **Character Interactions**
- Characters react to ongoing events
- NPCs have opinions about developments
- Relationship dynamics affected by events
- Conversation topics influenced by current events

### **Economic System**
- Price changes based on supply and demand
- Trade route availability
- Resource scarcity and abundance
- Market opportunities and challenges

### **Quest System**
- Events generate new quest opportunities
- Existing quests affected by world changes
- Time-sensitive quests created by events
- Quest rewards influenced by economic conditions

### **Reputation System**
- Faction standings affected by events
- Player actions during events impact reputation
- Event participation creates reputation opportunities
- Long-term reputation consequences

## Re:Zero Specific Events

### **Royal Selection Events**
- Candidate campaign activities
- Political rallies and speeches
- Alliance formations and betrayals
- Selection ceremony preparations

### **Witch Cult Activities**
- Cultist movements and gatherings
- Attack preparations and executions
- Recruitment activities
- Artifact seeking missions

### **Magical Phenomena**
- Mana disturbances and fluctuations
- Spirit realm interactions
- Dimensional anomalies
- Magical research developments

### **Return by Death Implications**
- Events that might change due to RbD loops
- Temporal consistency considerations
- Player knowledge from previous loops
- Butterfly effect scenarios

## Example Event Chains

### **Economic Crisis Chain**
1. **Initial Event**: Poor harvest in agricultural region
2. **Short-term**: Food prices increase in markets
3. **Medium-term**: Trade routes adjust to find new suppliers
4. **Long-term**: Political tension as nobles blame each other
5. **Resolution**: New trade agreements or continued instability

### **Political Tension Chain**
1. **Initial Event**: Border dispute between noble houses
2. **Short-term**: Military movements and preparations
3. **Medium-term**: Diplomatic negotiations and alliances
4. **Long-term**: Either war or peace treaty
5. **Consequences**: Lasting changes to political landscape

## Usage Examples

### **Creating a World Event**

```typescript
await createWorldEvent({
  userId: "user123",
  eventId: "harvest_festival_2024",
  title: "Annual Harvest Festival",
  description: "The kingdom celebrates another successful harvest with festivities in every town",
  category: "SOCIAL",
  severity: "MINOR",
  location: "Kingdom-wide",
  affectedFactions: ["Merchants", "Farmers", "Nobles"],
  duration: {
    startTime: "2024-10-01",
    endTime: "2024-10-07",
    ongoing: true
  },
  consequences: [
    {
      type: "ECONOMY",
      target: "food_prices",
      effect: "decrease",
      value: -10
    },
    {
      type: "REPUTATION",
      target: "Merchants",
      effect: "increase",
      value: 5
    }
  ],
  playerAwareness: "PARTIAL"
});
```

### **Updating an Event**

```typescript
await updateWorldEvent({
  userId: "user123",
  eventId: "harvest_festival_2024",
  newDevelopments: "Unexpected rain threatens to dampen the festivities",
  statusChange: "ESCALATING",
  newConsequences: [
    {
      type: "WORLD_STATE",
      target: "festival_mood",
      effect: "concerned",
      value: 0
    }
  ],
  playerAwarenessChange: "FULL"
});
```

## Best Practices

### **Event Design**
1. **Make events feel natural** - They should emerge from existing world state
2. **Create meaningful consequences** - Events should matter to gameplay
3. **Provide player opportunities** - Events should create new possibilities
4. **Maintain realism** - Events should fit the world's internal logic
5. **Consider timing** - Events should happen at appropriate intervals

### **Player Integration**
1. **Gradual revelation** - Let players discover events naturally
2. **Multiple discovery paths** - Provide various ways to learn about events
3. **Player agency** - Give players ways to influence event outcomes
4. **Meaningful choices** - Player responses to events should matter
5. **Long-term consequences** - Events should have lasting impact

## Future Enhancements

- **Event prediction system** - AI that forecasts likely future events
- **Player influence tracking** - How player actions affect event probability
- **Event impact visualization** - UI showing how events affect the world
- **Event history system** - Detailed records of past events and their effects
- **Community events** - Large-scale events that affect multiple players