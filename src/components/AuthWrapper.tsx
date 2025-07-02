'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserProfile from './UserProfile';

interface AuthWrapperProps {
  children: ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-2xl">🏋️‍♀️</span>
          </div>
          <div className="text-white text-lg font-medium mb-2">FitFlick</div>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-0"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
          </div>
          <p className="text-white/80 text-sm mt-4">Loading your workout...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect to signin
  }

  return (
    <>
      <UserProfile />
      {children}
    </>
  );
} 