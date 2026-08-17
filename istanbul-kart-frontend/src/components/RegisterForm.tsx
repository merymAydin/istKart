import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegisterFormProps {
  setIsLogin: (val: boolean) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ setIsLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Artık güvenle kullanabiliriz

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      if (response.ok) {
        const resultText = await response.text();
        let tokenToSave = resultText;

        try {
          const data = JSON.parse(resultText);
          if (data.token) tokenToSave = data.token;
          else if (data.accessToken) tokenToSave = data.accessToken;
        } catch {
          // Düz metin token
        }

        if (tokenToSave) {
          localStorage.setItem('token', tokenToSave);
        }

        console.log("Registration successful!");
        alert("Registration successful! Welcome.");
        
        // KESİN YÖNLENDİRME: Dashboard'a atıyoruz!
        navigate('/dashboard');
      } else {
        const errorText = await response.text();
        alert("Registration failed: " + errorText);
      }
    } catch {
      alert("Error: Cannot reach the backend.");
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

        <button type="submit" className="submit-neon">Submit</button>
        <p className="signin-text">Already have an account? <span className="span-link" onClick={() => setIsLogin(true)}>Signin</span></p>
      </form>
    </div>
  );
};

export default RegisterForm;