import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CardSelection from './pages/CardSelection';
import Payment from './pages/Payment'; // Dosya yolunu kendi klasörüne göre düzelt

function App() {
  return (
    // Uygulamamızı Router (Harita) ile sarmalıyoruz ki yönlendirmeler çalışsın
    <Router>
      <Routes>
        {/* Proje açıldığında ilk burası çalışır */}
        <Route path="/" element={<Auth />} />
        
        {/* Sign In butonuna basıldığında buraya yönlendirilir */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/card-selection" element={<CardSelection />} />
        <Route path="/payment" element={<Payment />} /> {/* Payment sayfası için route */}
      </Routes>
    </Router>
  );
}

export default App;