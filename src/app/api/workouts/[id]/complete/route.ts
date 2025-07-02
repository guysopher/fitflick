import { NextRequest, NextResponse } from 'next/server';
import { db, workouts, workoutExercises, users, userExerciseStats, userDailyStats } from '@/lib/db';
import { eq, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workoutId = parseInt(params.id);
    const body = await request.json();
    const { 
      exerciseCompletions, 
      totalDuration, 
      caloriesBurned, 
      coinsEarned 
    } = body;

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify workout belongs to user
    const workout = await db.query.workouts.findFirst({
      where: and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, user.id)
      ),
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Update workout as completed
    await db
      .update(workouts)
      .set({
        completed: true,
        completedAt: new Date(),
        totalDuration,
        caloriesBurned,
        coinsEarned,
      })
      .where(eq(workouts.id, workoutId));

    // Update workout exercises with completion data
    if (exerciseCompletions && exerciseCompletions.length > 0) {
      for (const completion of exerciseCompletions) {
        await db
          .update(workoutExercises)
          .set({
            actualDuration: completion.actualDuration,
            restDuration: completion.restDuration,
            completionPercentage: completion.completionPercentage,
            completedAt: new Date(),
          })
          .where(
            and(
              eq(workoutExercises.workoutId, workoutId),
              eq(workoutExercises.exerciseId, completion.exerciseId)
            )
          );

        // Update user exercise stats
        const existingStats = await db.query.userExerciseStats.findFirst({
          where: and(
            eq(userExerciseStats.userId, user.id),
            eq(userExerciseStats.exerciseId, completion.exerciseId)
          ),
        });

        if (existingStats) {
          // Update existing stats
          const newTotalCompletions = (existingStats.totalCompletions || 0) + 1;
          const newTotalDuration = (existingStats.totalDuration || 0) + completion.actualDuration;
          const newAverageDuration = Math.round(newTotalDuration / newTotalCompletions);
          
          await db
            .update(userExerciseStats)
            .set({
              totalCompletions: newTotalCompletions,
              totalDuration: newTotalDuration,
              bestDuration: completion.actualDuration > (existingStats.bestDuration || 0) 
                ? completion.actualDuration 
                : existingStats.bestDuration,
              averageDuration: newAverageDuration,
              lastCompletedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(userExerciseStats.id, existingStats.id));
        } else {
          // Create new stats
          await db.insert(userExerciseStats).values({
            userId: user.id,
            exerciseId: completion.exerciseId,
            exerciseName: completion.exerciseName,
            totalCompletions: 1,
            totalDuration: completion.actualDuration,
            bestDuration: completion.actualDuration,
            averageDuration: completion.actualDuration,
            lastCompletedAt: new Date(),
          });
        }
      }
    }

    // Update user progress
    const newTotalWorkouts = (user.totalWorkouts || 0) + 1;
    const newCoins = (user.coins || 0) + (coinsEarned || 0);
    
    await db
      .update(users)
      .set({
        totalWorkouts: newTotalWorkouts,
        coins: newCoins,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const existingDailyStats = await db.query.userDailyStats.findFirst({
      where: and(
        eq(userDailyStats.userId, user.id),
        eq(userDailyStats.date, today)
      ),
    });

    if (existingDailyStats) {
      await db
        .update(userDailyStats)
        .set({
          workoutsCompleted: (existingDailyStats.workoutsCompleted || 0) + 1,
          totalExercises: (existingDailyStats.totalExercises || 0) + (exerciseCompletions?.length || 0),
          totalDuration: (existingDailyStats.totalDuration || 0) + (totalDuration || 0),
          caloriesBurned: (existingDailyStats.caloriesBurned || 0) + (caloriesBurned || 0),
          coinsEarned: (existingDailyStats.coinsEarned || 0) + (coinsEarned || 0),
          updatedAt: new Date(),
        })
        .where(eq(userDailyStats.id, existingDailyStats.id));
    } else {
      await db.insert(userDailyStats).values({
        userId: user.id,
        date: today,
        workoutsCompleted: 1,
        totalExercises: exerciseCompletions?.length || 0,
        totalDuration: totalDuration || 0,
        caloriesBurned: caloriesBurned || 0,
        coinsEarned: coinsEarned || 0,
      });
    }

    // Fetch updated workout data
    const completedWorkout = await db.query.workouts.findFirst({
      where: eq(workouts.id, workoutId),
      with: {
        exercises: {
          orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.orderIndex)],
        },
      },
    });

    return NextResponse.json({ 
      workout: completedWorkout,
      message: 'Workout completed successfully!'
    });
  } catch (error) {
    console.error('Error completing workout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 