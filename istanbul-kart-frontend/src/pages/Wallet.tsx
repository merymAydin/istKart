import React, { useState, useEffect } from "react";
import { cardsData } from "../data/cardsData";
import { useNavigate } from "react-router-dom";
import "./Wallet.css";

interface UserCard {
  id: number;
  cardNumber: string;
  balance: number;
  cardType: string;
  isActive: boolean;
  subscriptionRights?: number;
  subscriptionExpiryDate?: string;
  autoTopUpEnabled?: boolean;
  userName?: string;
  user?: {
    username?: string;
    name?: string;
  };
}

const Wallet: React.FC = () => {
  const [myCards, setMyCards] = useState<UserCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCards = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8080/api/cards/my-cards", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMyCards(data);
          if (data.length > 0) {
            setSelectedCard(data[0]);
          }
        }
      } catch (error) {
        console.error("Cüzdan kartları getirilemedi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCards();
  }, []);

  // Gerçek kullanıcı adını karttan, localStorage'dan veya JWT token'dan bulan fonksiyon
  const getDisplayUsername = () => {
    if (selectedCard?.userName) return selectedCard.userName;
    if (selectedCard?.user?.username) return selectedCard.user.username;
    if (selectedCard?.user?.name) return selectedCard.user.name;

    const stored = localStorage.getItem("username") || 
                   localStorage.getItem("userName") || 
                   localStorage.getItem("name");
    if (stored) return stored;

    try {
      const token = localStorage.getItem("token");
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        if (payload.sub) return payload.sub;
        if (payload.username) return payload.username;
      }
    } catch{
      // Token çözülemezse yoksay
    }

    return "KULLANICI";
  };

  const getCardVisuals = (type: string) => {
    const normalizedId = type.toUpperCase();
    let cardId = "regular";
    if (normalizedId.includes("REGULAR") || normalizedId === "NORMAL") cardId = "regular";
    else if (normalizedId.includes("DISCOUNT") || normalizedId === "STUDENT") cardId = "discounted";
    else if (normalizedId.includes("FREE") || normalizedId === "ELDERLY") cardId = "free";
    else if (normalizedId === "YELLOW") cardId = "free";
    else if (normalizedId === "PLUS") cardId = "plus";
    else if (normalizedId === "BLUE" || normalizedId === "FACILITY") cardId = "blue";
    else if (normalizedId === "CITY") cardId = "city";

    return cardsData.find(c => c.id === cardId) || cardsData[0];
  };

  if (isLoading) {
    return <div className="wallet-loading">Loading your wallet...</div>;
  }

  return (
    <div className="wallet-container">
      <header className="wallet-header">
        <div className="light-segmented-switch">
          <button className="light-switch-option active">
            Wallet
          </button>
          <button className="light-switch-option" onClick={() => navigate("/dashboard")}>
            Cards
          </button>
        </div>

        <h1>My Wallet</h1>
        <p>Manage your portfolio, track balances and inspect card details.</p>
      </header>

      {myCards.length === 0 ? (
        <div className="wallet-empty">
          <p>You don't have any cards in your wallet yet.</p>
          <button onClick={() => navigate("/dashboard")} className="explore-btn">Explore & Get Cards</button>
        </div>
      ) : (
        <div className="wallet-content-grid">
          
          <div className="wallet-cards-sidebar">
            <h3>Active Cards ({myCards.length})</h3>
            <div className="sidebar-cards-list">
              {myCards.map((card) => {
                const visuals = getCardVisuals(card.cardType);
                const isSelected = selectedCard?.id === card.id;
                return (
                  <div 
                    key={card.id} 
                    className={`sidebar-card-item ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedCard(card)}
                    style={{ borderLeftColor: visuals.themeColor }}
                  >
                    <img src={visuals.img} alt={visuals.title} />
                    <div className="sidebar-card-meta">
                      <h4>{visuals.title}</h4>
                      <p>•••• {card.cardNumber?.slice(-4)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedCard && (
            <div className="wallet-card-details-panel">
              {(() => {
                const visuals = getCardVisuals(selectedCard.cardType);
                return (
                  <div className="panel-inner">
                    
                    <div className="wallet-detail-layout">
                      
                      {/* SOL KISIM: KART VE BUTONLAR */}
                      <div className="wallet-card-column">
                        
                        <div 
                          className="realistic-card-widget" 
                          style={{ background: `linear-gradient(135deg, ${visuals.themeColor}, #2e3a4d)` }}
                        >
                          <div className="rc-content">
                            <div className="rc-header">
                              <span>İSTANBULKART</span>
                              <svg className="rc-contactless" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8.5 14.5A3.5 3.5 0 0 1 9 10"/>
                                <path d="M5.5 17.5a7 7 0 0 1 0-11"/>
                                <path d="M11.5 11.5a1.5 1.5 0 0 1 0 1"/>
                              </svg>
                            </div>

                            <div className="rc-middle">
                              <p className="rc-label">CURRENT BALANCE</p>
                              <h2 className="rc-amount">₺{selectedCard.balance.toFixed(2)}</h2>
                            </div>

                            <div className="rc-footer">
                              <div className="rc-footer-left">
                                <div className="rc-number">
                                  {selectedCard.cardNumber ? selectedCard.cardNumber.match(/.{1,4}/g)?.join(' ') : '•••• •••• •••• ••••'}
                                </div>
                                <div className="rc-holder">
                                  {getDisplayUsername().toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* AKSİYON BUTONLARI (Kartın Altında) */}
                        <div className="rc-action-buttons">
                          <button className="rc-btn rc-transfer" onClick={() => navigate("/payment")}>
                            <svg width={18} height={18} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                              <path d="M7 17l9.2-9.2M17 17V7H7" />
                            </svg>
                            Transfer
                          </button>
                          <button className="rc-btn rc-subscription" onClick={() => navigate("/payment")}>
                            Subscription
                          </button>
                        </div>
                        
                      </div>

                      {/* SAĞ KISIM: İSTATİSTİKLER */}
                      <div className="wallet-stats-column">
                        <div className="stat-card">
                          <span>Subscription Rights</span>
                          <h2>{selectedCard.subscriptionRights || 0} Rides</h2>
                        </div>
                        <div className="stat-card">
                          <span>Card Status</span>
                          <h2 style={{ color: selectedCard.isActive ? "#10b981" : "#ef4444" }}>
                            {selectedCard.isActive ? "Active" : "Inactive"}
                          </h2>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Wallet;