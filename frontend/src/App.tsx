// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import ProfilePage from './Pages/ProfilePage';
import AuthCallbackPage from './Pages/AuthCallbackPage';

function App() {
  const { token } = useAuth();
  return (
    <Routes>
      {/* Redirect root to either Library (if logged in or in demo) or Login */}
      <Route path="/" element={
        (token) ? <Navigate to="/profile" replace /> : <Navigate to="/login" replace />
      }/>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      {/* Protected routes */}
      <Route path="/profile" element={
        (token) ? <ProfilePage /> : <Navigate to="/login" replace />
      }/>
    </Routes>
  );
}
export default App;
