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
  const [showSuccessAnimation, setShowSuccessAnimation] =
    useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // --- 2. AI ASİSTAN (TWİTTER TARZI SAĞ ALT CHAT) STATE'LERİ ---
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string>(
    "👋 Hello! I am your AI assistant. I analyze your spending and travelling habits. How can I help you?",
  );
  const [chatInput, setChatInput] = useState<string>("");

  // --- AKILLI ASİSTAN FONKSİYONU ---
  const fetchAiAdviceFromGemini = (balanceVal: number, subVal: number) => {
    if (balanceVal < 50 && subVal === 0) {
      setAiMessage(
        `Current Balance ₺${balanceVal} and No Subscription. I suggest you to enable Smart Auto Top-Up!`,
      );
    } else if (balanceVal < 50) {
      setAiMessage(
        `Current Balance ₺${balanceVal} is below the threshold. Consider topping up before your next trip.`,
      );
    } else if (subVal > 0) {
      setAiMessage(
        `Great! You have ${subVal} ride rights and your balance is secure. Have a great trip!`,
      );
    } else {
      setAiMessage(`Your card status looks very good.`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const cardResponse = await fetch(
          "http://localhost:8080/api/cards/my-card",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (cardResponse.ok) {
          const data = await cardResponse.json();
          if (data.exists) {
            const fetchedBalance = data.balance || 0;
            const fetchedSub =
              data.subscriptionRights ??
              data.subscription ??
              data.subscription_rights ??
              0;

            setHasCard(true);
            setBalance(fetchedBalance);
            setCardNumber(data.cardNumber || "");
            setCardType(data.cardType || "NORMAL");
            setSubscription(fetchedSub);
            setUserName(data.userName || "");
            setExpiryDate(
              data.subscriptionExpiryDate ||
                data.subscription_expiry_date ||
                "",
            );

            setAutoTopUp(data.autoTopUpEnabled || false);
            setThreshold(data.autoTopUpThreshold || 50);
            setTopUpAmount(data.autoTopUpAmount || 100);

            // --- YAPAY ZEKA TAVSİYESİNİ BURADA ÇAĞIRIYORUZ ---
            fetchAiAdviceFromGemini(fetchedBalance, fetchedSub);
          } else {
            setHasCard(false);
          }
        }

        try {
          const termResponse = await fetch(
            "http://localhost:8080/api/terminals",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
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
        },
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
        },
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

            <div
              style={{
                background: "#1e293b",
                border: "1px solid #3b82f6",
                padding: "12px 20px",
                borderRadius: "12px",
                width: "320px",
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              <p style={{ margin: "0", fontSize: "14px", color: "#94a3b8" }}>
                Active Subscription:
              </p>
              <p
                style={{
                  margin: "5px 0 0 0",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#38bdf8",
                }}
              >
                {subscription > 0
                  ? `${subscription} Passes Left`
                  : "No Subscription"}
              </p>
              {subscription > 0 && expiryDate && (
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "12px",
                    color: "#94a3b8",
                  }}
                >
                  Expires on: {new Date(expiryDate).toLocaleDateString("en-GB")}
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
                  <button
                    className="btn-update"
                    onClick={() => handleSaveAutoTopUp(true)}
                    disabled={isSavingAuto}
                  >
                    {isSavingAuto ? "Saving..." : "Update AI Rules"}
                  </button>
                </div>
              )}
            </AutoTopUpPanel>

            <ActionButtons>
              <button
                className="btn btn-transfer"
                onClick={() => navigate("/payment")}
              >
                <svg
                  width={18}
                  height={18}
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
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

            {/* --- MODAL PENCERE --- */}
            {isModalOpen && (
              <ModalOverlay>
                <ModalContent>
                  <CloseButton
                    onClick={() => {
                      if (!isSpending && !showSuccessAnimation)
                        setIsModalOpen(false);
                    }}
                  >
                    ×
                  </CloseButton>

                  {showSuccessAnimation ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        padding: "15px 0",
                      }}
                    >
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
                          borderRadius: "12px",
                          background: "#ffffff",
                          padding: "10px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          marginBottom: "12px",
                        }}
                      />
                      <h3
                        style={{
                          color: "#00d2c4",
                          margin: "5px 0",
                          fontSize: "16px",
                        }}
                      >
                        Transition Successful!
                      </h3>
                      <p
                        style={{
                          color: "#475569",
                          fontSize: "12px",
                          margin: 0,
                          lineHeight: "1.4",
                        }}
                      >
                        {successMessage}
                      </p>
                    </div>
                  ) : (
                    <>
                      <h3
                        style={{
                          color: "#1e293b",
                          margin: "0 0 5px 0",
                          fontSize: "17px",
                          textAlign: "center",
                        }}
                      >
                        Select Transit Terminal
                      </h3>

                      <div className="terminal-selector">
                        <label>Terminal:</label>
                        <select
                          value={selectedTerminalId}
                          onChange={(e) =>
                            setSelectedTerminalId(Number(e.target.value))
                          }
                          disabled={isSpending}
                        >
                          {terminals.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name ? t.name : `Terminal #${t.id}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          margin: "10px 0",
                          background: "#ffffff",
                          borderRadius: "14px",
                          padding: "12px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
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
                            display: "block",
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
                          opacity: isSpending ? 0.7 : 1,
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
                      <img
                        src={busImg}
                        alt="Bus"
                        style={{
                          width: "32px",
                          height: "auto",
                          objectFit: "contain",
                        }}
                      />
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
              <p>
                Get your personal Istanbulkart now to enjoy the city transit.
              </p>
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

      {/* --- TWITTER TARZI SAĞ ALT AI ASİSTAN BUTONU VE SOHBET PENCERESİ --- */}
      <FloatingAiContainer>
        {isAiChatOpen && (
          <AiChatPopup>
            <div className="chat-header">
              <h4>🤖 Istanbulkart AI Advisor</h4>
              <button onClick={() => setIsAiChatOpen(false)}>×</button>
            </div>
            <div className="chat-body">
              <div className="ai-message-bubble">{aiMessage}</div>
            </div>
            <div className="chat-footer">
              <input
                type="text"
                placeholder=" Ask something to AI (e.g.,Is subscription more cost-effective ?)..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && chatInput.trim() !== "") {
                    const userQuestion = chatInput.toLowerCase();
                    setChatInput(""); // Kutuyu temizle

                    // Önce maliyet/avantaj kıyaslamasını kontrol ediyoruz
                    if (
                      userQuestion.includes("cost") ||
                      userQuestion.includes("effective") ||
                      userQuestion.includes("cheaper") ||
                      userQuestion.includes("better") ||
                      userQuestion.includes("hesaplı") ||
                      userQuestion.includes("avantajlı")
                    ) {
                      setAiMessage(
                        `🤖 AI Analysis: Yes, if you use public transit frequently, a monthly subscription is much more affordable and saves you up to 30%! I recommend getting a new subscription once your current ${subscription} passes run out.`,
                      );
                    } else if (
                      userQuestion.includes("balance") ||
                      userQuestion.includes("bakiye") ||
                      userQuestion.includes("money") ||
                      userQuestion.includes("para")
                    ) {
                      setAiMessage(
                        `🤖 AI Analysis: Your current balance is ₺${balance}. You can easily top it up whenever you need.`,
                      );
                    } else if (
                      userQuestion.includes("abonman") ||
                      userQuestion.includes("subscription") ||
                      userQuestion.includes("pass") ||
                      userQuestion.includes("biniş")
                    ) {
                      setAiMessage(
                        `🤖 AI Analysis: Your remaining subscription balance is: ${subscription} passes.`,
                      );
                    } else {
                      setAiMessage(
                        `🤖 AI Analysis: Regarding "${userQuestion}", your card and travel plan status look totally healthy and good to go!`,
                      );
                    }
                  }
                }}
              />
            </div>
          </AiChatPopup>
        )}

        <AiFloatingButton
          onClick={() => setIsAiChatOpen(!isAiChatOpen)}
          title="AI Asistan"
        >
          <svg
            height="1.6em"
            fill="white"
            xmlSpace="preserve"
            viewBox="0 0 1000 1000"
            y="0px"
            x="0px"
            version="1.1"
          >
            <path d="M881.1,720.5H434.7L173.3,941V720.5h-54.4C58.8,720.5,10,671.1,10,610.2v-441C10,108.4,58.8,59,118.9,59h762.2C941.2,59,990,108.4,990,169.3v441C990,671.1,941.2,720.5,881.1,720.5L881.1,720.5z M935.6,169.3c0-30.4-24.4-55.2-54.5-55.2H118.9c-30.1,0-54.5,24.7-54.5,55.2v441c0,30.4,24.4,55.1,54.5,55.1h54.4h54.4v110.3l163.3-110.2H500h381.1c30.1,0,54.5-24.7,54.5-55.1V169.3L935.6,169.3z M717.8,444.8c-30.1,0-54.4-24.7-54.4-55.1c0-30.4,24.3-55.2,54.4-55.2c30.1,0,54.5,24.7,54.5,55.2C772.2,420.2,747.8,444.8,717.8,444.8L717.8,444.8z M500,444.8c-30.1,0-54.4-24.7-54.4-55.1c0-30.4,24.3-55.2,54.4-55.2c30.1,0,54.4,24.7,54.4,55.2C554.4,420.2,530.1,444.8,500,444.8L500,444.8z M282.2,444.8c-30.1,0-54.5-24.7-54.5-55.1c0-30.4,24.4-55.2,54.5-55.2c30.1,0,54.4,24.7,54.4,55.2C336.7,420.2,312.3,444.8,282.2,444.8L282.2,444.8z" />
          </svg>
          <span className="tooltip">Chat</span>
        </AiFloatingButton>
      </FloatingAiContainer>
      {/* ----------------------------------------------------------------- */}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </span>
        </div>
      </div>
    </StyledWrapper>
  );
};

const FloatingAiContainer = styled.div`
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: "Arial", sans-serif;
`;

const AiFloatingButton = styled.button`
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background-color: #ffe53b;
  background-image: linear-gradient(147deg, #ffe53b, #ff2525, #ffe53b);
  cursor: pointer;
  padding-top: 3px;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.164);
  position: relative;
  background-size: 300%;
  background-position: left;
  transition-duration: 1s;

  svg {
    height: 1.6em;
    fill: white;
  }

  .tooltip {
    position: absolute;
    right: 70px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    background-color: rgb(255, 180, 82);
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition-duration: 0.5s;
    pointer-events: none;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  &:hover .tooltip {
    opacity: 1;
    transition-duration: 0.5s;
  }

  &:hover {
    background-position: right;
    transition-duration: 1s;
    transform: scale(1.05);
  }
`;

const AiChatPopup = styled.div`
  width: 300px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  margin-bottom: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.2s ease-in-out;

  .chat-header {
    background: #0f172a;
    padding: 12px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    h4 {
      margin: 0;
      font-size: 14px;
      color: #38bdf8;
    }

    button {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 18px;
      cursor: pointer;
      &:hover {
        color: white;
      }
    }
  }

  .chat-body {
    padding: 15px;
    max-height: 200px;
    overflow-y: auto;
  }

  .ai-message-bubble {
    background: #0f172a;
    color: #e2e8f0;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 13px;
    line-height: 1.4;
    border: 1px solid rgba(56, 189, 248, 0.2);
  }

  .chat-footer {
    padding: 10px 15px;
    background: #0f172a;
    border-top: 1px solid rgba(255, 255, 255, 0.05);

    input {
      width: 100%;
      background: #1e293b;
      border: 1px solid #334155;
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      outline: none;
      box-sizing: border-box;
      cursor: text;

      &::placeholder {
        color: #94a3b8;
      }
    }
  }
`;

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
  background: #ffffff;
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
  background-color: #0f172a;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 20px;
  font-family: "Arial", sans-serif;
  position: relative;
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
const CardAndActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 320px;
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
    transition:
      transform 0.3s,
      box-shadow 0.3s;
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

const AutoTopUpPanel = styled.div`
  background: #1e1e2f;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 15px 20px;
  border-radius: 16px;
  width: 320px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  box-sizing: border-box;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .texts h4 {
    margin: 0;
    font-size: 15px;
    color: #10b981;
  }
  .texts p {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #94a3b8;
  }

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
    appearance: none;
    display: inline-block;
    border-radius: var(--size);
    border: 0;
    transition: 0.35s ease-in-out;
    box-sizing: border-box;
    cursor: pointer;
  }
  .checkbox-wrapper-5 .check label {
    width: calc(2.2 * var(--size));
    height: var(--size);
    background: #4b5563;
    overflow: hidden;
  }
  .checkbox-wrapper-5 .check input[type="checkbox"] {
    position: absolute;
    z-index: 1;
    width: calc(0.8 * var(--size));
    height: calc(0.8 * var(--size));
    top: calc(0.1 * var(--size));
    left: calc(0.1 * var(--size));
    background: linear-gradient(45deg, #dedede, #ffffff);
    box-shadow: 0 6px 7px rgba(0, 0, 0, 0.3);
    outline: none;
    margin: 0;
  }
  .checkbox-wrapper-5 .check input[type="checkbox"]:checked {
    left: calc(1.3 * var(--size));
  }
  .checkbox-wrapper-5 .check input[type="checkbox"]:checked + label {
    background: transparent;
  }
  .checkbox-wrapper-5 .check label::before,
  .checkbox-wrapper-5 .check label::after {
    content: "· ·";
    position: absolute;
    overflow: hidden;
    left: calc(0.15 * var(--size));
    top: calc(0.5 * var(--size));
    height: var(--size);
    letter-spacing: calc(-0.04 * var(--size));
    color: #9b9b9b;
    font-family: "Times New Roman", serif;
    z-index: 2;
    font-size: calc(0.6 * var(--size));
    border-radius: 0;
    transform-origin: 0 0 calc(-0.5 * var(--size));
    backface-visibility: hidden;
  }
  .checkbox-wrapper-5 .check label::after {
    content: "●";
    top: calc(0.65 * var(--size));
    left: calc(0.2 * var(--size));
    height: calc(0.1 * var(--size));
    width: calc(0.35 * var(--size));
    font-size: calc(0.2 * var(--size));
    transform-origin: 0 0 calc(-0.4 * var(--size));
  }
  .checkbox-wrapper-5 .check input[type="checkbox"]:checked + label::before,
  .checkbox-wrapper-5 .check input[type="checkbox"]:checked + label::after {
    left: calc(1.55 * var(--size));
    top: calc(0.4 * var(--size));
    line-height: calc(0.1 * var(--size));
    transform: rotateY(360deg);
  }
  .checkbox-wrapper-5 .check input[type="checkbox"]:checked + label::after {
    height: calc(0.16 * var(--size));
    top: calc(0.55 * var(--size));
    left: calc(1.6 * var(--size));
    font-size: calc(0.6 * var(--size));
    line-height: 0;
  }

  .settings-container {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .input-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #cbd5e1;
  }
  .input-group input {
    width: 60px;
    background: #0f172a;
    border: 1px solid #3b82f6;
    color: white;
    padding: 5px;
    border-radius: 6px;
    text-align: center;
    outline: none;
  }
  .btn-update {
    margin-top: 5px;
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: bold;
    transition: 0.2s;
  }
  .btn-update:hover:not(:disabled) {
    background: #2563eb;
  }
  .btn-update:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NoCardSection = styled.div`
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 50px 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
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
    border-radius: 0.25em;
    line-height: var(--tooltip-height);
    bottom: calc(var(--height) + var(--gap-between-tooltip-to-button) + 10px);
    left: calc(50% - var(--tooltip-width) / 2);
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s;
  }
  .button::after {
    position: absolute;
    content: "";
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
  .button:hover::before,
  .button:hover::after {
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