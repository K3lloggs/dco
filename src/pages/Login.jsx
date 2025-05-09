// src/pages/Login.jsx
import { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login({ onAuthenticated }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // The correct password hardcoded for prototyping
  const CORRECT_PASSWORD = 'D14m0nd!';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // First verify the password
    if (password === CORRECT_PASSWORD) {
      try {
        // Use anonymous sign-in to track auth state in Firebase
        await signInAnonymously(auth);
        onAuthenticated();
      } catch (error) {
        console.error('Firebase auth error:', error);
        setError('Authentication error. Please try again.');
        setLoading(false);
      }
    } else {
      setError('Invalid password');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">DCO</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Enter password to access</p>
        </div>
        
        {error && (
          <div className="mb-4 text-xs sm:text-sm text-red-600">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="bg-white p-5 sm:p-8 rounded-lg shadow-sm">
          <div className="mb-5 sm:mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-3 py-2 text-sm sm:text-base border-b border-gray-300 focus:border-gray-800 focus:outline-none"
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 text-white py-2 text-sm sm:text-base hover:bg-gray-900 focus:outline-none transition-colors"
          >
            {loading ? 'Checking...' : 'Access Site'}
          </button>
          
          <div className="mt-5 sm:mt-6 text-center">
            <button 
              type="button"
              onClick={() => window.location.href = 'mailto:contact@example.com?subject=Access Request'}
              className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm focus:outline-none"
            >
              Request access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}