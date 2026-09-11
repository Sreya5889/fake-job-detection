import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalyzeJob from './pages/AnalyzeJob';
import Result from './pages/Result';
import History from './pages/History';
import Profile from './pages/Profile';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <div className="app-layout">
            <Navbar />
            <main>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes (Login required) */}
                <Route
                  path="/analyze"
                  element={
                    <ProtectedRoute>
                      <AnalyzeJob />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/result"
                  element={
                    <ProtectedRoute>
                      <Result />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
