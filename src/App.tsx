import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import './App.css';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Performance = React.lazy(() => import('./pages/Performance'));
const Competitions = React.lazy(() => import('./pages/Competitions'));
const Training = React.lazy(() => import('./pages/Training'));
const SwimmingClubs = React.lazy(() => import('./pages/SwimmingClubs'));

function App() {
  return (
    <Router>
      <AppLayout>
        <React.Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:swimmerId" element={<Profile />}>
              <Route path="" element={<Navigate to="performance" replace />} />
              <Route path="performance" element={<Performance />} />
              <Route path="competitions" element={<Competitions />} />
              <Route path="training" element={<Training />} />
            </Route>
            <Route path="/clubs" element={<SwimmingClubs />} />
          </Routes>
        </React.Suspense>
      </AppLayout>
    </Router>
  );
}

export default App;
