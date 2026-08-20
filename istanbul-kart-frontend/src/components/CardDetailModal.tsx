import React from 'react';

// 'type' kelimesini kullanarak tanımladık, TS hatası vermez.
export interface CardData {
  id: string;
  title: string;
  themeColor: string;
  lightBg: string;
  features: string[];
  img: string;
  // Aşağıdakiler opsiyoneldir, yani olsa da olur olmasa da
  description?: string;
  requirements?: string[];
  fee?: string;
  subtitle?: string; 
  desc?: string;
}

interface CardDetailModalProps {
  card: CardData;
  onClose: () => void;
}

const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose }) => {
  return (
    <div className="detail-page-overlay">
      <div className="detail-page-content">
        
        <button className="close-detail-btn" onClick={onClose}>
          ✕ Close
        </button>

        <div className="dp-top-half" style={{ backgroundColor: card.themeColor }}>
          <div className="dp-text-area">
            <h1>{card.title}</h1>
            <h3>{card.subtitle}</h3>
            <p>{card.desc}</p>
          </div>
          <div className="dp-image-area">
            <img src={card.img} alt={card.title} />
          </div>
        </div>

        <div className="dp-bottom-half">
          <div className="dp-main-content">
            <h2>How can I get it?</h2>
            <p>You can apply online via <a href="https://bireysel.istanbulkart.istanbul" target="_blank" rel="noreferrer">https://bireysel.istanbulkart.istanbul</a>. To avoid issues during your KYC (account verification) process, please prepare the following:</p>
            <ul>
              {card.requirements?.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
            <p className="note">For online applications, original ID presentation may be required by the courier upon delivery.</p>

            <h3>Card Fee</h3>
            <p>To learn about current card fees, please visit our "Fees and Limits" page. Payments can be made online during your application or at the application centers.</p>
          </div>

          <div className="dp-side-content">
            <div className="info-box">
              <h4>❓ What to do in case of loss or theft?</h4>
              <p>To secure your balance, you must immediately close your personalized Istanbulkart by contacting ALO 153 or using the Istanbulkart Mobile application.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CardDetailModal;