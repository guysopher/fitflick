# 🐶 Shahar's Workout Adventure

A mobile-first gamified workout app designed specifically for kids, featuring Zumba the dog and friends! Built with Next.js, React, and TypeScript.

## 🎯 Features

### 🏋️‍♀️ Workout Experience
- **TikTok-style video player** with full-screen workout videos
- **Progressive difficulty** - workouts get longer/harder each week
- **Kid-friendly exercise names** like "Zumba Zoom," "Hamster Hop," "Tail Wag Twists"
- **Professional video controls** with play/pause, seek, restart functionality

### 🎮 Gamification
- **Daily rewards system** with coins and costume unlocks
- **Achievement badges** for reaching milestones
- **Streak tracking** to build consistent habits
- **Leveling system** that unlocks new content
- **Avatar customization** for personalization

### 🐶 Characters
- **Zumba the dog** - Playful trainer guiding every session
- **Hamster sidekick** - Provides motivation, hydration reminders, and daily jokes
- **Interactive encouragement** during workouts

### 🎵 Music Integration
- **Spotify integration** for energizing workout playlists
- **Genre selection** - Pop, Dance, Cartoon themes, Kids music
- **Auto-play during workouts** with easy controls

### 💧 Health Tracking
- **Hydration tracker** - Log water cups with visual progress
- **Workout progress** - Track completed sessions and streaks
- **Daily reminders** from characters

### 📱 Mobile-First PWA
- **Installable app** that works like a native mobile app
- **Offline functionality** - works without internet after first load
- **Push notifications** for workout reminders
- **Responsive design** optimized for phones and tablets

### 🎉 Social Features
- **WhatsApp sharing** - Share workout completions with family
- **Achievement sharing** with custom messages
- **Progress celebration** with fun animations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd exercises-webgl
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add workout videos**
   ```bash
   # Create videos directory
   mkdir -p public/videos
   
   # Add your workout video files:
   # public/videos/zumba-zoom.mp4
   # public/videos/hamster-hop.mp4
   # public/videos/tail-wag-twists.mp4
   ```

4. **Add app icons (optional)**
   ```bash
   # Add these files to public/ directory:
   # icon-192.png (192x192 pixels)
   # icon-512.png (512x512 pixels)
   # See public/icon-generation.md for details
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - On mobile, use your phone's browser for the best experience

## 📁 Project Structure

```
exercises-webgl/
├── public/
│   ├── videos/                 # Workout video files
│   │   ├── zumba-zoom.mp4
│   │   ├── hamster-hop.mp4
│   │   └── tail-wag-twists.mp4
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker for offline functionality
│   ├── icon-192.png           # App icon (192x192)
│   └── icon-512.png           # App icon (512x512)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # App layout with PWA metadata
│   │   ├── page.tsx            # Main page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── GameWorkoutApp.tsx  # Main app component
│   │   ├── SpotifyPlayer.tsx   # Music integration
│   │   └── ExerciseVideo.tsx   # Video player component
│   └── data/
│       └── exercises.ts        # Exercise data
```

## 🎮 How to Use

### For Shahar (The User)
1. **Open the app** on your phone or tablet
2. **Choose your music** - Pop, Dance, Cartoon, or Kids songs
3. **Pick a workout** - Start with "Zumba Zoom" for beginners
4. **Follow Zumba** - Watch the video and copy the movements
5. **Stay hydrated** - Tap the water drop when you drink water
6. **Complete workouts** - Earn coins and unlock new costumes!
7. **Share achievements** - Tell your family about your progress!

### For Parents/Guardians
- **Daily reminders** - App sends gentle notifications
- **Progress tracking** - See Shahar's workout history and streaks
- **Safe content** - All workouts designed specifically for kids
- **Offline friendly** - Works without internet after first use
- **No ads or purchases** - Safe, contained experience

## 🔧 Customization

### Adding New Workouts
1. Add video file to `public/videos/`
2. Update workout data in `src/data/exercises.ts`
3. Add appropriate difficulty and coin rewards

### Changing Characters
- Update character dialogues in `GameWorkoutApp.tsx`
- Modify emoji characters (🐶 for Zumba, 🐹 for Hamster)
- Customize motivational messages

### Styling
- Modify colors in `src/app/globals.css`
- Update gradient themes in component files
- Customize animations and transitions

## 🎵 Spotify Setup (Optional)

To enable real Spotify integration:
1. Create a Spotify Developer account
2. Register your app and get Client ID
3. Set up OAuth2 flow in `SpotifyPlayer.tsx`
4. Add environment variables for Spotify credentials

Current version includes a demo player with sample playlists.

## 📱 PWA Installation

Users can install the app on their devices:

**iOS (Safari):**
1. Open app in Safari
2. Tap Share button
3. Select "Add to Home Screen"

**Android (Chrome):**
1. Open app in Chrome
2. Tap menu (three dots)
3. Select "Add to Home screen"

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
npx vercel --prod
```

### Other Platforms
- Build: `npm run build`
- Static files: `out/` directory
- Deploy to any static hosting service

## 🎨 Design Principles

- **Kid-friendly colors** - Purple, pink, bright and cheerful
- **Large touch targets** - Easy for small fingers
- **Simple navigation** - Minimal cognitive load
- **Immediate feedback** - Animations and sounds for actions
- **Positive reinforcement** - Rewards and encouragement
- **Safety first** - No external links or inappropriate content

## 🔧 Technical Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for responsive styling
- **Lucide React** for icons
- **Service Worker** for offline functionality
- **Web Manifest** for PWA capabilities
- **Local Storage** for progress persistence

## 🤝 Contributing

This app is designed specifically for Shahar, but feel free to:
- Report bugs or issues
- Suggest new workout ideas
- Improve accessibility features
- Add new character interactions

## 📄 License

This project is created for personal use. Please respect video content copyrights and music licensing when adding your own content.

---

**Made with ❤️ for Shahar - Let's get moving with Zumba! 🐶💪**
