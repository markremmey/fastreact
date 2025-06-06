// frontend/src/AuthContext.tsx
import { createContext, useState, useEffect, useContext} from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the shape of our auth context state and functions
interface AuthContextType {
  token: string | null;
  login: (token: string) => void; // For handling token from OAuth
  loginWithPassword: (username: string, password: string) => Promise<void>; // For form-based login
  logout: () => void;
}
// Create context with default dummy values (to satisfy TypeScript)
const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  loginWithPassword: async () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);

  // Example: load token from localStorage on init
  useEffect(() => {
    const saved = localStorage.getItem('auth_token');
    if (saved) setToken(saved);
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('auth_token', newToken);
    navigate('/profile');
  };

  const loginWithPassword = async (username: string, password: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/jwt/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({ username, password })
    });

    if (!res.ok) {
      throw new Error('Login failed');
    }
    const data = await res.json();
    login(data.access_token);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const value: AuthContextType = { token, login, loginWithPassword, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
