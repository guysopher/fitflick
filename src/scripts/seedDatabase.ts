import { db, exerciseDefinitions } from '../lib/db';
import { exercises } from '../data/exercises';

async function seedExercises() {
  console.log('Starting database seeding...');
  
  try {
    // Check if exercises already exist
    const existingExercises = await db.query.exerciseDefinitions.findMany();
    
    if (existingExercises.length > 0) {
      console.log(`Found ${existingExercises.length} existing exercises. Skipping seed.`);
      return;
    }

    // Insert exercises from the exercises.ts file
    const exerciseData = exercises.map(exercise => ({
      name: exercise.name,
      description: exercise.description,
      videoUrl: exercise.videoUrl,
      duration: exercise.duration,
      difficulty: exercise.difficulty,
      targetMuscles: exercise.targetMuscles,
      instructions: exercise.instructions,
      category: exercise.category,
      equipment: exercise.equipment,
      benefits: exercise.benefits,
      isActive: true,
    }));

    const result = await db.insert(exerciseDefinitions).values(exerciseData).returning();
    
    console.log(`Successfully seeded ${result.length} exercises to the database!`);
    
    // Print seeded exercises
    result.forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.name} (${exercise.difficulty})`);
    });
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedExercises();
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  main();
}

export { seedExercises }; 