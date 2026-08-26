import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Yönlendirme için ekledik

export interface Perk {
  name: string;
  icon: string;
}

export interface CardData {
  id: string;
  title: string;
  themeColor: string;
  lightBg: string;
  features: string[];
  img: string;
  description?: string;
  requirements?: string[];
  fee?: string;
  perks?: Perk[];
}

interface Props {
  card: CardData;
  onClose: () => void;
  onApply: () => void;
}

const CardDetailModal: React.FC<Props> = ({ card, onClose, onApply }) => {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate(); // 2. Hook'u tanımladık

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, [card]);

  // 3. Butona tıklandığında çalışacak akıllı kontrol fonksiyonu
const handleApplyClick = () => {
    // Kart başlığını küçük harfe çevirip kontrol ediyoruz
    const titleLower = card.title.toLowerCase();

    // Eğer kartın adı "city card" içermiyorsa (yani indirimli, öğrenci, mavi kart vb. ise)
    if (!titleLower.includes("city card")) {
      onClose(); // Önce modal'ı kapat
      navigate('/kyc'); // KYC formuna yönlendir
    } else {
      // Sadece Istanbul City Card ise cüzdana ekle
      onApply();
    }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`cd-content-wrapper ${mounted ? 'docked' : ''}`} 
        style={{ backgroundColor: card.lightBg }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="cd-close-btn" onClick={onClose}>×</button>

        <div className="cd-image-container">
          <img src={card.img} alt={card.title} className="cd-floating-card" />
        </div>

        <div className="cd-info-container">
          <h2 style={{ color: card.themeColor }}>{card.title}</h2>
          <p className="cd-desc">{card.description}</p>
          
          <div className="cd-details-grid">
            <div className="cd-detail-item">
              <span className="cd-label">Requirements</span>
              <ul>
                {card.requirements?.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
            <div className="cd-detail-item">
              <span className="cd-label">Card Fee</span>
              <p className="cd-fee-text" style={{ color: card.themeColor }}>{card.fee}</p>
            </div>
          </div>

          {card.perks && (
            <div className="cd-perks-section">
              <span className="cd-label">Included Perks & Areas</span>
              <div className="perks-grid">
                {card.perks.map((perk, idx) => (
                  <div key={idx} className="perk-item">
                    <img src={perk.icon} alt={perk.name} className="perk-icon" />
                    <span>{perk.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="cd-action-footer">
            <button 
              className="cd-apply-btn" 
              style={{ backgroundColor: card.themeColor }}
              onClick={handleApplyClick} // 4. Güncellenmiş akıllı fonksiyonu bağladık
            >
              Apply for a Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;