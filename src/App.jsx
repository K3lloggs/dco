// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import { NavbarProvider } from './context/NavbarContext';
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
      <NavbarProvider>
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
          {/* Routes for each jewelry category */}
          <Route path="/bracelet" element={<HomePage onLogout={handleLogout} />} />
          <Route path="/brooch" element={<HomePage onLogout={handleLogout} />} />
          <Route path="/earring" element={<HomePage onLogout={handleLogout} />} />
          <Route path="/necklace" element={<HomePage onLogout={handleLogout} />} />
          <Route path="/pendant" element={<HomePage onLogout={handleLogout} />} />
          <Route path="/pin" element={<HomePage onLogout={handleLogout} />} />
          <Route path="/ring" element={<HomePage onLogout={handleLogout} />} />
          <Route path="/watches" element={<HomePage onLogout={handleLogout} />} />
          <Route path="/objets-d-art" element={<HomePage onLogout={handleLogout} />} />
          <Route path="/new" element={<HomePage onLogout={handleLogout} />} />
        </Routes>
      </NavbarProvider>
    </Router>
  );
}

export default App;