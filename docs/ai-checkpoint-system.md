# AI-Controlled Checkpoint & Return by Death System

## Overview

The checkpoint system and Return by Death (RbD) mechanics are now controlled by the AI Game Master instead of requiring manual user input. This creates a more immersive and authentic Re:Zero experience where the AI determines when checkpoints should be set and when Return by Death should be triggered.

## How It Works

### Automatic Checkpoint Setting

The AI Game Master will automatically set checkpoints when:

- **Safe Locations**: Player reaches inns, towns, campsites, or other safe areas
- **Story Progress**: Player completes major objectives or story beats
- **Pre-Danger**: Player is about to enter dangerous situations or face bosses
- **Important Choices**: Player makes significant relationship or story decisions
- **Key Discoveries**: Player discovers crucial story information or meets important characters

### Automatic Return by Death

The AI Game Master will automatically trigger Return by Death when:

- **Narrative Deaths**: Deaths that have strong story impact and learning value
- **Immediate Failures**: Player makes choices leading to immediate death
- **Critical Failures**: Player fails at crucial story moments
- **Story Consistency**: When automatic reset serves the narrative better than player choice

### Manual vs Automatic

**The AI decides between:**
- `shouldTriggerReturnByDeath: true` - Automatic reset, no player choice
- `isGameOver: true` - Traditional game over screen with manual RbD option

## User Experience

### Notifications

When the AI sets a checkpoint, you'll see:
- **Blue notification**: "Checkpoint Set" with the AI's reasoning
- **No interruption**: The story continues seamlessly

When the AI triggers RbD, you'll see:
- **Red/Purple notification**: "Return by Death Activated" with explanation  
- **Automatic reset**: You're immediately returned to the last checkpoint

### Benefits

1. **More Immersive**: No need to manually manage checkpoints
2. **Story-Driven**: AI understands narrative flow better than manual timing
3. **Authentic**: Matches Re:Zero's automatic nature of the ability
4. **Balanced**: AI can set checkpoints before difficult sections
5. **Intelligent**: AI knows when death should trigger immediate reset vs. choice

## Technical Implementation

### For Developers

The AI Game Master output now includes:

```typescript
{
  shouldSetCheckpoint: boolean;
  shouldTriggerReturnByDeath: boolean;
  checkpointReason?: string;
  rbdReason?: string;
}
```

### AI Prompt Guidance

The AI is instructed to:
- Set checkpoints at strategic narrative moments
- Trigger RbD for meaningful deaths
- Consider story impact when deciding between auto-RbD vs manual choice
- Provide reasoning for checkpoint/RbD decisions

## Backward Compatibility

- Manual checkpoint setting still available in sidebar
- Manual Return by Death still available when game over
- Existing save/load system unchanged
- All existing checkpoint functionality preserved

## Future Enhancements

- Visual indicators for AI-set checkpoints
- Player preferences for AI control level
- Analytics on AI checkpoint/RbD decisions
- Learning from player behavior patterns