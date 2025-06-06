// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        throw new Error('Registration failed');
      }
      // On success, inform the user and redirect to login
      setSuccess('Registration successful! You can now log in.');
      // Optionally, automatically navigate to login after a short delay:
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError('Could not register. The username might be taken.');
    }
  };

  return (
    <div className="register-page">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label><br/>
          <input 
            type="text" 
            value={username}
            onChange={e => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password:</label><br/>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>
        {error && <p style={{color:'red'}}>{error}</p>}
        {success && <p style={{color:'green'}}>{success}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default RegisterPage;
