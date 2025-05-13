// src/App.jsx - Simplified to fix rendering issues
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Protected Route component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Homepage and category routes - simplified */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:category"
            element={
              <ProtectedRoute>
                <HomePage onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;