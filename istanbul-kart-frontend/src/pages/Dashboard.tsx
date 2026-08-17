import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Card from '../components/Card';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [hasCard, setHasCard] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [subscription, setSubscription] = useState<number>(0);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardType, setCardType] = useState<string>('NORMAL');
  const [userName, setUserName] = useState<string>(''); 

  useEffect(() => {
    const checkCardStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:8080/api/cards/my-card', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Backend'den dönen hata mesajı:", errorText);
          return; 
        }

        const data = await response.json();
        
        if (data.exists) {
          setHasCard(true);
          setBalance(data.balance || 0);
          setCardNumber(data.cardNumber || '');
          setCardType(data.cardType || 'NORMAL');
          setSubscription(data.subscriptionRights || 0); 
          setUserName(data.userName || ''); 
        } else {
          setHasCard(false);
        }
        
      } catch (error) {
        console.error("Kart durumu kontrol edilirken ağ hatası:", error);
      }
    };

    checkCardStatus();
  }, []);

  return (
    <DashboardContainer>
      <Header>
        <h1>Welcome back!</h1>
        <p>Manage your Istanbulkart and travel effortlessly.</p>
      </Header>

      <ContentWrapper>
        {hasCard ? (
          <CardAndActions>
            <Card 
              balance={balance} 
              subscription={subscription} 
              cardType={cardType}
              cardNumber={cardNumber} 
              userName={userName}
            />
            
            {/* KARTIN ALTINDAKİ TRANSFER VE ABONMAN BUTONLARI */}
            <ActionButtons>
              <button className="btn btn-transfer" onClick={() => navigate('/payment')}>
                <svg width={18} height={18} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
                TL Yükle
              </button>
              
              {/* DEĞİŞİKLİK BURADA: navigate içine state ekledik */}
              <button className="btn btn-save" onClick={() => navigate('/payment', { state: { openAbonman: true } })}>
                <svg width={18} height={18} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-7h-2c0-1-.5-1.5-1-2h0V5z" />
                  <path d="M13 5c-1 1.5-2 3-2 3" />
                  <path d="M16 5c1 1.5 2 3 2 3" />
                </svg>
                Abonman Yükle
              </button>
            </ActionButtons>
            
          </CardAndActions>
        ) : (
          <NoCardSection>
            <div className="empty-state">
              <h2>You don't have a card yet!</h2>
              <p>Get your personal Istanbulkart now to enjoy the city transit.</p>
              
              <div onClick={() => navigate('/card-selection')} style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                <GetCardButton />
              </div>
            </div>
          </NoCardSection>
        )}
      </ContentWrapper>
    </DashboardContainer>
  );
};


// BUTON COMPONENTI
const GetCardButton: React.FC = () => {
  return (
    <StyledWrapper>
      <div data-tooltip="Get Yours" className="button">
        <div className="button-wrapper">
          <div className="text">Get a Card</div>
          <span className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </span>
        </div>
      </div>
    </StyledWrapper>
  );
};

// STYLED COMPONENTS
const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #0f172a;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 20px;
  font-family: 'Arial', sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 50px;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    background: linear-gradient(90deg, #ec4899, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #94a3b8;
    font-size: 1.1rem;
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
`;

/* KART VE BUTONLARI HİZALAYAN YENİ KISIM */
const CardAndActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 320px; /* Kartın genişliği ile aynı tutuldu */
  gap: 15px;

  .btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    border: none;
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  .btn svg {
    margin-right: 8px;
  }

  .btn-transfer {
    background-color: rgb(253, 253, 253);
    color: #3b82f6;
  }

  .btn-save {
    background-color: #7e4ed1;
    color: white;
  }
`;

const NoCardSection = styled.div`
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 50px 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);

  .empty-state h2 {
    font-size: 1.8rem;
    margin-bottom: 15px;
    color: #f1f5f9;
  }

  .empty-state p {
    color: #94a3b8;
    line-height: 1.5;
  }
`;

const StyledWrapper = styled.div`
  .button {
    --width: 140px;
    --height: 45px;
    --tooltip-height: 35px;
    --tooltip-width: 100px;
    --gap-between-tooltip-to-button: 18px;
    --button-color: #000000;
    width: var(--width);
    height: var(--height);
    background: var(--button-color);
    position: relative;
    text-align: center;
    border-radius: 0.45em;
    font-family: "Arial";
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0);
  }

  .button-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .text {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 500;
    transition: top 0.4s ease-in-out;
  }

  .icon {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 100%; 
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: top 0.4s ease-in-out;
  }

  .button:hover {
    background: #334155;
  }

  .button:hover .text {
    top: -100%; 
  }

  .button:hover .icon {
    top: 0; 
  }

  .button::before {
    position: absolute;
    content: attr(data-tooltip);
    width: var(--tooltip-width);
    height: var(--tooltip-height);
    background-color: #010101;
    font-size: 0.9rem;
    color: #fff;
    border-radius: .25em;
    line-height: var(--tooltip-height);
    bottom: calc(var(--height) + var(--gap-between-tooltip-to-button) + 10px);
    left: calc(50% - var(--tooltip-width) / 2);
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s;
  }

  .button::after {
    position: absolute;
    content: '';
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-top-color: #475569;
    left: calc(50% - 10px);
    bottom: calc(100% + var(--gap-between-tooltip-to-button) - 10px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s;
  }

  .button:hover::before, .button:hover::after {
    opacity: 1;
    visibility: visible;
  }

  .button:hover::after {
    bottom: calc(var(--height) + var(--gap-between-tooltip-to-button) - 20px);
  }

  .button:hover::before {
    bottom: calc(var(--height) + var(--gap-between-tooltip-to-button));
  }
`;

export default Dashboard;