'use client';

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-yellow-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full mx-auto border border-white/20">
        
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">🏋️‍♀️</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            FitFlick
          </h1>
          <p className="text-gray-600 text-sm">
            Your personalized workout adventure awaits!
          </p>
        </div>

        {/* Features Preview */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">📅</span>
            </div>
            <span>Track your daily workouts</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🎵</span>
            </div>
            <span>Workout with energizing music</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🏆</span>
            </div>
            <span>Gamified fitness experience</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl p-4 flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-gray-700 font-medium">Signing in...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium group-hover:text-gray-900">
                Continue with Google
              </span>
            </>
          )}
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Floating Workout Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl animate-bounce delay-0">💪</div>
        <div className="absolute top-32 right-16 text-3xl animate-bounce delay-200">🏃‍♀️</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-bounce delay-400">🧘‍♀️</div>
        <div className="absolute bottom-20 right-12 text-4xl animate-bounce delay-600">⚡</div>
        <div className="absolute top-1/2 left-8 text-2xl animate-bounce delay-800">🎯</div>
        <div className="absolute top-1/3 right-8 text-2xl animate-bounce delay-1000">🔥</div>
      </div>
    </div>
  )
} 