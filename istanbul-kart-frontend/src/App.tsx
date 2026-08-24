import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';  
import Wallet from './pages/Wallet';
import History from './pages/History';

function App() {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<Payment />} />  
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;