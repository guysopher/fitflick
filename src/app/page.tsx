import ExerciseVideo from '@/components/ExerciseVideo'

export default function Home() {
  // Example exercise data - you can replace these with your actual video files
  const sampleExercises = [
    {
      name: "Jumping Jacks",
      description: "Full body cardio exercise that improves cardiovascular health and coordination",
      videoUrl: "/videos/jumping-jacks.mp4", // Replace with your actual video file
      duration: "30 seconds",
      difficulty: "Beginner" as const,
      targetMuscles: ["Full Body", "Cardiovascular"],
      instructions: [
        "Stand with feet together and arms at your sides",
        "Jump while spreading your legs shoulder-width apart",
        "Simultaneously raise your arms overhead",
        "Jump back to starting position",
        "Repeat in a continuous, rhythmic motion"
      ]
    },
    {
      name: "Push-ups",
      description: "Upper body strength exercise targeting chest, arms, and core muscles",
      videoUrl: "/videos/push-ups.mp4", // Replace with your actual video file
      duration: "45 seconds",
      difficulty: "Intermediate" as const,
      targetMuscles: ["Chest", "Arms", "Core"],
      instructions: [
        "Start in plank position with hands shoulder-width apart",
        "Keep your body in straight line from head to heels",
        "Lower your chest toward the ground",
        "Push back up to starting position",
        "Maintain proper form throughout"
      ]
    },
    {
      name: "Squats",
      description: "Lower body exercise that targets glutes, quadriceps, and hamstrings",
      videoUrl: "/videos/squats.mp4", // Replace with your actual video file
      duration: "60 seconds",
      difficulty: "Beginner" as const,
      targetMuscles: ["Glutes", "Quadriceps", "Hamstrings"],
      instructions: [
        "Stand with feet hip-width apart",
        "Lower your hips back and down as if sitting in a chair",
        "Keep your chest up and weight on your heels",
        "Lower until thighs are parallel to ground",
        "Push through heels to return to standing"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exercise Video Library</h1>
              <p className="text-gray-600 mt-1">Professional exercise demonstrations with detailed instructions</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                Video-Based Training
              </span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                HD Quality
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Professional Exercise Video Demonstrations
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Watch high-quality exercise videos with detailed instructions, proper form guidance, 
            and professional demonstrations. Each video includes step-by-step instructions to help 
            you perform exercises correctly and safely.
          </p>
        </div>

        {/* Video Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📹 How to Use Exercise Videos</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">📁 Video Setup:</h4>
              <ul className="space-y-1">
                <li>• Add your exercise videos to <code className="bg-blue-100 px-1 rounded">public/videos/</code></li>
                <li>• Use MP4 format for best compatibility</li>
                <li>• Name files descriptively (e.g., jumping-jacks.mp4)</li>
                <li>• Keep videos under 50MB for optimal loading</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎮 Video Controls:</h4>
              <ul className="space-y-1">
                <li>• Click anywhere on video to play/pause</li>
                <li>• Use progress bar to seek to specific times</li>
                <li>• Restart button to replay from beginning</li>
                <li>• All videos loop automatically</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Exercise Videos Grid */}
        <div className="space-y-12">
          {sampleExercises.map((exercise, index) => (
            <div key={index} className="w-full">
              <ExerciseVideo 
                exercise={exercise}
                autoPlay={false}
                showControls={true}
                className="max-w-4xl mx-auto"
              />
              
              {/* Exercise Details */}
              <div className="max-w-4xl mx-auto mt-6 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">✅ Benefits</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Improves cardiovascular fitness</li>
                      <li>• Builds functional strength</li>
                      <li>• Enhances coordination</li>
                      <li>• Burns calories effectively</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">💡 Tips</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Start with proper warm-up</li>
                      <li>• Focus on form over speed</li>
                      <li>• Breathe consistently throughout</li>
                      <li>• Stay hydrated during exercise</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* File Structure Guide */}
        <div className="mt-16 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📂 Project Structure for Videos</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`exercises-webgl/
├── public/
│   └── videos/
│       ├── jumping-jacks.mp4
│       ├── push-ups.mp4
│       ├── squats.mp4
│       ├── burpees.mp4
│       ├── plank.mp4
│       └── lunges.mp4
├── src/
│   ├── components/
│   │   └── ExerciseVideo.tsx
│   └── data/
│       └── exercises.ts`}</pre>
          </div>
          <p className="text-gray-600 mt-4 text-sm">
            Simply add your exercise video files to the <code className="bg-gray-200 px-1 rounded">public/videos/</code> directory 
            and update the <code className="bg-gray-200 px-1 rounded">videoUrl</code> property in your exercise data.
          </p>
        </div>

        {/* Next Steps */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 Next Steps</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="text-3xl mb-3">📹</div>
              <h4 className="font-semibold text-gray-900 mb-2">Add Your Videos</h4>
              <p className="text-gray-600 text-sm">
                Replace the placeholder video URLs with your actual exercise demonstration videos.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="text-3xl mb-3">📝</div>
              <h4 className="font-semibold text-gray-900 mb-2">Update Exercise Data</h4>
              <p className="text-gray-600 text-sm">
                Customize the exercise information, instructions, and metadata in the data file.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="text-3xl mb-3">🎨</div>
              <h4 className="font-semibult text-gray-900 mb-2">Customize UI</h4>
              <p className="text-gray-600 text-sm">
                Modify the video player styling and layout to match your brand and preferences.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 