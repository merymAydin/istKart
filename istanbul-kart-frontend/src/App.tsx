import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Payment from './pages/Payment';  
import Wallet from './pages/Wallet';
import History from './pages/History';

import AdminKycPanel from './pages/AdminKycPanel'; // Admin Paneli
import KycPage from './pages/KycPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<Payment />} />  
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/history" element={<History />} />
        <Route path="/kyc" element={<KycPage />} />
        <Route path="/admin-kyc" element={<AdminKycPanel />} />
      </Routes>
    </Router>
  );
}

export default App;