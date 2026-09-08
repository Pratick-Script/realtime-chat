'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/chat');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-4">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
          Real-Time Chat
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Connect instantly with anyone, anywhere. Fast, secure, and beautiful real-time messaging powered by Appwrite.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/signup"
            className="px-8 py-4 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 text-sm font-medium text-gray-300 bg-gray-800 rounded-full hover:bg-gray-700 hover:text-white transition-all"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
