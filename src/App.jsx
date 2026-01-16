import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import GameLayout from './pages/GameLayout';
import Results from './pages/Results';
import Questionnaire from './pages/Questionnaire';
import { GameProvider } from './context/GameContext';

import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';

function App() {
  return (
    <GameProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<ProfileSetup />} />
            <Route path="/deploy/dashboard" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assessment" element={<Questionnaire />} />
            <Route path="/play/:gameId" element={<GameLayout />} />
            <Route path="/results" element={<Results />} />
            <Route path="/teacher-login" element={<TeacherDashboard />} />
            <Route path="/parent-login" element={<ParentDashboard />} />
          </Routes>
        </div>
      </Router>
    </GameProvider>
  );
}

export default App;
