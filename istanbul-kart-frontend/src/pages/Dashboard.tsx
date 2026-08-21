import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { cardsData } from "../data/cardsData";
import walletVideo from "../assets/wallet.mp4";
import Chatbot from "../components/Chatbot"; // Yolunu kendi klasör yapına göre ayarlayabilirsin

interface PerkItem {
  name: string;
  icon: string;
}

interface CardItem {
  id: string;
  title: string;
  description: string;
  img: string;
  lightBg: string;
  themeColor: string;
  features: string[];
  requirements: string[];
  fee: string;
  perks?: PerkItem[];
}

const Dashboard: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [successCard, setSuccessCard] = useState<CardItem | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const handleApplyCard = async (card: CardItem) => {
    if (isAdding) return;
    setIsAdding(true);

    try {
      const mapCardTypeToEnum = (id: string) => {
        const normalizedId = id.toUpperCase();
        if (normalizedId.includes("REGULAR") || normalizedId === "REGULAR") return "NORMAL";
        if (normalizedId.includes("DISCOUNT") || normalizedId === "DISCOUNTED") return "STUDENT";
        if (normalizedId.includes("FREE") || normalizedId === "FREE") return "ELDERLY";
        if (normalizedId === "YELLOW") return "YELLOW";
        if (normalizedId === "PLUS") return "PLUS";
        if (normalizedId === "BLUE" || normalizedId === "FACILITY") return "FACILITY";
        if (normalizedId === "CITY") return "CITY";
        return normalizedId;
      };

      const backendCardType = mapCardTypeToEnum(card.id);
      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:8080/api/cards/create?cardType=${backendCardType}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSelectedCard(null);
        setSuccessCard(card);
      } else {
        const errorText = await response.text();
        alert("Card couldn't be added: " + errorText);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Cannot connect to server.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="dash-container">
      <div className={`grid-header ${mounted ? "docked" : ""}`}>
        <div className="light-segmented-switch">
          <button className="light-switch-option" onClick={() => navigate("/wallet")}>
            Wallet
          </button>
          <button className="light-switch-option active">
            Cards
          </button>
        </div>

        <h2>Find the Right Card for You</h2>
        <p>Select a card below to see application requirements and details.</p>
      </div>

      <div className="cards-grid-section">
        <div className="cards-grid-container">
          {(cardsData as CardItem[]).map((card, index) => (
            <div 
              key={card.id} 
              className={`grid-card-box ${mounted ? "docked" : ""}`}
              style={{ animationDelay: `${index * 0.2}s` }}
              onClick={() => setSelectedCard(card)}
            >
              <div className="gc-header">
                <div className="gc-header-bg" style={{ backgroundColor: card.lightBg }}></div>
                <h3 style={{ color: card.themeColor }}>{card.title}</h3>
                <div className="card-slot-target">
                  <img src={card.img} className="internal-docked-card" alt={card.title} />
                </div>
              </div>

              <div className="gc-body">
                <ul>
                  {card.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="dot" style={{ backgroundColor: card.themeColor }}></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAY MODALI */}
      {selectedCard && (
        <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
          <div 
            className={`cd-content-wrapper ${selectedCard ? "docked" : ""}`} 
            style={{ backgroundColor: selectedCard.lightBg }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="cd-close-btn" onClick={() => setSelectedCard(null)}>×</button>

            <div className="cd-image-container">
              <img src={selectedCard.img} className="cd-floating-card" alt={selectedCard.title} />
            </div>

            <div className="cd-info-container">
              <h2 style={{ color: selectedCard.themeColor }}>{selectedCard.title}</h2>
              <p className="cd-desc">{selectedCard.description}</p>

              <div className="cd-details-grid">
                <div className="cd-detail-item">
                  <span className="cd-label">Requirements</span>
                  <ul>
                    {selectedCard.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div className="cd-detail-item">
                  <span className="cd-label">Card Fee</span>
                  <p className="cd-fee-text" style={{ color: selectedCard.themeColor }}>
                    {selectedCard.fee}
                  </p>
                </div>
              </div>

              {selectedCard.perks && (
                <div className="perks-grid" style={{ marginBottom: "30px" }}>
                  {selectedCard.perks.map((perk, pIdx) => (
                    <div key={pIdx} className="perk-item" style={{ background: "rgba(255,255,255,0.7)" }}>
                      <img src={perk.icon} alt={perk.name} className="perk-icon" />
                      <span>{perk.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="cd-action-footer">
                <button 
                  className="cd-apply-btn"
                  style={{ backgroundColor: selectedCard.themeColor }}
                  onClick={() => handleApplyCard(selectedCard)}
                >
                  Apply for a Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BAŞARI MODALI */}
      {successCard && (
        <div className="modal-overlay" onClick={() => setSuccessCard(null)}>
          <div className="success-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="success-video-container">
              <video 
                src={walletVideo} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="success-wallet-video"
              />
            </div>

            <h3 style={{ color: successCard.themeColor }}>Successfully Added!</h3>
            <p>Your <strong>{successCard.title}</strong> has been successfully added to your wallet.</p>

            <div className="success-btn-group">
              <button className="go-wallet-btn" onClick={() => navigate("/wallet")}>
                Go to Wallet
              </button>
              <button className="close-success-btn" onClick={() => setSuccessCard(null)}>
                Continue Exploring
              </button>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
    </div>
  );
};

export default Dashboard;