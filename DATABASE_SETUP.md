# FitFlick Database Setup Guide

This guide will help you set up the Vercel Postgres database for your FitFlick fitness app.

## Prerequisites

1. **Vercel Account**: Make sure you have a Vercel account
2. **Project Deployed**: Your FitFlick app should be deployed to Vercel
3. **Local Development**: Node.js and npm installed

## Step 1: Create Vercel Postgres Database

1. Go to your Vercel dashboard
2. Select your FitFlick project
3. Go to the "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Choose a database name (e.g., `fitflick-db`)
7. Select your preferred region
8. Click "Create"

## Step 2: Get Database Connection Details

After creating the database:

1. Go to your database dashboard
2. Click on the ".env.local" tab
3. Copy all the environment variables

Your `.env.local` file should include:
```env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NO_SSL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (from your existing setup)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI (from your existing setup)
OPENAI_API_KEY="your-openai-api-key"

# ElevenLabs (from your existing setup)
ELEVENLABS_API_KEY="your-elevenlabs-api-key"
```

## Step 3: Generate Database Schema

Run the following commands to set up your database schema:

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push
```

## Step 4: Seed the Database

Populate your database with exercise data:

```bash
# Run the seeding script
npm run db:seed
```

This will populate the `exercise_definitions` table with all the exercises from your `exercises.ts` file.

## Step 5: Verify Setup

You can verify your database setup using Drizzle Studio:

```bash
# Open Drizzle Studio
npm run db:studio
```

This will open a web interface where you can view and manage your database tables.

## Database Schema Overview

The database includes the following main tables:

### Users Table
- Stores user profile information
- Tracks level, coins, streak, total workouts
- Manages badges and costumes

### Workouts Table
- Records individual workout sessions
- Tracks completion status and performance metrics

### Exercise Definitions Table
- Stores all available exercises
- Includes metadata like difficulty, target muscles, instructions

### Workout Exercises Table
- Links exercises to specific workout sessions
- Records performance data for each exercise

### User Exercise Stats Table
- Tracks user performance over time for each exercise
- Calculates averages and best times

### User Daily Stats Table
- Daily aggregated statistics
- Used for streak calculation and progress tracking

### User Achievements Table
- Stores earned badges and achievements

## API Endpoints

The following API endpoints are available:

- `GET /api/users` - Get current user data
- `POST /api/users` - Create/update user
- `PUT /api/users` - Update user progress
- `GET /api/workouts` - Get user workouts
- `POST /api/workouts` - Create new workout
- `POST /api/workouts/[id]/complete` - Complete a workout
- `GET /api/stats` - Get user statistics

## Using the Database Integration

### In Your Components

Replace the old `GameWorkoutApp` with the new database-integrated version:

```tsx
// Instead of the old component
import GameWorkoutApp from '@/components/GameWorkoutApp';

// Use the new database-integrated version
import GameWorkoutAppDB from '@/components/GameWorkoutAppDB';

// Or use the custom hook directly
import { useUserData } from '@/hooks/useUserData';

function MyComponent() {
  const {
    userProgress,
    createWorkout,
    completeWorkout,
    updateUserProgress,
    getUserStats,
  } = useUserData();
  
  // Your component logic here
}
```

### User Data Management

The `useUserData` hook provides:

- **State**: `userProgress`, `loading`, `error`, `isAuthenticated`
- **Actions**: `createWorkout`, `completeWorkout`, `updateUserProgress`, `getUserStats`
- **Session**: Direct access to NextAuth session data

## Troubleshooting

### Database Connection Issues
1. Verify your environment variables are correctly set
2. Check that your Vercel Postgres database is active
3. Ensure you're using the correct connection string

### Schema Issues
1. Run `npm run db:generate` to regenerate schema files
2. Use `npm run db:push` to sync schema with database
3. Check Drizzle Studio for table structure

### Seeding Issues
1. Verify the `exercises.ts` file exists and has valid data
2. Check console output for seeding errors
3. Use Drizzle Studio to verify data was inserted

### Authentication Issues
1. Ensure NextAuth is properly configured
2. Check that user creation callback is working
3. Verify session data includes custom fields

## Production Deployment

When deploying to production:

1. Set all environment variables in your Vercel project settings
2. The database will automatically be available to your deployed app
3. Run migrations and seeding through Vercel's function console if needed

## Next Steps

1. **Analytics**: Add more detailed workout analytics
2. **Social Features**: Implement friend systems and leaderboards
3. **Achievements**: Expand the achievement system
4. **Offline Support**: Add offline workout tracking
5. **Data Export**: Allow users to export their workout data

## Support

If you encounter issues:

1. Check the Vercel dashboard for database status
2. Review application logs in Vercel
3. Use Drizzle Studio to inspect database state
4. Check the browser console for client-side errors

---

Your FitFlick app now has a complete database backend! Users can track their progress, earn coins, maintain streaks, and have all their workout data persisted across sessions. 