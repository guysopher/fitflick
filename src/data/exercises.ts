// exercises.ts
// One self-contained workout featuring all 14 custom video drills,
// ordered from easiest to most difficult for a 10-year-old user.

export interface Exercise {
  id: number;
  name: string;
  description: string;
  videoUrl: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  targetMuscles: string[];
  instructions: string[];
  category: string;
  equipment: string;
  benefits: string[];
}

export interface Workout {
  id: number;
  name: string;
  exercises: Exercise[];
}

const exercises: Exercise[] = [
  {
    id: 1,
    name: 'Ready Stance (Neutral)',
    description:
      'Stand upright with feet hip-width apart, arms relaxed at sides, shoulders back and tummy gently tight. Use this as the perfect posture check before any move.',
    videoUrl: '/videos/Standard Mode Animation Video.mp4',
    duration: '15 seconds',
    difficulty: 'Beginner',
    targetMuscles: ['Posture', 'Core stabilisers'],
    category: 'Warm-up',
    equipment: 'None',
    instructions: [
      'Look straight ahead, soften knees.',
      'Roll shoulders back and down.',
      'Lightly tighten tummy and glutes.',
      'Hold the pose and breathe steadily.'
    ],
    benefits: [
      'Promotes good posture',
      'Activates core gently',
      'Sets a “ready” mindset'
    ]
  },
  {
    id: 2,
    name: 'Jumping Jacks',
    description:
      'Jump feet wide while clapping hands overhead, then jump back to start in one smooth rhythm.',
    videoUrl: '/videos/Jumping Jacks.mp4',
    duration: '30 seconds',
    difficulty: 'Beginner',
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
    description:
      'Jog on the spot, lifting feet a few centimetres off the floor and pumping arms like outdoor running.',
    videoUrl: '/videos/Running in Place.mp4',
    duration: '30 seconds',
    difficulty: 'Beginner',
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
    id: 4,
    name: 'Jumping Rope (Imaginary)',
    description:
      'Small rhythmic hops while twirling an “air” jump rope with the wrists.',
    videoUrl: '/videos/Jumping Rope.mp4',
    duration: '30 seconds',
    difficulty: 'Beginner',
    targetMuscles: ['Calves', 'Shoulders', 'Cardio system'],
    category: 'Cardio',
    equipment: 'None',
    instructions: [
      'Keep elbows close to ribs, palms forward.',
      'Flick wrists in tiny circles as if swinging a rope.',
      'Hop lightly off the ground, landing on balls of feet.',
      'Maintain an even pace and soft knees.'
    ],
    benefits: [
      'Improves timing and rhythm',
      'Strengthens calves',
      'Great calorie burner without gear'
    ]
  },
  {
    id: 5,
    name: 'Quick Jumps in Place',
    description:
      'Fast pogo-style hops, staying light on the feet for quick bursts of energy.',
    videoUrl: '/videos/Quicks Jumps in Place.mp4',
    duration: '20 seconds',
    difficulty: 'Beginner',
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
    description:
      'Run on the spot while lifting each knee toward the belly button for a cardio-core combo.',
    videoUrl: '/videos/Knees to Chest.mp4',
    duration: '30 seconds',
    difficulty: 'Beginner',
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
    description:
      'Lower body move that mimics sitting in a chair, powering back up through the heels.',
    videoUrl: '/videos/Squats.mp4',
    duration: '40 seconds',
    difficulty: 'Beginner',
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
    description:
      'Curl shoulders off the floor to work the upper abs without pulling the neck.',
    videoUrl: '/videos/Classic Crunches.mp4',
    duration: '30 seconds',
    difficulty: 'Beginner',
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
    description:
      'Balance on tailbone with legs and torso forming a “V”; hold for time to fire up the core.',
    videoUrl: '/videos/Seated V position.mp4',
    duration: '30 seconds',
    difficulty: 'Intermediate',
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
    description:
      'Maintain the V position while twisting torso side-to-side to tap the floor.',
    videoUrl: '/videos/Seated Side V .mp4',
    duration: '30 seconds',
    difficulty: 'Intermediate',
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
    description:
      'Raise straight legs up to 90° and lower slowly without letting heels touch the floor.',
    videoUrl: '/videos/Lying down leg lifts.mp4',
    duration: '30 seconds',
    difficulty: 'Intermediate',
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
    description:
      'Lower legs only halfway before raising again—continuous tension for extra burn.',
    videoUrl: '/videos/Lying down half leg lifts.mp4',
    duration: '30 seconds',
    difficulty: 'Intermediate',
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
    description:
      'Explosive V-up: snap arms and legs together to meet in the middle.',
    videoUrl: '/videos/Lying down Hands to Toes.mp4',
    duration: '25 seconds',
    difficulty: 'Advanced',
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
    description:
      'Hold a straight-line plank on forearms, keeping hips level and core tight.',
    videoUrl: '/videos/Plank.mp4',
    duration: '40 seconds',
    difficulty: 'Intermediate',
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
    description:
      'Hover straight legs just above the floor and hold—an isometric lower-ab crusher.',
    videoUrl: '/videos/Laying Down legs straight a little above the floor.mp4',
    duration: '30 seconds',
    difficulty: 'Advanced',
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

// Derived arrays for filtering
export const exerciseCategories = Array.from(new Set(exercises.map(exercise => exercise.category))).sort();
export const difficultyLevels: ('Beginner' | 'Intermediate' | 'Advanced')[] = ['Beginner', 'Intermediate', 'Advanced'];

export { exercises };

export const beginnerToAdvancedWorkout: Workout = {
  id: 1,
  name: 'Shahar’s Full-Body Progression',
  exercises
};

export default beginnerToAdvancedWorkout;