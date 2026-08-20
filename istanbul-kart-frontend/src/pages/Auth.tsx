import React, { useState, useEffect, useRef } from 'react';
import './Auth.css';

import yellowCard from '../assets/yellow.webp';
import redCard from '../assets/redcard.webp';
import greenCard from '../assets/greencard.webp';
import plusCard from '../assets/plus.png';
import blueCard from '../assets/blue.webp';
import cityCard from '../assets/tourist.webp';

import LoginForm from '../components/LoginForm'; 
import RegisterForm from '../components/RegisterForm';
import CardsGrid from '../components/CardsGrid';

import CardDetailModal from '../components/CardDetailModal';
import type { CardData } from '../components/CardDetailModal';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const progress = Math.min(Math.max(scrolled / 350, 0), 1); // Kaydırma mesafesi hassasiyeti

      cardRefs.current.forEach((card, i) => {
        if (!card || !slotRefs.current[i]) return;

        const startRect = card.getBoundingClientRect();
        const slotRect = slotRefs.current[i]!.getBoundingClientRect();

        const deltaX = slotRect.left - startRect.left;
        const deltaY = slotRect.top - startRect.top;

        // Kartlar kaydırma bittiğinde şeridin yanına gölge efektiyle (shade) oturur
        card.style.transform = `translate(${deltaX * progress}px, ${deltaY * progress}px)`;
        card.style.opacity = `${Math.max(1 - (progress * 0.05), 0.95)}`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="auth-wrapper">
      
      {/* 1. Üst Kısım: Form ve Akacak Kartlar */}
      <section className="hero-section">
        <div className="left-presentation">
          <div className="presentation-content">
            <h1 className="glow-text">Istanbulkart <br/>Digital Hub</h1>
            <p className="glow-subtext">Manage your passes, check your balance, and explore the city effortlessly.</p>
            
            <div className="flying-cards-source">
              {[yellowCard, greenCard, blueCard, redCard, plusCard, cityCard].map((img, i) => (
                <div 
                  key={i} 
                  ref={el => { cardRefs.current[i] = el; }} 
                  className={`fly-card-item card-pos-${i}`}
                >
                  <img src={img} alt="Istanbulkart" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="right-login">
          <div className="form-container">
            {isLogin ? <LoginForm setIsLogin={setIsLogin} /> : <RegisterForm setIsLogin={setIsLogin} />}
          </div>
        </div>
      </section>

      {/* 2. Alt Kısım: Boşluksuz Grid Alanı */}
      <div className="grid-section-wrapper" ref={gridRef}>
        <CardsGrid onCardClick={setSelectedCard} slotRefs={slotRefs} />
      </div>

      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

    </div>
  );
};

export default Auth;