# 🛠️ Setup Guide

This guide will walk you through setting up Natsuki Quest for local development.

## Prerequisites

### Required Software
- **Node.js**: Version 20.0.0 or higher
- **Package Manager**: npm (comes with Node.js), pnpm (recommended), or yarn
- **PostgreSQL**: Version 12 or higher
- **Git**: For version control

### Optional Software
- **Firebase CLI**: For advanced Genkit features and deployment
- **Docker**: For containerized PostgreSQL if preferred

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/natsuki_quest"

# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:9002"

# Discord OAuth (for authentication)
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Google AI API (for Genkit)
GOOGLE_API_KEY="your-google-ai-api-key"

# Optional: Firebase Configuration (if using Firebase features)
FIREBASE_PROJECT_ID="your-firebase-project-id"
```

### Environment Variable Details

#### DATABASE_URL
- Format: `postgresql://[user]:[password]@[host]:[port]/[database]`
- Create a PostgreSQL database named `natsuki_quest` (or your preferred name)
- Ensure the user has full permissions on the database

#### NEXTAUTH_SECRET
- Generate a secure random string: `openssl rand -base64 32`
- Used for JWT token signing and encryption

#### Discord OAuth Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Navigate to OAuth2 → General
4. Copy Client ID and Client Secret
5. Add redirect URI: `http://localhost:9002/api/auth/callback/discord`

#### Google AI API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Enable the Gemini API for your project

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/NatsukiQuest.git
cd NatsukiQuest
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 3. Database Setup

#### Option A: Local PostgreSQL

```bash
# Create database (adjust connection details as needed)
createdb natsuki_quest

# Or using psql
psql -U postgres -c "CREATE DATABASE natsuki_quest;"
```

#### Option B: Docker PostgreSQL

```bash
# Start PostgreSQL container
docker run --name natsuki-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=natsuki_quest \
  -p 5432:5432 \
  -d postgres:15

# Update DATABASE_URL in .env.local accordingly
```

### 4. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Optional: View database in Prisma Studio
npx prisma studio
```

### 5. Verify Firebase Genkit Setup

```bash
# Install Genkit CLI globally (optional)
npm install -g genkit-cli

# Test Genkit flows
npm run genkit:dev
```

Visit `http://localhost:4000` to access the Genkit development UI.

## Development Server

### Start the Application

```bash
# Start Next.js development server
npm run dev
# or
pnpm dev

# Application will be available at http://localhost:9002
```

### Start Genkit Development Server (Separate Terminal)

```bash
# Start Genkit with hot reload
npm run genkit:dev
# or
pnpm genkit:dev

# Genkit UI available at http://localhost:4000
```

## Verification Checklist

- [ ] Application loads at `http://localhost:9002`
- [ ] Database connection successful (check console for errors)
- [ ] Discord authentication working (can sign in/out)
- [ ] Genkit UI accessible at `http://localhost:4000`
- [ ] AI flows respond in Genkit UI
- [ ] New game creation works
- [ ] Save/load functionality works

## Common Issues & Solutions

### Database Connection Errors

```bash
# Check PostgreSQL service status
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Test database connection
psql $DATABASE_URL
```

### Prisma Migration Issues

```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Push schema without migration
npx prisma db push
```

### Genkit Authentication Errors

```bash
# Verify Google AI API key
curl -H "Authorization: Bearer $GOOGLE_API_KEY" \
  "https://generativelanguage.googleapis.com/v1beta/models"

# Check Genkit configuration
npm run genkit:dev -- --debug
```

### Port Conflicts

If port 9002 is in use:

```bash
# Use different port
npm run dev -- -p 3000

# Update NEXTAUTH_URL in .env.local accordingly
```

## Next Steps

Once setup is complete:

1. 📖 Read the [Architecture Overview](architecture.md) to understand the system design
2. 🤖 Review [AI System Documentation](ai-system.md) for prompt engineering and Genkit flows
3. 🛠️ Check out [Development Guide](development.md) for coding standards and workflow
4. 🔌 Explore [API Documentation](api.md) to understand server actions
5. 🗄️ Review [Database Schema](database.md) for data models and relationships
6. 📁 Start exploring the codebase with `src/app/page.tsx`

## Additional Resources

- [Main README](../README.md) - Project overview and quick start
- [Deployment Guide](deployment.md) - Production deployment instructions
- [Re:Zero Wiki](https://rezero.fandom.com/wiki/Re:Zero_Wiki) - Lore reference for development

## Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

### Useful Commands

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Database operations
npx prisma studio          # Database GUI
npx prisma db seed         # Run seed script (if exists)
npx prisma format          # Format schema file

# Build for production
npm run build
npm run start
```

---

Need help? Check the [troubleshooting section](development.md#troubleshooting) or open an issue on GitHub.