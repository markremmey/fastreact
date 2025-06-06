// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { loginWithPassword } = useAuth();
  const navigate = useNavigate();
  // State for form inputs and error message
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await loginWithPassword(username, password);
      // On success, AuthContext will handle navigation
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      // This is the endpoint on our own backend that will create the Google auth URL
      const authorizeUrl = `${baseUrl}/auth/google/authorize`;
      console.log("authorizeUrl", authorizeUrl);
      // 1. Fetch the authorization URL from our backend
      const res = await fetch(authorizeUrl);

      if (!res.ok) {
        console.error("Failed response:", res);
        throw new Error("Could not fetch the Google authorization URL from the backend.");
      }

      // 2. Extract the actual Google URL from the JSON response
      const data = await res.json();
      const googleRedirectUrl = data.authorization_url;

      if (typeof googleRedirectUrl !== 'string') {
        throw new Error("Authorization URL not found or invalid in the response from the backend.");
      }

      // 3. Redirect the user to Google's login page
      window.location.href = googleRedirectUrl;

    } catch (err) {
      console.error("Google login error:", err);
      setError("Could not start the Google sign-in process. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-md p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
            Lyceum AI
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
        )}

        <div>
          <label className="block text-gray-700 mb-1" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          Log In
        </button>
      </form>
      <div className="mt-4 text-center space-y-3">
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition mb-3"
        >
          Sign in with Google
        </button>
        <p className="text-gray-600 text-sm">
          New user?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;
