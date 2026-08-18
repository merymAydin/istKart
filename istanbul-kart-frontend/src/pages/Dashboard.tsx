import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Card from "../components/Card";
import busVideo from "../assets/bus.mp4"; 
import busImg from "../assets/bus1.png";

interface Terminal {
  id: number;
  name?: string;
  location?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [hasCard, setHasCard] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [subscription, setSubscription] = useState<number>(0);
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardType, setCardType] = useState<string>("NORMAL");
  const [userName, setUserName] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  const [autoTopUp, setAutoTopUp] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(50);
  const [topUpAmount, setTopUpAmount] = useState<number>(100);
  const [isSavingAuto, setIsSavingAuto] = useState<boolean>(false);

  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [selectedTerminalId, setSelectedTerminalId] = useState<number>(1);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSpending, setIsSpending] = useState<boolean>(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const cardResponse = await fetch(
          "http://localhost:8080/api/cards/my-card",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (cardResponse.ok) {
          const data = await cardResponse.json();
          if (data.exists) {
            setHasCard(true);
            setBalance(data.balance || 0);
            setCardNumber(data.cardNumber || "");
            setCardType(data.cardType || "NORMAL");
            setSubscription(data.subscriptionRights ?? data.subscription ?? data.subscription_rights ?? 0);
            setUserName(data.userName || "");
            setExpiryDate(data.subscriptionExpiryDate || data.subscription_expiry_date || "");
            
            setAutoTopUp(data.autoTopUpEnabled || false);
            setThreshold(data.autoTopUpThreshold || 50);
            setTopUpAmount(data.autoTopUpAmount || 100);
          } else {
            setHasCard(false);
          }
        }

        try {
          const termResponse = await fetch("http://localhost:8080/api/terminals", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (termResponse.ok) {
            const termData = await termResponse.json();
            if (Array.isArray(termData) && termData.length > 0) {
              setTerminals(termData);
              setSelectedTerminalId(termData[0].id);
            } else {
              setTerminals([{ id: 1, name: "Main City Terminal" }]);
            }
          } else {
            setTerminals([{ id: 1, name: "Main City Terminal" }]);
          }
        } catch {
          setTerminals([{ id: 1, name: "Main City Terminal" }]);
        }

      } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
      }
    };

    fetchData();
  }, []);

  const handleSaveAutoTopUp = async (enabled: boolean) => {
    setIsSavingAuto(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/cards/auto-topup?cardNumber=${cardNumber}&enable=${enabled}&threshold=${threshold}&amount=${topUpAmount}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setAutoTopUp(enabled);
      } else {
        const errorText = await response.text();
        alert("Backend Hatası: " + errorText);
      }
    } catch (error) {
      console.error("Hata:", error);
    }
    setIsSavingAuto(false);
  };

  const openModal = () => {
    if (!cardNumber) {
      alert("Card not found!");
      return;
    }
    setIsModalOpen(true);
    setShowSuccessAnimation(false);
  };

  const handleConfirmRide = async () => {
    setIsSpending(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/cards/spend?cardNumber=${cardNumber}&terminalId=${selectedTerminalId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const resultMessage = await response.text();
      
      if (response.ok) {
        setSuccessMessage("Transition Successful! " + resultMessage);
        setShowSuccessAnimation(true);
        
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        alert("❌ Transaction Failed: " + resultMessage);
        setIsSpending(false);
      }
    } catch (error) {
      console.error("Spend error:", error);
      alert("Connection error occurred.");
      setIsSpending(false);
    }
  };

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
              subscriptionExpiryDate={expiryDate}
              cardType={cardType}
              cardNumber={cardNumber}
              userName={userName}
            />

            <div style={{
              background: '#1e293b',
              border: '1px solid #3b82f6',
              padding: '12px 20px',
              borderRadius: '12px',
              width: '320px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              <p style={{ margin: '0', fontSize: '14px', color: '#94a3b8' }}>Active Subscription:</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#38bdf8' }}>
                {subscription > 0 ? `${subscription} Passes Left` : 'No Subscription'}
              </p>
              {subscription > 0 && expiryDate && (
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Expires on: {new Date(expiryDate).toLocaleDateString('en-GB')}
                </p>
              )}
            </div>

            <AutoTopUpPanel>
              <div className="panel-header">
                <div className="texts">
                  <h4>🤖 Smart Auto Top-Up</h4>
                  <p>Never run out of balance</p>
                </div>
                
                <div className="checkbox-wrapper-5">
                  <div className="check">
                    <input 
                      id="check-5" 
                      type="checkbox" 
                      checked={autoTopUp} 
                      onChange={(e) => handleSaveAutoTopUp(e.target.checked)} 
                      disabled={isSavingAuto}
                    />
                    <label htmlFor="check-5" />
                  </div>
                </div>
              </div>

              {autoTopUp && (
                <div className="settings-container">
                  <label className="input-group">
                    <span>If balance is below (₺):</span>
                    <input 
                      type="number" 
                      value={threshold} 
                      onChange={(e) => setThreshold(Number(e.target.value))}
                    />
                  </label>
                  <label className="input-group">
                    <span>Auto load amount (₺):</span>
                    <input 
                      type="number" 
                      value={topUpAmount} 
                      onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    />
                  </label>
                  <button className="btn-update" onClick={() => handleSaveAutoTopUp(true)} disabled={isSavingAuto}>
                    {isSavingAuto ? "Saving..." : "Update AI Rules"}
                  </button>
                </div>
              )}
            </AutoTopUpPanel>

            <ActionButtons>
              <button className="btn btn-transfer" onClick={() => navigate("/payment")}>
                <svg width={18} height={18} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
                Transfer 
              </button>

              <button
                className="btn btn-save"
                onClick={() => {
                  if (subscription === 0) {
                    navigate("/payment", { state: { openAbonman: true } });
                  }
                }}
                disabled={subscription > 0}
                style={{
                  opacity: subscription > 0 ? 0.5 : 1,
                  cursor: subscription > 0 ? "not-allowed" : "pointer",
                  background: subscription > 0 ? "#4b5563" : "#7e4ed1",
                }}
              >
                {subscription > 0 ? "Subscribed" : "Subscribe"}
              </button>
            </ActionButtons>

            {/* --- SADECE AÇILAN PENCERE BEYAZ (MODAL) --- */}
            {isModalOpen && (
              <ModalOverlay>
                <ModalContent>
                  <CloseButton onClick={() => { if(!isSpending && !showSuccessAnimation) setIsModalOpen(false); }}>×</CloseButton>
                  
                  {showSuccessAnimation ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 0' }}>
                      <video 
    src={busVideo} 
    autoPlay 
    loop 
    muted 
    playsInline
    preload="auto"
    style={{ 
      width: "120px", 
      height: "auto",
      borderRadius: "8px", 
      background: "transparent",
      mixBlendMode: "multiply" // Beyaz arka planı beyaz modal üzerinde tamamen yok eder
    }}
  />
                      <h3 style={{ color: '#00d2c4', margin: '5px 0', fontSize: '16px' }}>Transition Successful!</h3>
                      <p style={{ color: '#475569', fontSize: '12px', margin: 0, lineHeight: '1.4' }}>{successMessage}</p>
                    </div>
                  ) : (
                    <>
                      <h3 style={{ color: '#1e293b', margin: '0 0 5px 0', fontSize: '17px', textAlign: 'center' }}>Select Transit Terminal</h3>
                      
                      <div className="terminal-selector">
                        <label>Terminal:</label>
                        <select 
                          value={selectedTerminalId} 
                          onChange={(e) => setSelectedTerminalId(Number(e.target.value))}
                          disabled={isSpending}
                        >
                          {terminals.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name ? t.name : `Terminal #${t.id}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Terminal Seçiminin Altındaki Otobüs Ödeme Animasyonu */}
                      <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
                        <video 
                          src={busVideo} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline
                          style={{ 
                            width: "110px", 
                            borderRadius: "8px", 
                            background: "transparent",
                            mixBlendMode: "screen"
                          }}
                        />
                      </div>

                      <button 
                        className="btn-confirm" 
                        onClick={handleConfirmRide}
                        disabled={isSpending}
                        style={{
                          background: "#00d2c4",
                          color: "#0f172a",
                          border: "none",
                          padding: "12px",
                          borderRadius: "10px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          opacity: isSpending ? 0.7 : 1
                        }}
                      >
                        {isSpending ? "Processing..." : "Confirm & Pay"}
                      </button>
                    </>
                  )}
                </ModalContent>
              </ModalOverlay>
            )}

            {/* Tap & Ride Butonu */}
            <div style={{ marginTop: "5px" }}>
              <TapRideButtonWrapper onClick={openModal}>
                <div data-tooltip="Tap & Go" className="button">
                  <div className="button-wrapper">
                    <div className="text">Tap & Ride</div>
                    <span className="icon">
                      <img src={busImg} alt="Bus" style={{ width: "32px", height: "auto", objectFit: "contain" }} />
                    </span>
                  </div>
                </div>
              </TapRideButtonWrapper>
            </div>

          </CardAndActions>
        ) : (
          <NoCardSection>
            <div className="empty-state">
              <h2>You don't have a card yet!</h2>
              <p>Get your personal Istanbulkart now to enjoy the city transit.</p>
              <div
                onClick={() => navigate("/card-selection")}
                style={{
                  marginTop: "30px",
                  display: "flex",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <GetCardButton />
              </div>
            </div>
          </NoCardSection>
        )}
      </ContentWrapper>
    </DashboardContainer>
  );
};

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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-in-out;
`;

const ModalContent = styled.div`
  background: #ffffff; /* Sadece açılan pencere bembeyaz */
  border: 1px solid #cbd5e1;
  padding: 24px 20px;
  border-radius: 20px;
  width: 340px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
  box-sizing: border-box;

  .terminal-selector {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
    color: #475569;

    select {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: #1e293b;
      padding: 10px;
      border-radius: 8px;
      outline: none;
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 15px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 22px;
  cursor: pointer;
  &:hover {
    color: #0f172a;
  }
`;

const TapRideButtonWrapper = styled.div`
  .button {
    --width: 280px;
    --height: 45px;
    --tooltip-height: 35px;
    --tooltip-width: 100px;
    --gap-between-tooltip-to-button: 18px;
    --button-color: #00d2c4;
    width: var(--width);
    height: var(--height);
    background: var(--button-color);
    position: relative;
    text-align: center;
    border-radius: 0.45em;
    font-family: "Arial";
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 210, 196, 0.3);
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
    color: #0f172a;
    font-weight: bold;
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
    color: #0f172a;
    transition: top 0.4s ease-in-out;
  }

  .button:hover {
    background: #00b5a8;
  }

  .button:hover .text {
    top: -100%;
  }

  .button:hover .icon {
    top: 0;
  }
`;

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #0f172a; /* Ana sayfa koyu tema */
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 20px;
  font-family: "Arial", sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 50px;
  h1 { font-size: 2.5rem; margin-bottom: 10px; background: linear-gradient(90deg, #ec4899, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  p { color: #94a3b8; font-size: 1.1rem; }
`;

const ContentWrapper = styled.div` width: 100%; max-width: 600px; display: flex; justify-content: center; `;
const CardAndActions = styled.div` display: flex; flex-direction: column; align-items: center; gap: 20px; `;

const ActionButtons = styled.div`
  display: flex; justify-content: space-between; width: 320px; gap: 15px;
  .btn { flex: 1; display: flex; align-items: center; justify-content: center; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: bold; cursor: pointer; border: none; transition: transform 0.3s, box-shadow 0.3s; }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); }
  .btn svg { margin-right: 8px; }
  .btn-transfer { background-color: rgb(253, 253, 253); color: #3b82f6; }
  .btn-save { background-color: #7e4ed1; color: white; }
`;

const AutoTopUpPanel = styled.div`
  background: #1e1e2f;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 15px 20px;
  border-radius: 16px;
  width: 320px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
  box-sizing: border-box;

  .panel-header { display: flex; justify-content: space-between; align-items: center; }
  .texts h4 { margin: 0; font-size: 15px; color: #10b981; }
  .texts p { margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; }

  .checkbox-wrapper-5 .check {
    --size: 28px;
    position: relative;
    background: linear-gradient(90deg, #10b981, #059669);
    line-height: 0;
    perspective: 400px;
    font-size: var(--size);
  }
  .checkbox-wrapper-5 .check input[type="checkbox"],
  .checkbox-wrapper-5 .check label,
  .checkbox-wrapper-5 .check label::before,
  .checkbox-wrapper-5 .check label::after,
  .checkbox-wrapper-5 .check {
    appearance: none; display: inline-block; border-radius: var(--size); border: 0; transition: .35s ease-in-out; box-sizing: border-box; cursor: pointer;
  }
  .checkbox-wrapper-5 .check label { width: calc(2.2 * var(--size)); height: var(--size); background: #4b5563; overflow: hidden; }
  .checkbox-wrapper-5 .check input[type="checkbox"] {
    position: absolute; z-index: 1; width: calc(.8 * var(--size)); height: calc(.8 * var(--size)); top: calc(.1 * var(--size)); left: calc(.1 * var(--size)); background: linear-gradient(45deg, #dedede, #ffffff); box-shadow: 0 6px 7px rgba(0,0,0,0.3); outline: none; margin: 0;
  }
  .checkbox-wrapper-5 .check input[type="checkbox"]:checked { left: calc(1.3 * var(--size)); }
  .checkbox-wrapper-5 .check input[type="checkbox"]:checked + label { background: transparent; }
  .checkbox-wrapper-5 .check label::before,
  .checkbox-wrapper-5 .check label::after {
    content: "· ·"; position: absolute; overflow: hidden; left: calc(.15 * var(--size)); top: calc(.5 * var(--size)); height: var(--size); letter-spacing: calc(-0.04 * var(--size)); color: #9b9b9b; font-family: "Times New Roman", serif; z-index: 2; font-size: calc(.6 * var(--size)); border-radius: 0; transform-origin: 0 0 calc(-0.5 * var(--size)); backface-visibility: hidden;
  }
  .checkbox-wrapper-5 .check label::after { content: "●"; top: calc(.65 * var(--size)); left: calc(.2 * var(--size)); height: calc(.1 * var(--size)); width: calc(.35 * var(--size)); font-size: calc(.2 * var(--size)); transform-origin: 0 0 calc(-0.4 * var(--size)); }
  .checkbox-wrapper-5 .check input[type="checkbox"]:checked + label::before,
  .checkbox-wrapper-5 .check input[type="checkbox"]:checked + label::after { left: calc(1.55 * var(--size)); top: calc(.4 * var(--size)); line-height: calc(.1 * var(--size)); transform: rotateY(360deg); }
  .checkbox-wrapper-5 .check input[type="checkbox"]:checked + label::after { height: calc(.16 * var(--size)); top: calc(.55 * var(--size)); left: calc(1.6 * var(--size)); font-size: calc(.6 * var(--size)); line-height: 0; }

  .settings-container { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; flex-direction: column; gap: 12px; }
  .input-group { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #cbd5e1; }
  .input-group input { width: 60px; background: #0f172a; border: 1px solid #3b82f6; color: white; padding: 5px; border-radius: 6px; text-align: center; outline: none; }
  .btn-update { margin-top: 5px; background: #3b82f6; color: white; border: none; padding: 8px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: bold; transition: 0.2s; }
  .btn-update:hover:not(:disabled) { background: #2563eb; }
  .btn-update:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const NoCardSection = styled.div`
  background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 50px 30px; text-align: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  .empty-state h2 { font-size: 1.8rem; margin-bottom: 15px; color: #f1f5f9; }
  .empty-state p { color: #94a3b8; line-height: 1.5; }
`;

const StyledWrapper = styled.div`
  .button {
    --width: 140px; --height: 45px; --tooltip-height: 35px; --tooltip-width: 100px; --gap-between-tooltip-to-button: 18px; --button-color: #000000;
    width: var(--width); height: var(--height); background: var(--button-color); position: relative; text-align: center; border-radius: 0.45em; font-family: "Arial"; overflow: hidden; cursor: pointer; box-shadow: 0 4px 15px rgba(0, 0, 0, 0);
  }
  .button-wrapper { position: relative; width: 100%; height: 100%; }
  .text { position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 500; transition: top 0.4s ease-in-out; }
  .icon { position: absolute; width: 100%; height: 100%; top: 100%; left: 0; display: flex; align-items: center; justify-content: center; color: #fff; transition: top 0.4s ease-in-out; }
  .button:hover { background: #334155; }
  .button:hover .text { top: -100%; }
  .button:hover .icon { top: 0; }
  .button::before {
    position: absolute; content: attr(data-tooltip); width: var(--tooltip-width); height: var(--tooltip-height); background-color: #010101; font-size: 0.9rem; color: #fff; border-radius: 0.25em; line-height: var(--tooltip-height); bottom: calc(var(--height) + var(--gap-between-tooltip-to-button) + 10px); left: calc(50% - var(--tooltip-width) / 2); opacity: 0; visibility: hidden; transition: all 0.4s;
  }
  .button::after {
    position: absolute; content: ""; width: 0; height: 0; border: 10px solid transparent; border-top-color: #475569; left: calc(50% - 10px); bottom: calc(100% + var(--gap-between-tooltip-to-button) - 10px); opacity: 0; visibility: hidden; transition: all 0.4s;
  }
  .button:hover::before, .button:hover::after { opacity: 1; visibility: visible; }
  .button:hover::after { bottom: calc(var(--height) + var(--gap-between-tooltip-to-button) - 20px); }
  .button:hover::before { bottom: calc(var(--height) + var(--gap-between-tooltip-to-button)); }
`;

export default Dashboard;