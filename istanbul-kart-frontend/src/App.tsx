import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CardSelection from './pages/CardSelection';
import Payment from './pages/Payment';  

function App() {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/card-selection" element={<CardSelection />} />
        <Route path="/payment" element={<Payment />} />  
      </Routes>
    </Router>
  );
}

export default App;