import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

import yellowCard from '../assets/yellow.webp';
import redCard from '../assets/redcard.webp';
import greenCard from '../assets/greencard.webp';

// Yeni oluşturduğumuz bileşenleri içe aktarıyoruz
import LoginForm from '../components/LoginForm'; 
import RegisterForm from '../components/RegisterForm';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const sceneRef = useRef<HTMLDivElement>(null);
  const c1Ref = useRef<HTMLImageElement>(null);
  const c2Ref = useRef<HTMLImageElement>(null);
  const c3Ref = useRef<HTMLImageElement>(null);
  
  const title1Ref = useRef<HTMLDivElement>(null);
  const title2Ref = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (!sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const scrollableHeight = sceneRef.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

      const positions = [
        [
          { x: -30, y: 20, r: -12, scale: 1 },
          { x: -180, y: -20, r: -25, scale: 1.05 },
          { x: -280, y: 0, r: -35, scale: 0.9 }
        ],
        [
          { x: 0, y: 0, r: 0, scale: 1 },
          { x: 0, y: -50, r: 0, scale: 1.15 },
          { x: 0, y: 10, r: 0, scale: 1 }
        ],
        [
          { x: 30, y: 15, r: 10, scale: 1 },
          { x: 180, y: -20, r: 25, scale: 1.05 },
          { x: 280, y: 0, r: 35, scale: 0.9 }
        ]
      ];

      const currentStage = progress * 2;
      const stageIndex = Math.floor(currentStage);
      const t = currentStage - stageIndex;

      const getInterpolated = (
        p1: { x: number; y: number; r: number; scale: number }, 
        p2: { x: number; y: number; r: number; scale: number }, 
        factor: number
      ) => ({
        x: p1.x + (p2.x - p1.x) * factor,
        y: p1.y + (p2.y - p1.y) * factor,
        r: p1.r + (p2.r - p1.r) * factor,
        scale: p1.scale + (p2.scale - p1.scale) * factor,
      });

      const idx1 = Math.min(stageIndex, 1);
      const idx2 = Math.min(idx1 + 1, 2);

      const pos1 = getInterpolated(positions[0][idx1], positions[0][idx2], t);
      const pos2 = getInterpolated(positions[1][idx1], positions[1][idx2], t);
      const pos3 = getInterpolated(positions[2][idx1], positions[2][idx2], t);

      if (c1Ref.current) c1Ref.current.style.transform = `translate(${pos1.x}px, ${pos1.y}px) rotate(${pos1.r}deg) scale(${pos1.scale})`;
      if (c2Ref.current) c2Ref.current.style.transform = `translate(${pos2.x}px, ${pos2.y}px) rotate(${pos2.r}deg) scale(${pos2.scale})`;
      if (c3Ref.current) c3Ref.current.style.transform = `translate(${pos3.x}px, ${pos3.y}px) rotate(${pos3.r}deg) scale(${pos3.scale})`;

      if (title1Ref.current && title2Ref.current && formRef.current) {
        title1Ref.current.style.opacity = progress < 0.35 ? `${1 - progress * 3}` : '0';
        title2Ref.current.style.opacity = progress >= 0.25 && progress <= 0.75 ? '1' : '0';
        formRef.current.style.opacity = progress > 0.65 ? `${(progress - 0.65) * 3}` : '0';
        formRef.current.style.pointerEvents = progress > 0.7 ? 'auto' : 'none';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePasswordSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in first!");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/cards/spend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardNumber: "123456789", 
          terminalId: 1
        })
      });

      const result = await response.text();
      if (response.ok) {
        setShowModal(false);
        navigate('/dashboard');
      } else {
        alert("Transaction failed: " + result);
      }
    } catch (error) {
      console.error("Detaylı Hata:", error);
      alert("Cannot reach the backend!");
    }
  };

  return (
    <div className="scene-container" ref={sceneRef}>
      <div className="bg-glow pink-glow"></div>
      <div className="bg-glow purple-glow"></div>

      {showModal && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <h3>İstanbulkart</h3>
            <p>Enter your 4-digit PIN to pass</p>
            <input type="password" maxLength={4} autoFocus placeholder="****" />
            <div className="modal-buttons">
              <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', color: '#94a3b8' }}>Cancel</button>
              <button type="button" onClick={handlePasswordSubmit} className="submit-btn" style={{ margin: 0 }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky-frame">
        <div ref={title1Ref} className="section-title">
          <h1 className="welcome-title">Welcome to IstanbulCard!</h1>
          <p>The smartest way to explore the city. Scroll down to discover.</p>
        </div>

        <div ref={title2Ref} className="section-title" style={{ opacity: 0 }}>
          <h1>Choose the Best You</h1>
          <p>Tailored card options matching you.</p>
        </div>

        <div className="cards-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img ref={c1Ref} src={yellowCard} alt="Yellow Card" className="card-item" />
          <img ref={c3Ref} src={greenCard} alt="Green Card" className="card-item" />
          <img ref={c2Ref} src={redCard} alt="Red Card" className="card-item" onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }} />
        </div>

        <div ref={formRef} className="form-page-overlay" style={{ opacity: 0, pointerEvents: 'none' }}>
          {isLogin ? (
            <LoginForm setIsLogin={setIsLogin} />
          ) : (
            <RegisterForm setIsLogin={setIsLogin} />
          )}
        </div>

      </div>
    </div>
  );
};

export default Auth;