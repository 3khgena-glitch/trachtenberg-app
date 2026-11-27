import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import Theory from './pages/Theory';
import Trainer from './Trainer';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Trainer />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/theory" element={<Theory />} />
      </Routes>
    </Router>
  );
}
