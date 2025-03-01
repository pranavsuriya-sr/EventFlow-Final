import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';

function App() {
  const { session } = useAuth();

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/events"
              element={session ? <EventsPage /> : <Navigate to="/auth" />}
            />
            <Route
              path="/events/:id"
              element={session ? <EventDetailPage /> : <Navigate to="/auth" />}
            />
            <Route
              path="/analytics"
              element={session ? <AnalyticsPage /> : <Navigate to="/auth" />}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App