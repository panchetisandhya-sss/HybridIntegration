import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VoterInterface from './pages/VoterInterface';
import ServerDesktop from './pages/ServerDesktop';
import HomePage from './pages/HomePage';
import VoterAccount from './pages/VoterAccount';
import History from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vote" element={<VoterInterface />} />
        <Route path="/account" element={<VoterAccount />} />
        <Route path="/history" element={<History />} />
        <Route path="/admin" element={<ServerDesktop />} />
        <Route path="/server" element={<ServerDesktop />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
