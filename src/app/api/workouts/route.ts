import { NextRequest, NextResponse } from 'next/server';
import { db, workouts, workoutExercises, users, NewWorkout, NewWorkoutExercise, userExerciseStats, userDailyStats } from '@/lib/db';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// GET /api/workouts - Get user's workouts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user ID first
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch workouts with exercises
    const userWorkouts = await db.query.workouts.findMany({
      where: eq(workouts.userId, user.id),
      with: {
        exercises: {
          orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.orderIndex)],
        },
      },
      orderBy: desc(workouts.createdAt),
      limit,
      offset,
    });

    return NextResponse.json({ workouts: userWorkouts });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/workouts - Create a new workout
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, exercises: exercisesData, difficulty, estimatedDuration } = body;

    // Get user ID first
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create workout
    const newWorkout: NewWorkout = {
      userId: user.id,
      name,
      totalDuration: estimatedDuration,
      difficulty,
      completed: false,
    };

    const createdWorkouts = await db.insert(workouts).values(newWorkout).returning();
    const workout = createdWorkouts[0];

    // Create workout exercises
    if (exercisesData && exercisesData.length > 0) {
      const workoutExercisesData: NewWorkoutExercise[] = exercisesData.map((exercise: any, index: number) => ({
        workoutId: workout.id,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        orderIndex: index,
        difficulty: exercise.difficulty,
        targetMuscles: exercise.targetMuscles,
      }));

      await db.insert(workoutExercises).values(workoutExercisesData);
    }

    // Fetch the complete workout with exercises
    const completeWorkout = await db.query.workouts.findFirst({
      where: eq(workouts.id, workout.id),
      with: {
        exercises: {
          orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.orderIndex)],
        },
      },
    });

    return NextResponse.json({ workout: completeWorkout });
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 