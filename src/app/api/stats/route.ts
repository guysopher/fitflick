import { NextRequest, NextResponse } from 'next/server';
import { db, users, userDailyStats, userExerciseStats, workouts } from '@/lib/db';
import { eq, desc, and, gte, count, sum } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// GET /api/stats - Get user statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateString = startDate.toISOString().split('T')[0];

    // Get daily stats for the period
    const dailyStats = await db.query.userDailyStats.findMany({
      where: and(
        eq(userDailyStats.userId, user.id),
        gte(userDailyStats.date, startDateString)
      ),
      orderBy: desc(userDailyStats.date),
    });

    // Get exercise performance stats
    const exerciseStats = await db.query.userExerciseStats.findMany({
      where: eq(userExerciseStats.userId, user.id),
      orderBy: desc(userExerciseStats.totalCompletions),
      limit: 10, // Top 10 exercises
    });

    // Get workout summary
    const totalWorkoutsResult = await db
      .select({ count: count() })
      .from(workouts)
      .where(and(
        eq(workouts.userId, user.id),
        eq(workouts.completed, true)
      ));

    const totalWorkouts = totalWorkoutsResult[0]?.count || 0;

    // Get recent workouts
    const recentWorkouts = await db.query.workouts.findMany({
      where: and(
        eq(workouts.userId, user.id),
        eq(workouts.completed, true)
      ),
      orderBy: desc(workouts.completedAt),
      limit: 5,
      with: {
        exercises: {
          orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.orderIndex)],
        },
      },
    });

    // Calculate streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const sortedDailyStats = [...dailyStats].sort((a, b) => b.date.localeCompare(a.date));
    
    for (let i = 0; i < sortedDailyStats.length; i++) {
      const stat = sortedDailyStats[i];
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateString = expectedDate.toISOString().split('T')[0];
      
      if (stat.date === expectedDateString && (stat.workoutsCompleted || 0) > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate totals from daily stats
    const periodTotals = dailyStats.reduce((acc, stat) => ({
      workouts: acc.workouts + (stat.workoutsCompleted || 0),
      exercises: acc.exercises + (stat.totalExercises || 0),
      duration: acc.duration + (stat.totalDuration || 0),
      calories: acc.calories + (stat.caloriesBurned || 0),
      coins: acc.coins + (stat.coinsEarned || 0),
    }), { workouts: 0, exercises: 0, duration: 0, calories: 0, coins: 0 });

    return NextResponse.json({
      user: {
        level: user.level || 1,
        coins: user.coins || 0,
        totalWorkouts: user.totalWorkouts || 0,
        badges: user.badges || [],
        currentStreak,
      },
      periodStats: {
        days,
        totals: periodTotals,
        dailyStats,
      },
      exerciseStats,
      recentWorkouts,
      summary: {
        totalCompletedWorkouts: totalWorkouts,
        averageWorkoutsPerWeek: Math.round((periodTotals.workouts / days) * 7),
        averageDuration: periodTotals.workouts > 0 ? Math.round(periodTotals.duration / periodTotals.workouts) : 0,
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 