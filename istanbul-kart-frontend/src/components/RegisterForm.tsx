import React, { useState, useEffect, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface RegisterFormProps {
  setIsLogin: (val: boolean) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ setIsLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const turnstileRef = useRef<any>(null);

  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      alert("Lütfen güvenlik doğrulamasını tamamlayın.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, turnstileToken })
      });

      if (response.ok) {
        console.log("Registration successful!");
        alert("Registration successful! Please log in to continue.");
        setIsLogin(true);
      } else {
        const errorText = await response.text();
        alert("Registration failed: " + errorText);
        
        setTurnstileToken(null);
        turnstileRef.current?.reset();
      }
    } catch {
      alert("Error: Cannot reach the backend.");
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    }
  };

  return (
    <div className="signup-wrapper">
      <form className="form" onSubmit={handleRegisterSubmit}>
        <p className="title-neon">You are...</p>
        <p className="message">Signup now and explore.</p>
        
        <label>
          <input 
            type="text" 
            placeholder=" " 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
          <span>Username</span>
        </label>

        <label>
          <input 
            type="email" 
            placeholder=" " 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <span>Email</span>
        </label>
        
        <label>
          <input 
            type="password" 
            placeholder=" " 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <span>Password</span>
        </label>

        {/* CLOUDFLARE TURNSTILE */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
          <Turnstile
            ref={turnstileRef}
            siteKey="0x4AAAAAAEXUO4Wjd3vM27p_"
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
          />
        </div>

        <button 
          type="submit" 
          className="submit-neon"
          disabled={!turnstileToken}
          style={{ 
            opacity: turnstileToken ? 1 : 0.5, 
            cursor: turnstileToken ? 'pointer' : 'not-allowed' 
          }}
        >
          Submit
        </button>
        <p className="signin-text">Already have an account? <span className="span-link" onClick={() => setIsLogin(true)}>Signin</span></p>
      </form>
    </div>
  );
};

export default RegisterForm;