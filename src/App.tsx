import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Trainer from './Trainer';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Theory from './pages/Theory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Trainer />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/theory" element={<Theory />} />
      </Routes>
    </Router>
  );
}

export default App;