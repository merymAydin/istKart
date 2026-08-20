import React from 'react';
import styled from 'styled-components';

// Yeni kart görsellerini import ediyoruz (Kendi yollarına göre ayarlayabilirsin)
import plusCardImg from '../assets/plus.png';
import facilityCardImg from '../assets/blue.webp';
import cityCardImg from '../assets/tourist.webp';

export interface CardProps {
  balance: number;
  subscription: number;
  subscriptionExpiryDate?: string;
  cardType: string;
  cardNumber: string;
  userName: string;
}

const Card: React.FC<CardProps> = ({
  balance,
  cardType,
  cardNumber,
  userName,
}) => {
  const getCardImage = () => {
    switch (cardType?.toUpperCase()) {
      case 'PLUS':
      case 'ISTANBUL_PLUS':
      case 'NORMAL':
        return plusCardImg;
      case 'FACILITY':
      case 'BLUE':
      case 'PUBLIC_FACILITY':
        return facilityCardImg;
      case 'CITY':
      case 'TOURIST':
      case 'ISTANBUL_CITY_CARD':
        return cityCardImg;
      default:
        return plusCardImg; 
    }
  };

  return (
    <CardContainer>
      <img src={getCardImage()} alt="Istanbulkart Design" className="card-bg-img" />
      <div className="card-content">
        <div className="card-header">
          <span>İSTANBULKART</span>
          <span className="card-type-badge">{cardType || 'PLUS'}</span>
        </div>
        <div className="card-middle">
          <p className="balance-label">GÜNCEL BAKİYE</p>
          <h2 className="balance-amount">₺{balance.toFixed(2)}</h2>
        </div>
        <div className="card-footer">
          <div className="card-number">
            {cardNumber ? cardNumber.match(/.{1,4}/g)?.join(' ') : '•••• •••• •••• ••••'}
          </div>
          {/* Sadece senin ismini dinamik olarak büyük harflerle yazdırır */}
          <div className="card-holder">{userName ? userName.toUpperCase() : 'MERYEM AYDIN'}</div>
        </div>
      </div>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  width: 320px;
  height: 200px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  font-family: 'Arial', sans-serif;

  .card-bg-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
  }

  .card-content {
    position: relative;
    z-index: 2;
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: #ffffff;
    box-sizing: border-box;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 1px;

      .card-type-badge {
        background: rgba(0, 0, 0, 0.4);
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
      }
    }

    .card-middle {
      .balance-label {
        font-size: 10px;
        margin: 0;
        opacity: 0.8;
      }
      .balance-amount {
        font-size: 24px;
        margin: 2px 0 0 0;
        font-weight: bold;
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      .card-number {
        font-size: 13px;
        letter-spacing: 2px;
        font-family: monospace;
      }

      .card-holder {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }
    }
  }
`;

export default Card;