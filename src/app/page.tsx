"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dice1 } from 'lucide-react';
import { loginWithUsername, createSession, getSessionSync } from '@/lib/session';

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const roomId = searchParams.get('roomId');
    const session = getSessionSync();

    if (roomId && session) {
      // User has valid session and roomId, redirect to chat
      router.push(`/chat?roomId=${roomId}`);
      return;
    }

    // No roomId or no session, show login
    setInitializing(false);
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Call login API to get JWT token and roomId
      const result = await loginWithUsername(username);

      if (result.success) {
        // Create session with JWT token and roomId
        createSession(result.token, result.user.username, result.roomId, result.expiresAt);

        // Redirect to chat with roomId parameter
        router.push(`/chat?roomId=${result.roomId}`);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Dice Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Dice1 className="w-16 h-16 text-red-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-black rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">AnyCable demo!</h2>

        <div className="text-gray-600 mb-8 space-y-1">
          <p>Before joining a room please set up a username.</p>
          <p>You can also enter your email to see your</p>
          <p>Gravatar near your messages!</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Username Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jack.sparrow"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Enter'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-16 text-sm text-gray-500">
          Powered by <span className="text-red-500 font-medium">AnyCable</span>
        </div>
      </div>
    </div>
  );
}
