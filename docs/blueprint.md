# **App Name**: Natsuki Quest: A Re:Zero Adventure

## Core Features:

- Dynamic Narrative: Use AI to dynamically generate the story, world, and character interactions based on user choices, Re:Zero lore, and Subaru's unique abilities and challenges, leveraging the LLM as a tool.
- Branching Paths: Present players with branching narrative paths based on Subaru's decisions, leading to different outcomes and story progression.
- Return by Death: Implement Subaru's 'Return by Death' ability, allowing players to rewind time upon failure and make different choices, with the AI tracking changes and consequences across loops. Enhanced with checkpoints.
- Character Bonds: Allow players to build and influence relationships with key characters from Re:Zero, affecting the story and unlocking new possibilities, with a display indicating affinity levels and statuses with these characters.
- Character Progression: Provide an interface for managing Subaru's inventory of items and skills, impacting his abilities and choices in the story.
- Adaptive Encounters: The LLM dynamically generates situations that align with player progress and previously-discovered game world lore, presenting new possibilities to use existing skills/abilities or create the need for the user to develop/learn new ones.
- Lore Accuracy: Maintain faithfulness to the established Re:Zero world, characters, and events while creating original content that fits seamlessly into the canon.
- Discord Authentication: Integrate NextAuth for user authentication, with support for Discord login.
- Lore-Accurate New Game: Hard-coded new game start with extremely accurate lore information.
- New Game: Allow player to start a new game
- Save/Load: Allow player to save and load
- Prisma + PostgreSQL: Support Prisma + PostgreSQL
- AI Game Master: The AI Narrator/GM has full control of the game state. Create advanced flows for it.
- Advanced Lorebook: Implement an advanced lorebook system with keyword detection to inject relevant information into the narrative context. This feature will use AI to identify and extract relevant lore based on the current game situation.
- Memory System: Develop a memory system that allows the AI to remember past events, player choices, and character interactions, influencing future story generation and character behavior.

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082) evoking the mysterious and challenging nature of Subaru's journey.
- Background color: Light Gray (#D3D3D3) for a neutral backdrop.
- Accent color: Vibrant Purple (#BE29EC) to highlight key decisions and moments, analogous to Indigo yet distinct in brightness and saturation.
- Body and headline font: 'Literata' serif for a literary feel appropriate to the app's complex narrative.
- Use clean, line-based icons representing items, skills, and character relationships. Icon colors to inherit from accent and primary colors.
- Subtle transitions and animations to enhance the feeling of 'Return by Death,' with a distinct visual cue to indicate time rewinding.