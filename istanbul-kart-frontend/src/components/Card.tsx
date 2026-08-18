import React from 'react';
import styled from 'styled-components';

interface CardProps {
  balance: number;
  subscription: number;
  subscriptionExpiryDate?: string;
  cardType: string;
  cardNumber: string;
  userName: string;
}

// Props'lardan subscription ve expiryDate'i kullanmıyoruz çünkü artık kartta değil, mavi kutuda gösteriyoruz.
const Card: React.FC<CardProps> = ({ balance, cardType, cardNumber, userName }) => {

  const formatCardNumber = (numberStr: string) => {
    if (!numberStr) return '**** **** **** ****';
    const num = numberStr.padEnd(16, '*');
    return `${num.slice(0, 4)} ${num.slice(4, 8)} ${num.slice(8, 12)} ${num.slice(12, 16)}`;
  };

  // KART ARTIK SADECE VE SADECE TL BAKİYESİNİ GÖSTERECEK
  const displayTitle = 'GÜNCEL BAKIYE';
  const displayValue = `₺${balance.toFixed(2)}`;

  return (
    <StyledWrapper $cardType={cardType}>
      <div className="flip-card">
        <div className="flip-card-inner">
          
          <div className="flip-card-front">
            <p className="heading_8264">ISTANBULKART</p>
            
            <svg 
              className="contactless" 
              width="36" 
              height="36" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ transform: 'rotate(90deg)' }}
            >
              <path d="M12 20h.01"/>
              <path d="M2 8.82a15 15 0 0 1 20 0"/>
              <path d="M5 12.859a10 10 0 0 1 14 0"/>
              <path d="M8.5 16.429a5 5 0 0 1 7 0"/>
            </svg>

            <div className="balance-info">
              <p className="balance-title">{displayTitle}</p>
              <p className="balance-value">{displayValue}</p>
            </div>

            <p className="number">{formatCardNumber(cardNumber)}</p>
            <p className="name">{userName}</p>
          </div>

          <div className="flip-card-back"></div>

        </div>
      </div>
    </StyledWrapper>
  );
}

const getColors = (type: string) => {
  switch (type) {
    case 'STUDENT': 
      return { bg: 'linear-gradient(135deg, #2563eb, #1e3a8a)' };
    case 'ELDERLY': 
      return { bg: 'linear-gradient(135deg, #7c3aed, #4c1d95)' };
    case 'NORMAL': 
    default:
      return { bg: 'linear-gradient(135deg, #dc2626, #7f1d1d)' };
  }
};

const StyledWrapper = styled.div<{ $cardType: string }>`
  .flip-card {
    background-color: transparent;
    width: 370px;  
    height: 230px; 
    perspective: 1000px;
    color: white;
    font-family: 'Arial', sans-serif;
  }

  .balance-info {
    position: absolute;
    top: 2.5em; 
    left: 1.8em;
  }

  .number {
    position: absolute;
    font-family: 'Courier New', Courier, monospace;
    font-weight: bold;
    font-size: 1.4em; 
    letter-spacing: 2px;
    bottom: 3.5em;
    left: 1.2em;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }

  .name {
    position: absolute;
    font-weight: bold;
    font-size: 0.9em;
    letter-spacing: 0.1em;
    bottom: 1.5em;
    left: 1.8em;
    text-transform: uppercase;
  }

  .heading_8264 {
    position: absolute;
    letter-spacing: .15em;
    font-size: 0.7em;
    font-weight: bold;
    top: 1.5em;
    right: 1.5em;
    opacity: 0.8;
  }

  .contactless {
    position: absolute;
    top: 4.5em;
    right: 1.8em;
    opacity: 0.85;
  }

  .balance-title {
    font-size: 0.6em;
    letter-spacing: 0.1em;
    opacity: 0.8;
    margin: 0 0 5px 0;
  }

  .balance-value {
    font-size: 1.5em;
    font-weight: bold;
    margin: 0;
    text-shadow: 0px 2px 4px rgba(0,0,0,0.3);
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform-style: preserve-3d;
  }

  .flip-card:hover .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card-front, .flip-card-back {
    box-shadow: 0 15px 35px rgba(0,0,0,0.3);
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border-radius: 16px; 
  }

  .flip-card-front {
    background: ${({ $cardType }) => getColors($cardType).bg};
  }

  .flip-card-back {
    background: ${({ $cardType }) => getColors($cardType).bg};
    transform: rotateY(180deg);
  }
`;

export default Card;