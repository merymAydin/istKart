import React, { useState, useEffect, useCallback } from "react";
import { cardsData } from "../data/cardsData";
import { useNavigate } from "react-router-dom";
import "./Wallet.css";
import Chatbot from "../components/Chatbot";
import bus1Img from "../assets/bus1.png";

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
  
  const [isSpendOpen, setIsSpendOpen] = useState<boolean>(false);
  const [spendCardNumber, setSpendCardNumber] = useState<string>("");
  const [terminalId, setTerminalId] = useState<string>("");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [terminals, setTerminals] = useState<any[]>([]);

  // AUTO-PAY INLINE SETTINGS
  const [isAutoPaySettingsOpen, setIsAutoPaySettingsOpen] = useState<boolean>(false);
  const [autoPayThreshold, setAutoPayThreshold] = useState<string>("50");
  const [autoPayAmount, setAutoPayAmount] = useState<string>("100");

  const navigate = useNavigate();

  const fetchMyCards = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/cards/my-cards", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyCards(data);
        if (data.length > 0) {
          setSelectedCard(prev => prev ? data.find((c: UserCard) => c.id === prev.id) || data[0] : data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTerminals = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/schedules", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const schedulesData = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uniqueTerminals: any[] = [];
        const terminalIds = new Set();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schedulesData.forEach((schedule: any) => {
          if (schedule.terminal && !terminalIds.has(schedule.terminal.id)) {
            terminalIds.add(schedule.terminal.id);
            uniqueTerminals.push(schedule.terminal);
          }
        });

        setTerminals(uniqueTerminals);
        if (uniqueTerminals.length > 0) {
          setTerminalId(uniqueTerminals[0].id || uniqueTerminals[0].terminalCode || uniqueTerminals[0].name); 
        }
      }
    } catch (error) {
      console.error("Failed to load terminals:", error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMyCards();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTerminals();
  }, [fetchMyCards, fetchTerminals]);

  const handleSpendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spendCardNumber) {
      alert("Please enter a card number.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/cards/spend?cardNumber=${spendCardNumber}&terminalId=${terminalId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Spend (Ride) successful!");
        setIsSpendOpen(false);
        setSpendCardNumber("");
        fetchMyCards();
      } else {
        const err = await response.text();
        alert("Spend failed: " + err);
      }
    } catch (err) {
      console.error("Spend error:", err);
      alert("Cannot connect to server.");
    }
  };

  const executeAutoPayToggle = async (cardNumber: string, enable: boolean, threshold: number, amount: number) => {
    try {
      const token = localStorage.getItem("token");
      let url = `http://localhost:8080/api/cards/auto-topup?cardNumber=${cardNumber}&enable=${enable}`;
      if (enable) {
        url += `&threshold=${threshold}&amount=${amount}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        // Hata olursa switch'i eski haline döndür
        setSelectedCard(prev => prev ? { ...prev, autoTopUpEnabled: !enable } : null);
        setMyCards(prev => prev.map(c => c.cardNumber === cardNumber ? { ...c, autoTopUpEnabled: !enable } : c));
        const errText = await response.text();
        alert("Auto-pay update failed: " + errText);
      } else if (enable) {
        // alert("Auto-pay settings saved successfully!"); // İstersen bu bildirimi açabilirsin
      }
    } catch (err) {
      setSelectedCard(prev => prev ? { ...prev, autoTopUpEnabled: !enable } : null);
      setMyCards(prev => prev.map(c => c.cardNumber === cardNumber ? { ...c, autoTopUpEnabled: !enable } : c));
      console.error("Auto-pay error:", err);
    }
  };

  const handleToggleAutoPayClick = (cardNumber: string) => {
    if (!selectedCard) return;

    const willBeEnabled = !selectedCard.autoTopUpEnabled;

    // 1. Tıklandığı an switch'i sağa veya sola kaydır (Anında tepki)
    setSelectedCard({ ...selectedCard, autoTopUpEnabled: willBeEnabled });
    setMyCards(prev => prev.map(c => c.cardNumber === cardNumber ? { ...c, autoTopUpEnabled: willBeEnabled } : c));

    if (willBeEnabled) {
      // 2. Açılıyorsa ayar formunu göster
      setIsAutoPaySettingsOpen(true);
    } else {
      // 3. Kapatılıyorsa doğrudan backend'e kapatma isteği at
      executeAutoPayToggle(cardNumber, false, 0, 0);
      setIsAutoPaySettingsOpen(false);
    }
  };

  const handleCancelAutoPay = () => {
    setIsAutoPaySettingsOpen(false);
    if (selectedCard) {
      // Form iptal edildiği için switch'i geri sola çek
      setSelectedCard({ ...selectedCard, autoTopUpEnabled: false });
      setMyCards(prev => prev.map(c => c.cardNumber === selectedCard.cardNumber ? { ...c, autoTopUpEnabled: false } : c));
    }
  };

  const handleAutoPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;

    const thresholdNum = Number(autoPayThreshold);
    const amountNum = Number(autoPayAmount);

    if (thresholdNum < 0 || amountNum <= 0) {
      alert("Please enter valid amounts.");
      return;
    }

    setIsAutoPaySettingsOpen(false);
    executeAutoPayToggle(selectedCard.cardNumber, true, thresholdNum, amountNum);
  };

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
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c: string) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        if (payload.sub) return payload.sub;
        if (payload.username) return payload.username;
      }
    } catch {
      // Ignore token parsing error
    }

    return "USER";
  };

  const getCardVisuals = (type: string) => {
    const normalizedId = type.toUpperCase();
    let cardId = "regular";
    if (normalizedId.includes("REGULAR") || normalizedId === "NORMAL") cardId = "regular";
    else if (normalizedId.includes("DISCOUNT") || normalizedId === "STUDENT") cardId = "discounted";
    else if (normalizedId.includes("FREE") || normalizedId === "YELLOW" || normalizedId === "ELDERLY") cardId = "free";
    else if (normalizedId === "PLUS") cardId = "plus";
    else if (normalizedId === "BLUE" || normalizedId === "FACILITY") cardId = "blue";
    else if (normalizedId === "CITY") cardId = "city";

    return cardsData.find(c => c.id === cardId) || cardsData[0];
  };

  if (isLoading) {
    return <div className="wallet-loading">Loading your wallet...</div>;
  }

  const isYellowCard = selectedCard?.cardType.toUpperCase().includes("YELLOW") || 
                       selectedCard?.cardType.toUpperCase().includes("FREE") || 
                       selectedCard?.cardType.toUpperCase() === "ELDERLY";

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
                    onClick={() => { setSelectedCard(card); setIsAutoPaySettingsOpen(false); }}
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

                        {/* AKSİYON BUTONLARI VE INLINE AYARLAR */}
                        <div className="rc-action-buttons-stack" style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                          
                          <div style={{ display: "flex", gap: "15px", width: "100%", height: "48px" }}>
                            <button 
                              className="rc-btn rc-transfer" 
                              onClick={() => {
                                if (isYellowCard) {
                                  alert("Cannot top-up free/yellow cards!");
                                  return;
                                }
                                navigate("/payment");
                              }}
                              disabled={isYellowCard}
                              style={{ opacity: isYellowCard ? 0.5 : 1, cursor: isYellowCard ? "not-allowed" : "pointer" }}
                            >
                              <svg width={18} height={18} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                                <path d="M7 17l9.2-9.2M17 17V7H7" />
                              </svg>
                              Transfer
                            </button>
                            
                            <button 
                              className="rc-btn rc-subscription" 
                              onClick={() => {
                                if (isYellowCard) {
                                  alert("Cannot add subscriptions to free/yellow cards!");
                                  return;
                                }
                                navigate("/payment");
                              }}
                              disabled={isYellowCard}
                              style={{ opacity: isYellowCard ? 0.5 : 1, cursor: isYellowCard ? "not-allowed" : "pointer" }}
                            >
                              Subscription
                            </button>
                          </div>

                          <div style={{ display: "flex", gap: "15px", width: "100%", height: "48px" }}>
                            
                            <button 
                              className="rc-btn spend-3d-btn" 
                              onClick={() => { setSpendCardNumber(selectedCard.cardNumber); setIsSpendOpen(true); }}
                              data-tooltip="Ride / Pass"
                            >
                              <div className="button-wrapper">
                                <div className="text">💳 Spend</div>
                                <span className="icon">
                                  <img src={bus1Img} alt="Bus" style={{ width: 24, height: 24, objectFit: "contain" }} />
                                </span>
                              </div>
                            </button>

                            <div 
                              className="rc-btn autopay-3d-container" 
                              style={{ 
                                opacity: isYellowCard ? 0.5 : 1, 
                                cursor: isYellowCard ? "not-allowed" : "default",
                                justifyContent: "space-between",
                                padding: "0 15px"
                              }}
                            >
                              <span style={{ fontWeight: 700 }}>Auto-Pay</span>
                              <div className="checkbox-wrapper-5" style={{ pointerEvents: isYellowCard ? "none" : "auto" }}>
                                <div className="check">
                                  <input 
                                    id={`autopay-${selectedCard.cardNumber}`} 
                                    type="checkbox" 
                                    checked={selectedCard.autoTopUpEnabled || false} 
                                    onChange={() => handleToggleAutoPayClick(selectedCard.cardNumber)} 
                                    disabled={isYellowCard}
                                  />
                                  <label htmlFor={`autopay-${selectedCard.cardNumber}`} />
                                </div>
                              </div>
                            </div>

                          </div>
                          
                          {/* INLINE AUTO-PAY SETTINGS */}
                          {isAutoPaySettingsOpen && !isYellowCard && (
                            <form 
                              onSubmit={handleAutoPaySubmit} 
                              style={{
                                background: "#f8fafc",
                                border: "1px solid #cbd5e1",
                                borderRadius: "12px",
                                padding: "16px",
                                marginTop: "4px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                                animation: "fadeIn 0.3s ease-in-out"
                              }}
                            >
                              <div style={{ display: "flex", gap: "15px" }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                                    Min. Balance (₺)
                                  </label>
                                  <input 
                                    type="number" 
                                    min="0"
                                    value={autoPayThreshold}
                                    onChange={(e) => setAutoPayThreshold(e.target.value)}
                                    required
                                    style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                                  />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                                    Top-up Amount (₺)
                                  </label>
                                  <input 
                                    type="number" 
                                    min="1"
                                    value={autoPayAmount}
                                    onChange={(e) => setAutoPayAmount(e.target.value)}
                                    required
                                    style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                                  />
                                </div>
                              </div>
                              
                              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                                <button type="submit" className="go-wallet-btn" style={{ flex: 1, padding: "10px", fontSize: "14px" }}>
                                  Save Settings
                                </button>
                                <button type="button" onClick={handleCancelAutoPay} className="close-success-btn" style={{ flex: 1, padding: "10px", fontSize: "14px" }}>
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}

                        </div>
                        
                      </div>

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

      {/* SPEND MODALI */}
      {isSpendOpen && (
        <div className="modal-overlay" onClick={() => setIsSpendOpen(false)}>
          <div className="success-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Make a Ride / Spend</h3>
            <p>Enter your card number to pass the turnstile.</p>
            <form onSubmit={handleSpendSubmit}>
              <input 
                type="text" 
                placeholder="Card Number (e.g. 9024...)" 
                value={spendCardNumber}
                onChange={(e) => setSpendCardNumber(e.target.value)}
                required
              />
              <select 
                value={terminalId} 
                onChange={(e) => setTerminalId(e.target.value)}
                required
              >
                {terminals.length === 0 ? (
                  <option value="" disabled>Loading terminals...</option>
                ) : (
                  terminals.map((terminal, index) => (
                    <option 
                      key={index} 
                      value={terminal.id || terminal.terminalCode || terminal.name}
                    >
                      {terminal.name || terminal.terminalName || `Terminal ${terminal.id}`}
                    </option>
                  ))
                )}
              </select>
              <button type="submit" className="go-wallet-btn">Confirm Pass</button>
              <button type="button" className="close-success-btn" onClick={() => setIsSpendOpen(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <Chatbot />
    </div>
  );
};

export default Wallet;