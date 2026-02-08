import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Memory from './components/Memory';
import Zahlenspiel from './components/Zahlenspiel';
import FarbenQuiz from './components/FarbenQuiz';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/memory" element={<Memory />} />
      <Route path="/zahlenspiel" element={<Zahlenspiel />} />
      <Route path="/farbenquiz" element={<FarbenQuiz />} />
    </Routes>
  );
}
