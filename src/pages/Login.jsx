// src/pages/Login.jsx - Clean Modern Design
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

  // Redirect if already logged in
  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  // The correct password for authentication
  const CORRECT_PASSWORD = 'D14m0nd!';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check password
      if (password === CORRECT_PASSWORD) {
        // Use anonymous sign-in
        await signInAnonymously(auth);
        navigate('/', { replace: true });
      } else {
        setError('Incorrect password');
        setLoading(false);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>David & Co</h1>
          <p>Private Collection</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="password-input"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Signing In...' : 'Enter Collection'}
          </button>

          <div className="login-footer">
            <button
              type="button"
              onClick={() => window.location.href = 'mailto:HELLO@DAVID&CO.COM?subject=Access Request'}
              className="request-access"
            >
              Request Access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}