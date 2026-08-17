import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  setIsLogin: (val: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ setIsLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        // 1. Yanıtı metin olarak alıyoruz (Artık herkes görebilir)
        const resultText = await response.text(); 
        let tokenToSave = resultText; // Varsayılan olarak direkt metni token sayalım

        // 2. Acaba JSON formatında mı gelmiş diye kontrol edelim
        try {
          const data = JSON.parse(resultText);
          if (data.token) tokenToSave = data.token;
          else if (data.accessToken) tokenToSave = data.accessToken;
          else if (data.jwt) tokenToSave = data.jwt;
        } catch {
          // JSON değilmiş, sorun yok, düz metni kullanmaya devam edeceğiz.
        }

        // 3. Token'ı güvenle kaydediyoruz
        localStorage.setItem('token', tokenToSave);

        // 4. KESİN YÖNLENDİRME: Kullanıcıyı kart seçimine yolluyoruz
        navigate('/dashboard'); 
        
      } else {
        const errorText = await response.text();
        alert("Login failed: " + errorText);
      }
    } catch (error) {
      console.error("Login API error:", error);
      alert("Error: Cannot reach the backend.");
    }
  };

  return (
    <div className="signin-wrapper">
      <form className="form" onSubmit={handleLoginSubmit}>
        <p className="title-dark">Start Travelling!</p>
        
        <div className="flex-column"><label>Username</label></div>
        <div className="inputForm">
          <input 
            type="text" 
            placeholder="Enter your Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
        </div>
        
        <div className="flex-column"><label>Password</label></div>
        <div className="inputForm">
          <input 
            type="password" 
            placeholder="Enter your Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        <div className="flex-row">
          <div><input type="checkbox" id="remember" /><label htmlFor="remember"> Remember me</label></div>
          <span className="span-link">Forgot password?</span>
        </div>

        <button type="submit" className="button-submit">Sign In</button>
        <p className="p-text">Don't have an account? <span className="span-link" onClick={() => setIsLogin(false)}>Sign Up</span></p>
      </form>
    </div>
  );
};

export default LoginForm;