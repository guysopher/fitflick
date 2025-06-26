export interface Exercise {
  id: number;
  name: string;
  category: string;
  description: string;
  targetMuscles: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const exercises: Exercise[] = [
  // Cardio Exercises
  { id: 1, name: "Jumping Jacks", category: "Cardio", description: "Full body cardio exercise", targetMuscles: ["Full Body"], difficulty: "Beginner" },
  { id: 2, name: "High Knees", category: "Cardio", description: "Running in place with high knees", targetMuscles: ["Legs", "Core"], difficulty: "Beginner" },
  { id: 3, name: "Butt Kickers", category: "Cardio", description: "Kick heels to glutes", targetMuscles: ["Hamstrings", "Glutes"], difficulty: "Beginner" },
  { id: 4, name: "Mountain Climbers", category: "Cardio", description: "Plank position with alternating leg drives", targetMuscles: ["Core", "Shoulders", "Legs"], difficulty: "Intermediate" },
  { id: 5, name: "Burpees", category: "Cardio", description: "Full body explosive movement", targetMuscles: ["Full Body"], difficulty: "Advanced" },
  { id: 6, name: "Jump Rope", category: "Cardio", description: "Simulated rope jumping", targetMuscles: ["Calves", "Shoulders"], difficulty: "Beginner" },
  { id: 7, name: "Star Jumps", category: "Cardio", description: "Jumping jacks with arms overhead", targetMuscles: ["Full Body"], difficulty: "Beginner" },
  { id: 8, name: "Squat Jumps", category: "Cardio", description: "Explosive jump from squat position", targetMuscles: ["Quads", "Glutes", "Calves"], difficulty: "Intermediate" },
  { id: 9, name: "Tuck Jumps", category: "Cardio", description: "Jump bringing knees to chest", targetMuscles: ["Core", "Legs"], difficulty: "Advanced" },
  { id: 10, name: "Split Jumps", category: "Cardio", description: "Lunge position jump switches", targetMuscles: ["Legs", "Core"], difficulty: "Intermediate" },

  // Upper Body Exercises
  { id: 11, name: "Push-ups", category: "Upper Body", description: "Classic chest and arm exercise", targetMuscles: ["Chest", "Triceps", "Shoulders"], difficulty: "Beginner" },
  { id: 12, name: "Diamond Push-ups", category: "Upper Body", description: "Push-ups with diamond hand position", targetMuscles: ["Triceps", "Chest"], difficulty: "Advanced" },
  { id: 13, name: "Wide Push-ups", category: "Upper Body", description: "Push-ups with wide hand position", targetMuscles: ["Chest", "Shoulders"], difficulty: "Intermediate" },
  { id: 14, name: "Pike Push-ups", category: "Upper Body", description: "Push-ups in downward dog position", targetMuscles: ["Shoulders", "Triceps"], difficulty: "Intermediate" },
  { id: 15, name: "Tricep Dips", category: "Upper Body", description: "Dips using chair or bench", targetMuscles: ["Triceps", "Shoulders"], difficulty: "Beginner" },
  { id: 16, name: "Plank to Push-up", category: "Upper Body", description: "Transition from plank to push-up", targetMuscles: ["Core", "Chest", "Triceps"], difficulty: "Intermediate" },
  { id: 17, name: "Arm Circles", category: "Upper Body", description: "Circular arm movements", targetMuscles: ["Shoulders"], difficulty: "Beginner" },
  { id: 18, name: "Shoulder Shrugs", category: "Upper Body", description: "Shoulder elevation exercise", targetMuscles: ["Trapezius"], difficulty: "Beginner" },
  { id: 19, name: "Wall Push-ups", category: "Upper Body", description: "Push-ups against wall", targetMuscles: ["Chest", "Triceps"], difficulty: "Beginner" },
  { id: 20, name: "Incline Push-ups", category: "Upper Body", description: "Push-ups with hands elevated", targetMuscles: ["Chest", "Triceps"], difficulty: "Beginner" },

  // Lower Body Exercises
  { id: 21, name: "Squats", category: "Lower Body", description: "Basic squat movement", targetMuscles: ["Quads", "Glutes"], difficulty: "Beginner" },
  { id: 22, name: "Lunges", category: "Lower Body", description: "Forward lunge movement", targetMuscles: ["Quads", "Glutes", "Hamstrings"], difficulty: "Beginner" },
  { id: 23, name: "Reverse Lunges", category: "Lower Body", description: "Backward lunge movement", targetMuscles: ["Quads", "Glutes", "Hamstrings"], difficulty: "Beginner" },
  { id: 24, name: "Side Lunges", category: "Lower Body", description: "Lateral lunge movement", targetMuscles: ["Quads", "Glutes", "Adductors"], difficulty: "Intermediate" },
  { id: 25, name: "Calf Raises", category: "Lower Body", description: "Rising onto toes", targetMuscles: ["Calves"], difficulty: "Beginner" },
  { id: 26, name: "Single Leg Squats", category: "Lower Body", description: "Pistol squat progression", targetMuscles: ["Quads", "Glutes"], difficulty: "Advanced" },
  { id: 27, name: "Sumo Squats", category: "Lower Body", description: "Wide stance squats", targetMuscles: ["Quads", "Glutes", "Adductors"], difficulty: "Beginner" },
  { id: 28, name: "Curtsy Lunges", category: "Lower Body", description: "Cross-behind lunge", targetMuscles: ["Glutes", "Quads"], difficulty: "Intermediate" },
  { id: 29, name: "Wall Sits", category: "Lower Body", description: "Isometric squat against wall", targetMuscles: ["Quads", "Glutes"], difficulty: "Beginner" },
  { id: 30, name: "Glute Bridges", category: "Lower Body", description: "Hip thrust movement", targetMuscles: ["Glutes", "Hamstrings"], difficulty: "Beginner" },

  // Core Exercises
  { id: 31, name: "Plank", category: "Core", description: "Isometric core hold", targetMuscles: ["Core", "Shoulders"], difficulty: "Beginner" },
  { id: 32, name: "Side Plank", category: "Core", description: "Lateral plank position", targetMuscles: ["Obliques", "Core"], difficulty: "Intermediate" },
  { id: 33, name: "Crunches", category: "Core", description: "Abdominal crunching movement", targetMuscles: ["Abs"], difficulty: "Beginner" },
  { id: 34, name: "Bicycle Crunches", category: "Core", description: "Alternating elbow to knee", targetMuscles: ["Abs", "Obliques"], difficulty: "Intermediate" },
  { id: 35, name: "Russian Twists", category: "Core", description: "Seated torso rotation", targetMuscles: ["Obliques", "Core"], difficulty: "Intermediate" },
  { id: 36, name: "Leg Raises", category: "Core", description: "Lying leg elevation", targetMuscles: ["Lower Abs"], difficulty: "Intermediate" },
  { id: 37, name: "Dead Bug", category: "Core", description: "Alternating arm and leg extension", targetMuscles: ["Core", "Hip Flexors"], difficulty: "Beginner" },
  { id: 38, name: "Bird Dog", category: "Core", description: "Opposite arm and leg extension", targetMuscles: ["Core", "Glutes"], difficulty: "Beginner" },
  { id: 39, name: "Flutter Kicks", category: "Core", description: "Alternating leg kicks", targetMuscles: ["Lower Abs", "Hip Flexors"], difficulty: "Intermediate" },
  { id: 40, name: "Scissor Kicks", category: "Core", description: "Crossing leg movements", targetMuscles: ["Lower Abs"], difficulty: "Intermediate" },

  // Plyometric Exercises
  { id: 41, name: "Box Jumps", category: "Plyometric", description: "Jump onto elevated surface", targetMuscles: ["Legs", "Glutes"], difficulty: "Intermediate" },
  { id: 42, name: "Broad Jumps", category: "Plyometric", description: "Forward jumping movement", targetMuscles: ["Legs", "Glutes"], difficulty: "Intermediate" },
  { id: 43, name: "Lateral Jumps", category: "Plyometric", description: "Side-to-side jumping", targetMuscles: ["Legs", "Glutes"], difficulty: "Intermediate" },
  { id: 44, name: "Single Leg Hops", category: "Plyometric", description: "Hopping on one leg", targetMuscles: ["Calves", "Ankles"], difficulty: "Intermediate" },
  { id: 45, name: "Depth Jumps", category: "Plyometric", description: "Jump down then up", targetMuscles: ["Legs", "Glutes"], difficulty: "Advanced" },
  { id: 46, name: "Plyo Push-ups", category: "Plyometric", description: "Explosive push-up with clap", targetMuscles: ["Chest", "Triceps"], difficulty: "Advanced" },
  { id: 47, name: "Skater Jumps", category: "Plyometric", description: "Side-to-side skating motion", targetMuscles: ["Legs", "Glutes"], difficulty: "Intermediate" },
  { id: 48, name: "Frog Jumps", category: "Plyometric", description: "Deep squat jump forward", targetMuscles: ["Legs", "Glutes"], difficulty: "Intermediate" },
  { id: 49, name: "Pogo Jumps", category: "Plyometric", description: "Continuous small jumps", targetMuscles: ["Calves", "Ankles"], difficulty: "Beginner" },
  { id: 50, name: "Bunny Hops", category: "Plyometric", description: "Two-footed forward hops", targetMuscles: ["Legs", "Core"], difficulty: "Intermediate" },

  // Functional Movement
  { id: 51, name: "Bear Crawl", category: "Functional", description: "Crawling on hands and feet", targetMuscles: ["Full Body"], difficulty: "Intermediate" },
  { id: 52, name: "Crab Walk", category: "Functional", description: "Walking in crab position", targetMuscles: ["Triceps", "Shoulders", "Core"], difficulty: "Intermediate" },
  { id: 53, name: "Inchworms", category: "Functional", description: "Walking out to plank", targetMuscles: ["Core", "Shoulders"], difficulty: "Intermediate" },
  { id: 54, name: "Turkish Get-ups", category: "Functional", description: "Complex rising movement", targetMuscles: ["Full Body"], difficulty: "Advanced" },
  { id: 55, name: "Crawling Patterns", category: "Functional", description: "Various crawling movements", targetMuscles: ["Full Body"], difficulty: "Intermediate" },
  { id: 56, name: "Army Crawl", category: "Functional", description: "Low crawl on forearms", targetMuscles: ["Core", "Shoulders"], difficulty: "Intermediate" },
  { id: 57, name: "Lateral Crawl", category: "Functional", description: "Side-to-side bear crawl", targetMuscles: ["Shoulders", "Core"], difficulty: "Intermediate" },
  { id: 58, name: "Reverse Crawl", category: "Functional", description: "Backward bear crawl", targetMuscles: ["Shoulders", "Core"], difficulty: "Intermediate" },
  { id: 59, name: "Commando Crawl", category: "Functional", description: "Military-style crawl", targetMuscles: ["Full Body"], difficulty: "Advanced" },
  { id: 60, name: "Lizard Crawl", category: "Functional", description: "Low lateral crawl", targetMuscles: ["Core", "Shoulders"], difficulty: "Intermediate" },

  // Agility Exercises
  { id: 61, name: "Ladder Drills", category: "Agility", description: "Footwork ladder patterns", targetMuscles: ["Legs", "Coordination"], difficulty: "Intermediate" },
  { id: 62, name: "Cone Drills", category: "Agility", description: "Cone weaving patterns", targetMuscles: ["Legs", "Coordination"], difficulty: "Intermediate" },
  { id: 63, name: "Shuttle Runs", category: "Agility", description: "Back and forth sprints", targetMuscles: ["Legs", "Cardio"], difficulty: "Intermediate" },
  { id: 64, name: "T-Drill", category: "Agility", description: "T-shaped running pattern", targetMuscles: ["Legs", "Coordination"], difficulty: "Intermediate" },
  { id: 65, name: "5-10-5 Drill", category: "Agility", description: "Pro agility shuttle", targetMuscles: ["Legs", "Coordination"], difficulty: "Intermediate" },
  { id: 66, name: "Hexagon Drill", category: "Agility", description: "Six-sided jumping pattern", targetMuscles: ["Legs", "Coordination"], difficulty: "Intermediate" },
  { id: 67, name: "Zig-Zag Runs", category: "Agility", description: "Diagonal running pattern", targetMuscles: ["Legs", "Coordination"], difficulty: "Intermediate" },
  { id: 68, name: "Four Corner Drill", category: "Agility", description: "Square running pattern", targetMuscles: ["Legs", "Coordination"], difficulty: "Intermediate" },
  { id: 69, name: "Figure 8 Runs", category: "Agility", description: "Figure-eight running pattern", targetMuscles: ["Legs", "Coordination"], difficulty: "Intermediate" },
  { id: 70, name: "Reactive Drills", category: "Agility", description: "Response-based movements", targetMuscles: ["Full Body", "Coordination"], difficulty: "Advanced" },

  // Flexibility & Mobility
  { id: 71, name: "Leg Swings", category: "Mobility", description: "Dynamic leg swinging", targetMuscles: ["Hip Flexors", "Hamstrings"], difficulty: "Beginner" },
  { id: 72, name: "Arm Swings", category: "Mobility", description: "Dynamic arm swinging", targetMuscles: ["Shoulders"], difficulty: "Beginner" },
  { id: 73, name: "Hip Circles", category: "Mobility", description: "Circular hip movements", targetMuscles: ["Hip Flexors"], difficulty: "Beginner" },
  { id: 74, name: "Torso Twists", category: "Mobility", description: "Spinal rotation movements", targetMuscles: ["Obliques", "Spine"], difficulty: "Beginner" },
  { id: 75, name: "Neck Rolls", category: "Mobility", description: "Circular neck movements", targetMuscles: ["Neck"], difficulty: "Beginner" },
  { id: 76, name: "Ankle Circles", category: "Mobility", description: "Circular ankle movements", targetMuscles: ["Ankles"], difficulty: "Beginner" },
  { id: 77, name: "Shoulder Rolls", category: "Mobility", description: "Circular shoulder movements", targetMuscles: ["Shoulders"], difficulty: "Beginner" },
  { id: 78, name: "Wrist Circles", category: "Mobility", description: "Circular wrist movements", targetMuscles: ["Wrists"], difficulty: "Beginner" },
  { id: 79, name: "Knee Hugs", category: "Mobility", description: "Pulling knees to chest", targetMuscles: ["Hip Flexors", "Glutes"], difficulty: "Beginner" },
  { id: 80, name: "Butt Kicks Walk", category: "Mobility", description: "Walking heel-to-glute kicks", targetMuscles: ["Hamstrings"], difficulty: "Beginner" },

  // Balance & Stability
  { id: 81, name: "Single Leg Stand", category: "Balance", description: "Standing on one leg", targetMuscles: ["Stabilizers", "Core"], difficulty: "Beginner" },
  { id: 82, name: "Tree Pose", category: "Balance", description: "Yoga tree balance pose", targetMuscles: ["Stabilizers", "Core"], difficulty: "Beginner" },
  { id: 83, name: "Warrior III", category: "Balance", description: "Yoga warrior III pose", targetMuscles: ["Stabilizers", "Core"], difficulty: "Intermediate" },
  { id: 84, name: "Heel-to-Toe Walk", category: "Balance", description: "Walking in straight line", targetMuscles: ["Stabilizers"], difficulty: "Beginner" },
  { id: 85, name: "Bosu Ball Squats", category: "Balance", description: "Squats on unstable surface", targetMuscles: ["Legs", "Stabilizers"], difficulty: "Intermediate" },
  { id: 86, name: "Single Leg Deadlift", category: "Balance", description: "Deadlift on one leg", targetMuscles: ["Hamstrings", "Glutes", "Stabilizers"], difficulty: "Intermediate" },
  { id: 87, name: "Stork Stand", category: "Balance", description: "Standing on one leg with eyes closed", targetMuscles: ["Stabilizers"], difficulty: "Intermediate" },
  { id: 88, name: "Wobble Board", category: "Balance", description: "Balancing on wobble board", targetMuscles: ["Stabilizers"], difficulty: "Intermediate" },
  { id: 89, name: "Tightrope Walk", category: "Balance", description: "Walking on imaginary tightrope", targetMuscles: ["Stabilizers"], difficulty: "Beginner" },
  { id: 90, name: "Flamingo Stand", category: "Balance", description: "Single leg stand with arm movements", targetMuscles: ["Stabilizers", "Core"], difficulty: "Intermediate" },

  // Compound Movements
  { id: 91, name: "Thrusters", category: "Compound", description: "Squat to overhead press", targetMuscles: ["Full Body"], difficulty: "Intermediate" },
  { id: 92, name: "Man Makers", category: "Compound", description: "Burpee with dumbbell row", targetMuscles: ["Full Body"], difficulty: "Advanced" },
  { id: 93, name: "Squat to Press", category: "Compound", description: "Squat with overhead press", targetMuscles: ["Legs", "Shoulders"], difficulty: "Intermediate" },
  { id: 94, name: "Lunge to Curl", category: "Compound", description: "Lunge with bicep curl", targetMuscles: ["Legs", "Biceps"], difficulty: "Intermediate" },
  { id: 95, name: "Deadlift to Row", category: "Compound", description: "Deadlift with upright row", targetMuscles: ["Back", "Legs"], difficulty: "Intermediate" },
  { id: 96, name: "Clean and Press", category: "Compound", description: "Olympic lift variation", targetMuscles: ["Full Body"], difficulty: "Advanced" },
  { id: 97, name: "Squat to Calf Raise", category: "Compound", description: "Squat with calf raise", targetMuscles: ["Legs", "Calves"], difficulty: "Beginner" },
  { id: 98, name: "Push-up to T", category: "Compound", description: "Push-up with rotation", targetMuscles: ["Chest", "Core"], difficulty: "Intermediate" },
  { id: 99, name: "Plank to Downward Dog", category: "Compound", description: "Plank to yoga pose", targetMuscles: ["Core", "Shoulders"], difficulty: "Intermediate" },
  { id: 100, name: "Burpee Box Jump", category: "Compound", description: "Burpee with box jump", targetMuscles: ["Full Body"], difficulty: "Advanced" },
];

export const exerciseCategories = [
  "Cardio",
  "Upper Body", 
  "Lower Body",
  "Core",
  "Plyometric",
  "Functional",
  "Agility",
  "Mobility",
  "Balance",
  "Compound"
];

export const difficultyLevels = ["Beginner", "Intermediate", "Advanced"]; 