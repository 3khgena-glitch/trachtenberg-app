import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Stats from './pages/Stats'; // 1. Додали імпорт нової сторінки
import Trainer from './Trainer';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Trainer />} />
        <Route path="/settings" element={<Settings />} />
        {/* 2. Додали сам маршрут */}
        <Route path="/stats" element={<Stats />} /> 
      </Routes>
    </Router>
  );
}