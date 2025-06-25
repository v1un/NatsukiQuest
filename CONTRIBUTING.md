# 🤝 Contributing to Natsuki Quest

Thank you for your interest in contributing to Natsuki Quest: A Re:Zero Adventure! This guide will help you get started with contributing to the project.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Pull Request Process](#pull-request-process)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Issue Guidelines](#issue-guidelines)
8. [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 20+ installed
- PostgreSQL database access
- Google AI API key for testing
- Discord application for OAuth testing

### Setup Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/NatsukiQuest.git
   cd NatsukiQuest
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Database Setup**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start Development**
   ```bash
   # Terminal 1: Next.js
   npm run dev
   
   # Terminal 2: Genkit (optional)
   npm run genkit:dev
   ```

For detailed setup instructions, see [docs/setup.md](docs/setup.md).

## 🔄 Development Process

### Branch Strategy

- `main` - Production branch (protected)
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical production fixes

### Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following our [coding standards](#coding-standards)
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run test
   npm run typecheck
   npm run lint
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new character interaction system"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review of code changes completed
- [ ] Tests added for new features
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Commit messages follow convention

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated Checks** - All CI checks must pass
2. **Code Review** - At least one maintainer review required
3. **Testing** - Manual testing for complex features
4. **Approval** - Maintainer approval required for merge

## 📝 Coding Standards

### TypeScript

```typescript
// ✅ Good: Explicit types
interface GameState {
  narrative: string;
  choices: string[];
}

// ❌ Bad: Any types
interface GameState {
  narrative: any;
  choices: any[];
}
```

### React Components

```typescript
// ✅ Good: Function component with proper props
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant, onClick, children }: ButtonProps) {
  return (
    <button 
      className={cn('btn', `btn-${variant}`)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### AI Prompts

```typescript
// ✅ Good: Structured prompt with clear instructions
const prompt = `You are the Game Master for Natsuki Quest.

**Directives:**
1. Advance narrative based on player choice
2. Update character relationships
3. Maintain Re:Zero lore accuracy

**Context:**
Current situation: {{{currentNarrative}}}
Player chose: "{{{playerChoice}}}"`;
```

For detailed coding standards, see [docs/development.md](docs/development.md).

## 📋 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(ai): add character emotion detection to game master flow
fix(auth): resolve Discord OAuth callback redirect issue
docs(setup): update database configuration instructions
style(ui): improve button component spacing
refactor(api): simplify game state management logic
test(ai): add comprehensive flow testing suite
chore(deps): update dependencies to latest versions
```

### Scope Guidelines

- `ai` - AI flows and prompt engineering
- `ui` - User interface components
- `auth` - Authentication system
- `db` - Database models and queries
- `api` - Server actions and endpoints
- `game` - Game logic and mechanics

## 🐛 Issue Guidelines

### Bug Reports

When reporting bugs, include:

- **Description** - Clear description of the issue
- **Steps to Reproduce** - Detailed steps to reproduce
- **Expected Behavior** - What should happen
- **Actual Behavior** - What actually happens
- **Environment** - OS, Node version, browser, etc.
- **Screenshots** - If applicable

### Feature Requests

When requesting features, include:

- **Problem Statement** - What problem does this solve?
- **Proposed Solution** - How should it work?
- **Alternatives** - Other solutions considered
- **Re:Zero Context** - How does it fit the anime/novel lore?

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `ai-system` - Related to AI flows
- `ui/ux` - User interface/experience
- `lore` - Re:Zero accuracy concerns

## 👥 Community

### Getting Help

- **GitHub Discussions** - Ask questions and share ideas
- **GitHub Issues** - Report bugs and request features
- **Documentation** - Check the docs/ folder for detailed guides

### Recognition

Contributors are recognized in:

- **README Contributors Section** - All contributors listed
- **Release Notes** - Significant contributions highlighted
- **Special Thanks** - Outstanding contributions acknowledged

### Areas for Contribution

#### 🤖 AI & Prompt Engineering
- Improve narrative generation prompts
- Add new AI flows for game mechanics
- Optimize AI response quality

#### 🎨 Frontend & UI
- Improve user interface design
- Add animations and transitions
- Enhance mobile responsiveness

#### 🗄️ Backend & Database
- Optimize database queries
- Add new API endpoints
- Improve error handling

#### 📖 Documentation
- Write tutorials and guides
- Improve code documentation
- Create video explanations

#### 🧪 Testing
- Write unit and integration tests
- Test AI flow consistency
- Performance testing

#### 🌐 Localization
- Translate to other languages
- Adapt cultural references
- Support right-to-left languages

## 🎮 Re:Zero Lore Guidelines

When contributing content that touches on Re:Zero lore:

### Accuracy Standards
- **Characters** - Maintain consistent personalities and relationships
- **World Building** - Respect established rules and locations
- **Timeline** - Consider where events fit in the story
- **Magic System** - Follow established magic rules and limitations

### Lore Resources
- [Re:Zero Wiki](https://rezero.fandom.com/wiki/Re:Zero_Wiki) - Comprehensive lore reference
- [Light Novel Summaries](https://rezero.fandom.com/wiki/Light_Novel) - Official story content
- [Character Profiles](https://rezero.fandom.com/wiki/Category:Characters) - Character details

### Original Content Guidelines
- Stay true to the Re:Zero tone and themes
- Avoid contradicting established canon
- When in doubt, ask maintainers for guidance
- Mark clearly as "original content" when adding new scenarios

---

## 🎉 Thank You!

Your contributions make Natsuki Quest better for everyone. Whether you're fixing a typo, adding a feature, or improving documentation, every contribution matters.

*"The only ones who should kill are those who are prepared to be killed!"* - Lelouch vi Britannia (wrong anime, but the dedication applies! 😄)

Actually... *"I will save everyone. No matter how many times it takes."* - Natsuki Subaru ✨