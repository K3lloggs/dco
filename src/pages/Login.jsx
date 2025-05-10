// src/pages/Login.jsx
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User will be redirected by the router in App.jsx
    } catch (error) {
      setError('Invalid email or password');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="login-container">
        {/* Contact info bar */}
        <div className="text-center info-bar mb-8 hidden md:block">
          <div className="flex justify-center items-center space-x-6">
            <a href="tel:213-632-9061">213-632-9061</a>
            <span>|</span>
            <a href="mailto:HELLO@DAVID&CO.COM">HELLO@DAVID&CO.COM</a>
            <span>|</span>
            <a href="https://wa.me/12136329061">WHATSAPP</a>
          </div>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="brand-logo mb-2">David & Co</h1>
          <p className="login-subtitle">Sign in to manage your inventory</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password">Password</label>
              <a href="#" className="forgot-link">Forgot?</a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-submit">
            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="login-footer">
          <p>Need help? <a href="#" className="help-link">Contact support</a></p>
        </div>
      </div>
    </div>
  );
}