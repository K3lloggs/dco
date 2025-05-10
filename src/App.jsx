// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <HomePage onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          }
        />
        {/* Category routes */}
        <Route 
          path="/new" 
          element={user ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/bracelet" 
          element={user ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/brooch" 
          element={user ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/earring" 
          element={user ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/necklace" 
          element={user ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/pendant" 
          element={user ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/pin" 
          element={user ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/ring" 
          element={user ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/watches" 
          element={user ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/objets-d-art" 
          element={user ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
        />
        
        {/* Redirect any unknown route to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;