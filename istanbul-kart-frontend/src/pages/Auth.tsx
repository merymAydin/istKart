import React, { useState, useEffect, useRef } from 'react';
import './Auth.css';

import redCard from '../assets/redcard.webp';
import plusCard from '../assets/plus.png';
import greenCard from '../assets/greencard.webp';
import blueCard from '../assets/blue.webp';
import yellowCard from '../assets/yellow.webp';
import cityCard from '../assets/tourist.webp';

import LoginForm from '../components/LoginForm'; 
import RegisterForm from '../components/RegisterForm';
import CardsGrid from '../components/CardsGrid';
import CardDetailModal from '../components/CardDetailModal';
import type { CardData } from '../components/CardDetailModal';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [warningMsg, setWarningMsg] = useState<string>(''); // Uyarı mesajı state'i
  
  const anchorRefs = useRef<(HTMLDivElement | null)[]>([]); 
  const movingCardRefs = useRef<(HTMLImageElement | null)[]>([]); 
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]); 
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]); 

  const heroCards = [redCard, plusCard, greenCard, blueCard, yellowCard, cityCard];

  useEffect(() => {
    const distances: { x: number, y: number }[] = [];
    setTimeout(() => {
      heroCards.forEach((_, i) => {
        const anchor = anchorRefs.current[i];
        const slot = slotRefs.current[i];
        if (anchor && slot) {
          const anchorRect = anchor.getBoundingClientRect();
          const slotRect = slot.getBoundingClientRect();
          distances[i] = { x: slotRect.left - anchorRect.left, y: slotRect.top - anchorRect.top };
        }
      });
    }, 150);

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const progress = Math.min(Math.max(scrolled / 400, 0), 1);

      heroCards.forEach((_, i) => {
        const movingCard = movingCardRefs.current[i];
        const box = boxRefs.current[i];
        const dist = distances[i];

        if (!movingCard || !box || !dist) return;

        movingCard.style.transform = `translate(${dist.x * progress}px, ${dist.y * progress}px) scale(${1 - (progress * 0.3333)})`;

        if (progress >= 0.95) {
           movingCard.style.opacity = '0'; 
           box.classList.add('docked');    
        } else {
           movingCard.style.opacity = '1'; 
           box.classList.remove('docked'); 
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // YENİ: Başvur butonuna tıklanınca çalışacak fonksiyon
  const handleApplyClick = () => {
    setSelectedCard(null); // Modalı kapat
    setIsLogin(true); // Giriş formunu aktif et
    setWarningMsg("You need to login first!"); // Uyarı mesajını ayarla
    
    // Sayfanın en üstüne (forma) kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 4 saniye sonra uyarı mesajını sil
    setTimeout(() => {
      setWarningMsg('');
    }, 4000);
  };

  return (
    <div className="auth-wrapper">
      <section className="hero-section">
        <div className="left-presentation">
          <div className="presentation-content">
            <h1 className="glow-text">Istanbulkart <br/>Digital Hub</h1>
            <p className="glow-subtext">Manage your passes, check your balance, and explore the city effortlessly.</p>
            <div className="flying-cards-source">
              {heroCards.map((img, i) => (
                <div key={i} ref={el => { anchorRefs.current[i] = el; }} className={`fly-card-anchor card-pos-${i}`}>
                  <img ref={el => { movingCardRefs.current[i] = el; }} src={img} className="moving-card" alt="card" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="right-login">
          <div className="form-container" style={{ position: 'relative' }}>
            
            {/* YENİ: Uyarı Mesajı Baloncuğu */}
            {warningMsg && (
              <div className="warning-toast">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {warningMsg}
              </div>
            )}

            {isLogin ? <LoginForm setIsLogin={setIsLogin} /> : <RegisterForm setIsLogin={setIsLogin} />}
          </div>
        </div>
      </section>

      <div className="grid-section-wrapper">
        <CardsGrid onCardClick={setSelectedCard} slotRefs={slotRefs} boxRefs={boxRefs} />
      </div>

      {/* YENİ: Modal bileşenine yönlendirme fonksiyonunu gönderiyoruz */}
      {selectedCard && (
        <CardDetailModal 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
          onApply={handleApplyClick} 
        />
      )}
      
    </div>
  );
};

export default Auth;