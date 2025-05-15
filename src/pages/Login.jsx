// src/pages/Login.jsx
import './Login.css';
import { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const CORRECT_PASSWORD = 'D14m0nd!';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (password === CORRECT_PASSWORD) {
        await signInAnonymously(auth);
        navigate('/', { replace: true });
      } else {
        setError('Incorrect password');
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <header className="login-header">
        <h1>David & Co</h1>
        <p>Private Collection</p>
      </header>

      {error && <div className="login-error">{error}</div>}

      <form onSubmit={handleLogin} className="login-form">
        <label htmlFor="password" className="visually-hidden">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="password-input"
          autoFocus
          required
        />

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Signing In…' : 'Enter Collection'}
        </button>
      </form>

      <footer className="login-footer">
        <button
          type="button"
          className="request-access"
          onClick={() => window.location.href = 'mailto:HELLO@DAVIDANDCO.COM?subject=Access Request'}
        >
          Request Access
        </button>
      </footer>
    </div>
  );
}