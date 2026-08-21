import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';

interface LoginFormProps {
  setIsLogin: (val: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ setIsLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
  }, []);
  // ---------------------------

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      alert("Lütfen güvenlik doğrulamasını tamamlayın.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, turnstileToken })
      });

      if (response.ok) {
        const resultText = await response.text(); 
        let tokenToSave = resultText; 

        try {
          const data = JSON.parse(resultText);
          if (data.token) tokenToSave = data.token;
          else if (data.accessToken) tokenToSave = data.accessToken;
          else if (data.jwt) tokenToSave = data.jwt;
        } catch {
          // Eğer JSON parse edilemezse, tokenToSave zaten resultText olarak kalır
        }

        // Token'ı güvenle kaydediyoruz
        localStorage.setItem('token', tokenToSave);
        
        // Cüzdan tarafında dinamik isim göstermek için kullanıcı adını da kaydediyoruz
        localStorage.setItem('userName', username);

        // KESİN YÖNLENDİRME: Kullanıcıyı kart seçimine yolluyoruz
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

        {/* CLOUDFLARE TURNSTILE */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
          <Turnstile
            siteKey="0x4AAAAAAEXUO4Wjd3vM27p_"
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
          />
        </div>

        <button 
          type="submit" 
          className="button-submit"
          disabled={!turnstileToken}
          style={{ 
            opacity: turnstileToken ? 1 : 0.5, 
            cursor: turnstileToken ? 'pointer' : 'not-allowed' 
          }}
        >
          Sign In
        </button>
        <p className="p-text">Don't have an account? <span className="span-link" onClick={() => setIsLogin(false)}>Sign Up</span></p>
      </form>
    </div>
  );
};

export default LoginForm;