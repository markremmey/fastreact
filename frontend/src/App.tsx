// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import ProfilePage from './Pages/ProfilePage';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <Routes>
      {/* Redirect root to either Profile (if logged in) or Login */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/profile" replace /> : <Navigate to="/login" replace />
      }/>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Protected routes */}
      <Route path="/profile" element={
        isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />
      }/>
    </Routes>
  );
}
export default App;
