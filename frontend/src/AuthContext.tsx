// frontend/src/AuthContext.tsx
import { createContext, useState, useEffect, useContext} from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  email: string;
  id: string;
}

// Define the shape of our auth context state and functions
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context with default dummy values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  loginWithPassword: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUser = async () => {
      // The browser automatically sends the auth cookie with this request.
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkUser();
  }, []);

  const loginWithPassword = async (username: string, password: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/jwt/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({ username, password }),
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Login failed');
    }
    
    // After login, the cookie is set. We can now fetch the user profile.
    const userRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
        credentials: 'include',
    });
    if (userRes.ok) {
      const userData = await userRes.json();
      setUser(userData);
      setIsAuthenticated(true);
      navigate('/profile');
    } else {
      throw new Error('Failed to fetch profile after login');
    }
  };

  const logout = async () => {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/jwt/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value: AuthContextType = { isAuthenticated, user, isLoading, loginWithPassword, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
