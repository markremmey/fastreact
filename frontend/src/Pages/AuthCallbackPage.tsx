import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const AuthCallbackPage: React.FC = () => {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // If a token is found, use the login function from AuthContext
      login(token);
      // The login function will automatically navigate to /profile on success
    } else {
      // If no token is found, there's been an error in the OAuth flow
      setError('Authentication failed. No token provided. Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <p className="text-gray-700">Finalizing authentication, please wait...</p>
      )}
    </div>
  );
};

export default AuthCallbackPage; 