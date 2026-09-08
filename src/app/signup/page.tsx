'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { account, databases, ID, appwriteConfig } from '@/lib/appwrite';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { checkAuth } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create Auth User
      const user = await account.create(ID.unique(), email, password, name);
      
      // 2. Login to create session
      await account.createEmailPasswordSession(email, password);

      // 3. Create profile document
      try {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          user.$id, // use the same ID as auth user
          {
            username: name,
            email: email,
            userId: Date.now(),
            status: 'active',
            registrationDate: new Date().toISOString(),
            passwordHash: 'managed-by-appwrite-auth',
            lastLoginDate: new Date().toISOString()
          }
        );
      } catch (profileError: any) {
        console.error("Failed to create profile document", profileError);
        alert("Account created, but Database Profile failed: " + profileError.message);
      }

      await checkAuth();
      router.push('/chat');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-2xl shadow-xl border border-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Create an Account</h1>
          <p className="mt-2 text-sm text-gray-400">Join the conversation today</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-900/30 rounded-lg border border-red-800/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 mt-1 text-white bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 mt-1 text-white bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              required
              minLength={8}
              className="w-full px-4 py-3 mt-1 text-white bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-500 hover:text-blue-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
