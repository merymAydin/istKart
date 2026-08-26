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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      alert("Please complete the Turnstile verification.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          turnstileToken // Eğer backend token'ı bekliyorsa buraya eklenir
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Token ve kullanıcı bilgilerini kaydedelim
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);

        // Kullanıcının rolünü kontrol edelim
        const userRole = data.role || data.roles; 

        if (userRole === "ADMIN" || userRole?.includes("ADMIN")) {
          navigate("/admin-kyc");
        } else {
          navigate("/wallet"); 
        }
      } else {
        const errText = await response.text();
        alert("Login failed: " + (errText || "Invalid credentials"));
      }
    } catch (err) {
      console.error("An error occurred during login:", err);
      alert("Network error or server is down.");
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