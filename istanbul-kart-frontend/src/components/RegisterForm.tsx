import React, { useState, useEffect } from 'react';

// useNavigate'i kaldırdık çünkü artık kayıttan sonra Dashboard'a değil, Login'e geçeceğiz.
interface RegisterFormProps {
  setIsLogin: (val: boolean) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ setIsLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sayfa yüklendiği an eski token'ı acımadan siliyoruz!
  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

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
        // --- HATANIN ÇÖZÜLDÜĞÜ YER ---
        // Artık backend'den dönen o "Kayıt başarılı" metnini token olarak KAYDETMİYORUZ!
        // Sadece kullanıcıya bilgi verip, Login formuna geçmesini sağlıyoruz.
        console.log("Registration successful!");
        alert("Registration successful! Please log in to continue.");
        
        // Kullanıcıyı direkt Login (Sign In) ekranına kaydırıyoruz.
        setIsLogin(true);
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