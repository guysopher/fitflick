# 🎯 FitFlick - Gamified Workout Experience

## 🚀 The Ultimate Fitness Entertainment App

**FitFlick** transforms boring workouts into an engaging, gamified fitness adventure! With animated characters, TikTok-style workout videos, and a complete progression system, getting fit has never been this fun.

## ✨ Features That Make You Want to Move

### 🎮 Gamification System
- **Level Up**: Progress through fitness levels with each completed workout
- **Earn Coins**: Collect rewards for every exercise session
- **Achievement Badges**: Unlock special accomplishments
- **Streak Tracking**: Build daily workout consistency
- **Character Costumes**: Unlock new looks for your workout buddies

### 🎬 TikTok-Style Workout Videos
- **Immersive Video Player**: Full-screen workout experience
- **Follow Along**: Easy-to-follow exercise demonstrations
- **Progress Tracking**: Real-time workout completion monitoring
- **Interactive Controls**: Play, pause, restart, and volume control

### 🐹 Animated Workout Characters
- **Zumba**: Your energetic dance fitness companion
- **Hamster**: The adorable, high-energy workout buddy
- **Interactive Animations**: Characters that motivate and guide you
- **Costume Customization**: Dress up your workout friends

### 🎵 Spotify Integration
- **Workout Playlists**: Pump up your sessions with music
- **Seamless Integration**: Control music without leaving the app

### 💧 Wellness Features
- **Water Tracking**: Stay hydrated with cute water cup counters
- **Motivational Jokes**: Laugh while you sweat
- **Progress Visualization**: Beautiful progress bars and stats

## 🏋️ Workout Categories

### 💪 Strength Training
- Push-ups, Squats, Lunges, Planks
- Progressive difficulty levels
- Proper form demonstrations

### ❤️ Cardio Workouts
- Jumping Jacks, High Knees, Burpees
- Fat-burning HIIT sessions
- Endurance building exercises

### 🧘 Core & Flexibility
- Core strengthening routines
- Balance and stability exercises
- Stretching and recovery sessions

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **3D Graphics**: Three.js with React Three Fiber
- **Character Animation**: @pixiv/three-vrm for VRM character models
- **Styling**: Tailwind CSS for modern, responsive design
- **Icons**: Lucide React for beautiful iconography

## 🎯 Getting Started

### 🔐 Authentication Setup (Required)

FitFlick now includes Google Authentication to personalize your fitness journey and save your progress.

1. **Clone the Repository**
   ```bash
   git clone https://github.com/guysopher/fitflick.git
   cd fitflick
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Google OAuth** (Required for login)
   
   Follow the detailed setup guide in [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md) or:
   
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project and enable the Google+ API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI

4. **Create Environment Variables**
   
   Create a `.env.local` file in the project root:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXTAUTH_SECRET=your_generated_secret
   NEXTAUTH_URL=http://localhost:3000
   ```
   
   **Generate NextAuth Secret:**
   ```bash
   # Option 1: Using OpenSSL
   openssl rand -base64 32
   
   # Option 2: Using our helper script
   node generate-secret.js
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

6. **Open Your Browser**
   Navigate to `http://localhost:3000` and sign in with Google to start your fitness journey!

### 🔑 Authentication Features

- **Google Sign-In**: Secure authentication with your Google account
- **User Profile**: View your profile and manage settings
- **Progress Saving**: Your workout progress is automatically saved to your account
- **Personalized Experience**: Workouts and achievements are tied to your profile
- **Secure Logout**: Easy and secure sign-out functionality

## 🎨 Design Philosophy

FitFlick combines the addictive engagement of mobile games with the health benefits of regular exercise. By gamifying fitness, we make working out:

- **Fun**: Entertaining characters and rewards
- **Engaging**: Progressive challenges and achievements  
- **Social**: Shareable progress and achievements
- **Accessible**: Exercises for all fitness levels
- **Motivating**: Continuous positive reinforcement

## 🔮 Future Enhancements

- **Multiplayer Challenges**: Compete with friends
- **AR Integration**: Augmented reality workout guidance
- **Wearable Integration**: Sync with fitness trackers
- **Community Features**: Share workouts and achievements
- **AI Personal Trainer**: Personalized workout recommendations

## 👥 Perfect For

- Fitness beginners looking for motivation
- Busy professionals needing quick workouts
- Anyone who loves gaming and wants to gamify their health
- People who find traditional workouts boring
- Families wanting to exercise together

---

**Ready to make fitness fun?** Start your FitFlick journey today! 🎉

[![GitHub Stars](https://img.shields.io/github/stars/guysopher/fitflick?style=social)](https://github.com/guysopher/fitflick)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
