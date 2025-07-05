import { Exercise } from './exercises';

export interface CustomWorkout {
  id: number;
  name: string;
  description: string;
  exercises: Exercise[];
  structure: {
    rounds: number;
    workDuration: string;
    restDuration: string;
    totalDuration: string;
  };
  exerciseBreakdown: {
    cardio: number;
    core: number;
    fitness: number;
  };
}

export interface DailyWorkoutSchedule {
  dayOfWeek: string;
  workoutId: number;
  workoutName: string;
  restDay?: boolean;
}

// Import specific exercises by ID from the exercises array
const getExerciseById = (id: number): Exercise => {
  // This will be populated with actual exercise data
  const exercises = [
    {
      id: 2,
      name: 'Jumping Jacks',
      description: 'Jump feet wide while clapping hands overhead, then jump back to start in one smooth rhythm.',
      videoUrl: '/videos/Jumping Jacks.mp4',
      duration: '20 seconds',
      difficulty: 'Beginner' as const,
      targetMuscles: ['Full Body', 'Cardio system'],
      category: 'Cardio',
      equipment: 'None',
      instructions: [
        'Start feet together, arms by sides.',
        'Jump feet out shoulder-width as hands clap overhead.',
        'Jump feet back in and drop arms.',
        'Keep a steady, light bounce throughout.'
      ],
      benefits: [
        'Boosts heart rate quickly',
        'Improves coordination',
        'Warms up multiple muscles'
      ]
    },
    {
      id: 3,
      name: 'Running in Place',
      description: 'Jog on the spot, lifting feet a few centimetres off the floor and pumping arms like outdoor running.',
      videoUrl: '/videos/Running in Place.mp4',
      duration: '20 seconds',
      difficulty: 'Beginner' as const,
      targetMuscles: ['Legs', 'Core', 'Cardio system'],
      category: 'Cardio',
      equipment: 'None',
      instructions: [
        'Stand tall with soft knees.',
        'Lift one foot then the other in jogging rhythm.',
        'Swing elbows at 90° beside body.',
        'Land softly on the balls of the feet.'
      ],
      benefits: [
        'Elevates heart rate',
        'Improves leg endurance',
        'Can be done anywhere'
      ]
    },
    {
      id: 5,
      name: 'Quick Jumps in Place',
      description: 'Fast pogo-style hops, staying light on the feet for quick bursts of energy.',
      videoUrl: '/videos/Quicks Jumps in Place.mp4',
      duration: '20 seconds',
      difficulty: 'Beginner' as const,
      targetMuscles: ['Calves', 'Ankles'],
      category: 'Plyometric',
      equipment: 'None',
      instructions: [
        'Stand feet hip-width apart, knees soft.',
        'Jump up just a few centimetres, heels off floor.',
        'Land quietly and repeat rapidly.',
        'Keep torso upright and core engaged.'
      ],
      benefits: [
        'Builds ankle strength',
        'Enhances speed and agility',
        'Fun energy booster'
      ]
    },
    {
      id: 6,
      name: 'Knees to Chest (High Knees)',
      description: 'Run on the spot while lifting each knee toward the belly button for a cardio-core combo.',
      videoUrl: '/videos/Knees to Chest.mp4',
      duration: '20 seconds',
      difficulty: 'Beginner' as const,
      targetMuscles: ['Hip Flexors', 'Core', 'Cardio system'],
      category: 'Cardio',
      equipment: 'None',
      instructions: [
        'Stand tall, core tight.',
        'Drive right knee up toward chest.',
        'Switch legs quickly as arms pump.',
        'Aim to keep thighs parallel to floor each lift.'
      ],
      benefits: [
        'Raises heart rate fast',
        'Strengthens hip flexors',
        'Improves running mechanics'
      ]
    },
    {
      id: 7,
      name: 'Squats',
      description: 'Lower body move that mimics sitting in a chair, powering back up through the heels.',
      videoUrl: '/videos/Squats.mp4',
      duration: '20 seconds',
      difficulty: 'Beginner' as const,
      targetMuscles: ['Glutes', 'Quads', 'Hamstrings'],
      category: 'Strength',
      equipment: 'None',
      instructions: [
        'Feet shoulder-width, toes slightly out.',
        'Push hips back and bend knees.',
        'Lower until thighs are roughly parallel.',
        'Drive through heels to stand tall.'
      ],
      benefits: [
        'Strengthens legs and glutes',
        'Enhances core stability',
        'Improves everyday movement patterns'
      ]
    },
    {
      id: 8,
      name: 'Classic Crunches',
      description: 'Curl shoulders off the floor to work the upper abs without pulling the neck.',
      videoUrl: '/videos/Classic Crunches.mp4',
      duration: '20 seconds',
      difficulty: 'Beginner' as const,
      targetMuscles: ['Upper Abs'],
      category: 'Core',
      equipment: 'None',
      instructions: [
        'Lie on back, knees bent, feet flat.',
        'Fingertips lightly behind ears.',
        'Lift shoulders toward knees, exhale.',
        'Lower slowly without resting head fully.'
      ],
      benefits: [
        'Isolates upper abdominal muscles',
        'Easy to learn',
        'Helps build core endurance'
      ]
    },
    {
      id: 9,
      name: 'Seated V Position',
      description: 'Balance on tailbone with legs and torso forming a "V"; hold for time to fire up the core.',
      videoUrl: '/videos/Seated V position.mp4',
      duration: '20 seconds',
      difficulty: 'Intermediate' as const,
      targetMuscles: ['Abdominals', 'Hip Flexors'],
      category: 'Core',
      equipment: 'None',
      instructions: [
        'Sit, knees bent, feet on floor.',
        'Lean back 45° and lift shins until parallel.',
        'Straighten arms forward, squeeze core.',
        'Hold while breathing calmly.'
      ],
      benefits: [
        'Improves core stability',
        'Challenges balance',
        'Strengthens hip flexors'
      ]
    },
    {
      id: 10,
      name: 'Seated Side V (Boat Twist)',
      description: 'Maintain the V position while twisting torso side-to-side to tap the floor.',
      videoUrl: '/videos/Seated Side V .mp4',
      duration: '20 seconds',
      difficulty: 'Intermediate' as const,
      targetMuscles: ['Obliques', 'Core'],
      category: 'Core',
      equipment: 'None',
      instructions: [
        'Hold the basic V.',
        'Clasp hands, rotate to tap beside right hip.',
        'Return centre, tap beside left hip.',
        'Keep legs lifted throughout.'
      ],
      benefits: [
        'Targets side abs',
        'Boosts rotational strength',
        'Raises balance challenge'
      ]
    },
    {
      id: 11,
      name: 'Lying Leg Lifts',
      description: 'Raise straight legs up to 90° and lower slowly without letting heels touch the floor.',
      videoUrl: '/videos/Lying down leg lifts.mp4',
      duration: '20 seconds',
      difficulty: 'Intermediate' as const,
      targetMuscles: ['Lower Abs', 'Hip Flexors'],
      category: 'Core',
      equipment: 'None',
      instructions: [
        'Lie flat, hands under hips.',
        'Lift both legs to ceiling.',
        'Lower legs under control until just above floor.',
        'Repeat, keeping lower back pressed down.'
      ],
      benefits: [
        'Strengthens lower abs',
        'Improves hip flexor endurance',
        'Teaches core control'
      ]
    },
    {
      id: 12,
      name: 'Half Leg Lifts',
      description: 'Lower legs only halfway before raising again—continuous tension for extra burn.',
      videoUrl: '/videos/Lying down half leg lifts.mp4',
      duration: '20 seconds',
      difficulty: 'Intermediate' as const,
      targetMuscles: ['Lower Abs'],
      category: 'Core',
      equipment: 'None',
      instructions: [
        'Begin like full leg lift.',
        'Lower legs to 45°, pause.',
        'Lift back to vertical.',
        'Keep heels off floor the whole set.'
      ],
      benefits: [
        'Increases time-under-tension',
        'Strengthens deep core muscles',
        'Great progression from full lifts'
      ]
    },
    {
      id: 13,
      name: 'Hands-to-Toes (V-Ups)',
      description: 'Explosive V-up: snap arms and legs together to meet in the middle.',
      videoUrl: '/videos/Lying down Hands to Toes.mp4',
      duration: '20 seconds',
      difficulty: 'Advanced' as const,
      targetMuscles: ['Full Abs', 'Hip Flexors'],
      category: 'Core',
      equipment: 'None',
      instructions: [
        'Lie flat, arms overhead.',
        'In one motion, raise torso and legs.',
        'Touch hands to toes at top.',
        'Lower with control and repeat.'
      ],
      benefits: [
        'Works entire core chain',
        'Improves flexibility and power',
        'Fun dynamic movement'
      ]
    },
    {
      id: 14,
      name: 'Plank',
      description: 'Hold a straight-line plank on forearms, keeping hips level and core tight.',
      videoUrl: '/videos/Plank.mp4',
      duration: '20 seconds',
      difficulty: 'Intermediate' as const,
      targetMuscles: ['Core', 'Shoulders', 'Back'],
      category: 'Core',
      equipment: 'None',
      instructions: [
        'Elbows under shoulders, legs extended.',
        'Tighten belly and glutes.',
        'Keep neck neutral, gaze down.',
        'Hold without sagging or piking.'
      ],
      benefits: [
        'Enhances core endurance',
        'Protects the spine',
        'Transfers to many sports skills'
      ]
    },
    {
      id: 15,
      name: 'Leg Hover Hold',
      description: 'Hover straight legs just above the floor and hold—an isometric lower-ab crusher.',
      videoUrl: '/videos/Laying Down legs straight a little above the floor.mp4',
      duration: '20 seconds',
      difficulty: 'Advanced' as const,
      targetMuscles: ['Lower Abs', 'Hip Flexors'],
      category: 'Core',
      equipment: 'None',
      instructions: [
        'Lie flat, hands under hips.',
        'Lift legs 10 cm off floor.',
        'Press lower back down.',
        'Hold still, breathing calmly.'
      ],
      benefits: [
        'Maxes out lower-ab activation',
        'Teaches core bracing',
        'Great finisher for ab circuits'
      ]
    }
  ];
  
  return exercises.find(ex => ex.id === id)!;
};

export const customWorkouts: CustomWorkout[] = [
  {
    id: 1,
    name: "Cardio Blast Core Builder",
    description: "Perfect beginner-friendly workout that gets your heart pumping while building foundational core strength. This balanced routine combines energetic cardio moves with essential core stabilization exercises.",
    exercises: [
      getExerciseById(2),  // Jumping Jacks (Cardio)
      getExerciseById(8),  // Classic Crunches (Core)
      getExerciseById(3),  // Running in Place (Cardio)
      getExerciseById(14), // Plank (Fitness - Core Strength)
      getExerciseById(11), // Lying Leg Lifts (Core)
      getExerciseById(7),  // Squats (Fitness - Strength)
      getExerciseById(9),  // Seated V Position (Core)
      getExerciseById(12), // Half Leg Lifts (Core)
    ],
    structure: {
      rounds: 2,
      workDuration: "20 seconds",
      restDuration: "10 seconds",
      totalDuration: "8 minutes"
    },
    exerciseBreakdown: {
      cardio: 2,
      core: 4,
      fitness: 2
    }
  },
  {
    id: 2,
    name: "High-Intensity Core Crusher",
    description: "Step up the intensity with this challenging workout that combines explosive cardio with dynamic core movements. Features advanced exercises that demand power, coordination, and core stability.",
    exercises: [
      getExerciseById(6),  // Knees to Chest (Cardio)
      getExerciseById(13), // Hands-to-Toes V-Ups (Fitness - Dynamic Strength)
      getExerciseById(2),  // Jumping Jacks (Cardio)
      getExerciseById(10), // Seated Side V (Core)
      getExerciseById(5),  // Quick Jumps in Place (Fitness - Plyometric)
      getExerciseById(12), // Half Leg Lifts (Core)
      getExerciseById(14), // Plank (Core)
      getExerciseById(8),  // Classic Crunches (Core)
    ],
    structure: {
      rounds: 2,
      workDuration: "20 seconds",
      restDuration: "10 seconds",
      totalDuration: "8 minutes"
    },
    exerciseBreakdown: {
      cardio: 2,
      core: 4,
      fitness: 2
    }
  },
  {
    id: 3,
    name: "Endurance Core Challenge",
    description: "Build lasting core strength and cardiovascular endurance with this methodical workout. Focuses on sustained effort and proper form to develop functional fitness and muscular endurance.",
    exercises: [
      getExerciseById(3),  // Running in Place (Cardio)
      getExerciseById(15), // Leg Hover Hold (Fitness - Isometric Strength)
      getExerciseById(6),  // Knees to Chest (Cardio)
      getExerciseById(8),  // Classic Crunches (Core)
      getExerciseById(7),  // Squats (Fitness - Strength)
      getExerciseById(9),  // Seated V Position (Core)
      getExerciseById(11), // Lying Leg Lifts (Core)
      getExerciseById(10), // Seated Side V (Core)
    ],
    structure: {
      rounds: 2,
      workDuration: "20 seconds",
      restDuration: "10 seconds",
      totalDuration: "8 minutes"
    },
    exerciseBreakdown: {
      cardio: 2,
      core: 4,
      fitness: 2
    }
  },
  {
    id: 4,
    name: "Power Core Finisher",
    description: "The ultimate advanced workout combining explosive movements with challenging core holds. This high-intensity session pushes your limits with powerful, dynamic exercises that build both strength and athletic performance.",
    exercises: [
      getExerciseById(2),  // Jumping Jacks (Cardio)
      getExerciseById(13), // Hands-to-Toes V-Ups (Core)
      getExerciseById(6),  // Knees to Chest (Cardio)
      getExerciseById(5),  // Quick Jumps in Place (Fitness - Plyometric)
      getExerciseById(14), // Plank (Core)
      getExerciseById(15), // Leg Hover Hold (Fitness - Isometric Strength)
      getExerciseById(10), // Seated Side V (Core)
      getExerciseById(12), // Half Leg Lifts (Core)
    ],
    structure: {
      rounds: 2,
      workDuration: "20 seconds",
      restDuration: "10 seconds",
      totalDuration: "8 minutes"
    },
    exerciseBreakdown: {
      cardio: 2,
      core: 4,
      fitness: 2
    }
  }
];

// Weekly workout schedule - ensures each day gets a different workout
export const weeklyWorkoutSchedule: DailyWorkoutSchedule[] = [
  {
    dayOfWeek: "Monday",
    workoutId: 1,
    workoutName: "Cardio Blast Core Builder"
  },
  {
    dayOfWeek: "Tuesday",
    workoutId: 2,
    workoutName: "High-Intensity Core Crusher"
  },
  {
    dayOfWeek: "Wednesday",
    workoutId: 3,
    workoutName: "Endurance Core Challenge"
  },
  {
    dayOfWeek: "Thursday",
    workoutId: 4,
    workoutName: "Power Core Finisher"
  },
  {
    dayOfWeek: "Friday",
    workoutId: 1,
    workoutName: "Cardio Blast Core Builder"
  },
  {
    dayOfWeek: "Saturday",
    workoutId: 3,
    workoutName: "Endurance Core Challenge"
  },
  {
    dayOfWeek: "Sunday",
    workoutId: 2,
    workoutName: "High-Intensity Core Crusher"
  }
];

// Get workout for today
export const getTodaysWorkout = (): CustomWorkout => {
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[today];
  
  const todaysSchedule = weeklyWorkoutSchedule.find(schedule => schedule.dayOfWeek === todayName);
  
  if (!todaysSchedule) {
    // Fallback to first workout if schedule not found
    return customWorkouts[0];
  }
  
  return customWorkouts.find(workout => workout.id === todaysSchedule.workoutId) || customWorkouts[0];
};

// Get workout for a specific date
export const getWorkoutForDate = (date: Date): CustomWorkout => {
  const dayOfWeek = date.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayOfWeek];
  
  const daySchedule = weeklyWorkoutSchedule.find(schedule => schedule.dayOfWeek === dayName);
  
  if (!daySchedule) {
    // Fallback to first workout if schedule not found
    return customWorkouts[0];
  }
  
  return customWorkouts.find(workout => workout.id === daySchedule.workoutId) || customWorkouts[0];
};

// Get workout rotation for any continuous sequence (for long-term planning)
export const getWorkoutRotation = (startDate: Date, numberOfDays: number): CustomWorkout[] => {
  const workoutRotation: CustomWorkout[] = [];
  
  for (let i = 0; i < numberOfDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    workoutRotation.push(getWorkoutForDate(currentDate));
  }
  
  return workoutRotation;
};

// Get next workout (next day's workout)
export const getNextWorkout = (): { workout: CustomWorkout, dayName: string } => {
  const today = new Date();
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + 1);
  
  const workout = getWorkoutForDate(nextDate);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[nextDate.getDay()];
  
  return { workout, dayName };
};

export default customWorkouts; 