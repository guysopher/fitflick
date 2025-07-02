import { pgTable, serial, text, varchar, integer, timestamp, boolean, json, real, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table - extends NextAuth user data
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  image: varchar('image', { length: 255 }),
  level: integer('level').default(1),
  coins: integer('coins').default(0),
  streak: integer('streak').default(0),
  totalWorkouts: integer('total_workouts').default(0),
  badges: json('badges').$type<string[]>().default([]),
  waterCups: integer('water_cups').default(0),
  unlockedCostumes: json('unlocked_costumes').$type<string[]>().default([]),
  currentCostume: varchar('current_costume', { length: 100 }).default('default'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Workouts table - stores individual workout sessions
export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  totalDuration: integer('total_duration'), // in seconds
  caloriesBurned: integer('calories_burned'),
  difficulty: varchar('difficulty', { length: 50 }),
  coinsEarned: integer('coins_earned').default(0),
  completed: boolean('completed').default(false),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Exercises table - stores exercise definitions
export const exerciseDefinitions = pgTable('exercise_definitions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  videoUrl: varchar('video_url', { length: 255 }),
  duration: varchar('duration', { length: 50 }),
  difficulty: varchar('difficulty', { length: 50 }),
  targetMuscles: json('target_muscles').$type<string[]>(),
  instructions: json('instructions').$type<string[]>(),
  category: varchar('category', { length: 100 }),
  equipment: varchar('equipment', { length: 100 }),
  benefits: json('benefits').$type<string[]>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Workout exercises table - links exercises to workouts with performance data
export const workoutExercises = pgTable('workout_exercises', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').references(() => workouts.id),
  exerciseId: integer('exercise_id').references(() => exerciseDefinitions.id),
  exerciseName: varchar('exercise_name', { length: 255 }).notNull(), // Store name for historical data
  orderIndex: integer('order_index').notNull(),
  actualDuration: integer('actual_duration'), // in seconds
  restDuration: integer('rest_duration'), // in seconds
  completionPercentage: real('completion_percentage').default(0),
  difficulty: varchar('difficulty', { length: 50 }),
  targetMuscles: json('target_muscles').$type<string[]>(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// User exercise statistics - track performance over time
export const userExerciseStats = pgTable('user_exercise_stats', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  exerciseId: integer('exercise_id').references(() => exerciseDefinitions.id),
  exerciseName: varchar('exercise_name', { length: 255 }).notNull(),
  totalCompletions: integer('total_completions').default(0),
  totalDuration: integer('total_duration').default(0), // in seconds
  bestDuration: integer('best_duration'), // in seconds
  averageDuration: integer('average_duration'), // in seconds
  lastCompletedAt: timestamp('last_completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User achievements/badges
export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  achievementType: varchar('achievement_type', { length: 100 }).notNull(),
  achievementName: varchar('achievement_name', { length: 255 }).notNull(),
  description: text('description'),
  earnedAt: timestamp('earned_at').defaultNow(),
  metadata: json('metadata'), // Additional data for the achievement
});

// User daily stats
export const userDailyStats = pgTable('user_daily_stats', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD format
  workoutsCompleted: integer('workouts_completed').default(0),
  totalExercises: integer('total_exercises').default(0),
  totalDuration: integer('total_duration').default(0), // in seconds
  caloriesBurned: integer('calories_burned').default(0),
  coinsEarned: integer('coins_earned').default(0),
  waterCups: integer('water_cups').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.date] }),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  workouts: many(workouts),
  exerciseStats: many(userExerciseStats),
  achievements: many(userAchievements),
  dailyStats: many(userDailyStats),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
  exercises: many(workoutExercises),
}));

export const exerciseDefinitionsRelations = relations(exerciseDefinitions, ({ many }) => ({
  workoutExercises: many(workoutExercises),
  userStats: many(userExerciseStats),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutExercises.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exerciseDefinitions, {
    fields: [workoutExercises.exerciseId],
    references: [exerciseDefinitions.id],
  }),
}));

export const userExerciseStatsRelations = relations(userExerciseStats, ({ one }) => ({
  user: one(users, {
    fields: [userExerciseStats.userId],
    references: [users.id],
  }),
  exercise: one(exerciseDefinitions, {
    fields: [userExerciseStats.exerciseId],
    references: [exerciseDefinitions.id],
  }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
}));

export const userDailyStatsRelations = relations(userDailyStats, ({ one }) => ({
  user: one(users, {
    fields: [userDailyStats.userId],
    references: [users.id],
  }),
}));

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type ExerciseDefinition = typeof exerciseDefinitions.$inferSelect;
export type NewExerciseDefinition = typeof exerciseDefinitions.$inferInsert;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;
export type UserExerciseStats = typeof userExerciseStats.$inferSelect;
export type NewUserExerciseStats = typeof userExerciseStats.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
export type UserDailyStats = typeof userDailyStats.$inferSelect;
export type NewUserDailyStats = typeof userDailyStats.$inferInsert; 