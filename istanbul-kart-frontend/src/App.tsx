import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    // Uygulamamızı Router (Harita) ile sarmalıyoruz ki yönlendirmeler çalışsın
    <Router>
      <Routes>
        {/* Proje açıldığında ilk burası çalışır */}
        <Route path="/" element={<Auth />} />
        
        {/* Sign In butonuna basıldığında buraya yönlendirilir */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;